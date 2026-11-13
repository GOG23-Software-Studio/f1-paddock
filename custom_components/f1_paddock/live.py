"""Public F1 SignalR transport and session-scoped timing state.

No account, token storage, auth-gated feeds or browser provider requests.
"""
import asyncio
import copy
import json
import logging
from datetime import datetime, timedelta, timezone
from time import monotonic

import aiohttp

from .models import numeric

LOGGER = logging.getLogger(__name__)
BASE = "https://livetiming.formula1.com/signalrcore"
STREAMS = ["SessionInfo", "SessionStatus", "TimingData", "TimingAppData", "DriverList", "LapCount", "TrackStatus", "Heartbeat"]
SEP = "\x1e"


def merge(previous, patch):
    """F1 sends recursive object deltas, including numeric keys into arrays."""
    if isinstance(patch, dict):
        if isinstance(previous, list) and all(str(k).isdigit() for k in patch):
            result = copy.deepcopy(previous)
            for key, value in patch.items():
                index = int(key)
                if index > 200:
                    continue
                while len(result) <= index:
                    result.append({})
                result[index] = merge(result[index], value)
            return result
        result = copy.deepcopy(previous) if isinstance(previous, dict) else {}
        for key, value in patch.items():
            if key == "_kf":
                continue
            if value is None:
                result.pop(key, None)
            else:
                result[key] = merge(result.get(key), value)
        return result
    return copy.deepcopy(patch)


def timestamp(value):
    try:
        d = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return d if d.tzinfo else None
    except (ValueError, TypeError):
        return None


def session_date(info, field):
    value = info.get(field)
    if not value:
        return None
    try:
        d = datetime.fromisoformat(value)
        if d.tzinfo:
            return d
        offset = info.get("GmtOffset", "+00:00:00")
        return datetime.fromisoformat(value + offset[:6])
    except ValueError:
        return None


def indexed(value):
    if isinstance(value, list):
        return list(enumerate(value))
    if isinstance(value, dict):
        return sorted(((int(k), v) for k, v in value.items() if str(k).isdigit()), key=lambda x: x[0])
    return []


def timing_mark(value):
    """Use explicit feed flags; absence is never interpreted as a slow time."""
    if not isinstance(value, dict) or not value.get("Value"):
        return None
    if value.get("OverallFastest") is True:
        return "overall"
    if value.get("PersonalFastest") is True:
        return "personal"
    if value.get("OverallFastest") is False and value.get("PersonalFastest") is False:
        return "regular"
    return None


class F1LiveState:
    def __init__(self):
        self.topics = {}
        self.connected = False
        self.received_at = None
        self.timing_at = None
        self.timing_received_at = None
        self.pits = []
        self.pits_session = None
        self.pits_error = False

    def apply(self, topic, payload, source_time=None):
        if topic not in STREAMS or not isinstance(payload, dict):
            return
        if topic == "SessionInfo":
            old = self.topics.get(topic, {}).get("Key")
            new = payload.get("Key")
            if old is not None and new is not None and old != new:
                self.topics.clear()
                self.timing_at = None
                self.timing_received_at = None
                self.pits, self.pits_session = [], None
        self.topics[topic] = merge(self.topics.get(topic), payload)
        self.received_at = datetime.now(timezone.utc).isoformat()
        if topic == "TimingData":
            self.timing_received_at = self.received_at
            if timestamp(source_time):
                self.timing_at = source_time

    def initial(self, payload):
        # A reconnect snapshot is a fresh baseline, not a delta to an old race.
        self.topics.clear()
        self.timing_at = None
        self.timing_received_at = None
        if isinstance(payload.get("SessionInfo"), dict):
            self.apply("SessionInfo", payload["SessionInfo"])
        for topic in STREAMS:
            if topic != "SessionInfo" and isinstance(payload.get(topic), dict):
                self.apply(topic, payload[topic])
        heartbeat = self.topics.get("Heartbeat", {}).get("Utc")
        self.timing_at = heartbeat if timestamp(heartbeat) else None

    def snapshot(self, drivers, season, now=None):
        now = now or datetime.now(timezone.utc)
        info = self.topics.get("SessionInfo", {})
        start, end = session_date(info, "StartDate"), session_date(info, "EndDate")
        status = self.topics.get("SessionStatus", {}).get("Status") or info.get("SessionStatus")
        same_season = bool(start and start.year == season)
        active = status in {"Started", "Resumed"} and same_season
        window = bool(start and end and start - timedelta(hours=1) <= now <= end + timedelta(hours=3))
        source = timestamp(self.timing_at)
        recent = bool(source and -5 <= (now - source).total_seconds() <= 90)
        finished = status in {"Ends", "Ended", "Finished", "Finalised", "Finalized"}
        phase = "live" if active and window and recent and self.connected else "stale" if active else "finished" if finished and same_season else "waiting"
        by_code = {d["code"]: d for d in drivers}
        feed_drivers = self.topics.get("DriverList", {})
        lines = self.topics.get("TimingData", {}).get("Lines", {})
        app = self.topics.get("TimingAppData", {}).get("Lines", {})
        rows = []
        for number, line in lines.items() if isinstance(lines, dict) and same_season else []:
            if not str(number).isdigit() or not isinstance(line, dict):
                continue
            person = feed_drivers.get(number, {})
            candidate = by_code.get(person.get("Tla"), {})
            identity = candidate if candidate.get("number") == int(number) else {}
            stints = []
            for index, stint in indexed(app.get(number, {}).get("Stints")):
                if not isinstance(stint, dict) or not stint.get("Compound"):
                    continue
                stints.append({"index": index, "compound": stint.get("Compound"), "new": str(stint.get("New", "")).lower() == "true" if "New" in stint else None,
                               "age": numeric(stint.get("TotalLaps")), "start_age": numeric(stint.get("StartLaps"))})
            sector_data = {i: value for i, value in indexed(line.get("Sectors")) if isinstance(value, dict)}
            sectors = [(sector_data.get(i) or {}).get("Value") or None for i in range(3)]
            sector_marks = [timing_mark(sector_data.get(i)) for i in range(3)]
            rows.append({**identity, "id": identity.get("id", f"session-{info.get('Key')}-{number}"),
                         "name": person.get("FullName") or identity.get("name") or f"#{number}", "number": int(number),
                         "code": person.get("Tla"), "team": person.get("TeamName") or identity.get("team"),
                         "position": numeric(line.get("Position")), "laps": numeric(line.get("NumberOfLaps")),
                         "gap": line.get("GapToLeader") or None, "interval": (line.get("IntervalToPositionAhead") or {}).get("Value") or None,
                         "last_lap": (line.get("LastLapTime") or {}).get("Value") or None,
                         "best_lap": (line.get("BestLapTime") or {}).get("Value") or None,
                         "sectors": sectors, "sector_marks": sector_marks,
                         "last_lap_mark": timing_mark(line.get("LastLapTime")), "pit_count": numeric(line.get("NumberOfPitStops")),
                         "in_pit": bool(line.get("InPit")) if phase == "live" else False,
                         "retired": bool(line.get("Retired")), "stints": stints, "tyre": stints[-1] if stints else None})
        rows.sort(key=lambda r: (r["position"] is None, r["position"] or 999, r["number"]))
        key = info.get("Key")
        return {"session_key": key, "event": info.get("Meeting", {}).get("Name"), "name": info.get("Name"),
                "session_type": info.get("Type"), "start": start.isoformat() if start else None,
                "end": end.isoformat() if end else None, "phase": phase, "live": phase == "live", "status": status,
                "source_time": self.timing_at, "received_at": self.received_at, "timing_received_at": self.timing_received_at, "connected": self.connected,
                "rows": rows, "total_laps": numeric(self.topics.get("LapCount", {}).get("TotalLaps")),
                "reported_lap": numeric(self.topics.get("LapCount", {}).get("CurrentLap")),
                "pits": self.pits if same_season and self.pits_session == key else [], "pits_error": self.pits_error,
                "pit_times_live": False, "source": "F1 public timing", "track_status": self.topics.get("TrackStatus", {}).get("Message")}


class F1LiveClient:
    def __init__(self, session, publish):
        self.session, self.publish = session, publish
        self.state = F1LiveState()
        self.ws = None
        self._last_publish = 0
        self._pit_checked = {}
        self.watch = lambda: False

    async def close(self):
        if self.ws is not None:
            await self.ws.close()

    async def _notify(self, force=False):
        if force or monotonic() - self._last_publish >= 5:
            self._last_publish = monotonic()
            self.publish(self.state)

    async def _historical_pits(self):
        info = self.state.topics.get("SessionInfo", {})
        key = info.get("Key")
        status = self.state.topics.get("SessionStatus", {}).get("Status") or info.get("SessionStatus")
        if not isinstance(key, int) or status not in {"Ends", "Ended", "Finished", "Finalised", "Finalized"}:
            return
        if monotonic() - self._pit_checked.get(key, -99999) < 3600:
            return
        self._pit_checked[key] = monotonic()
        try:
            async with self.session.get("https://api.openf1.org/v1/pit", params={"session_key": key}, timeout=aiohttp.ClientTimeout(total=20)) as response:
                response.raise_for_status()
                data = await response.json()
            if not isinstance(data, list) or len(data) > 500:
                raise ValueError("Unexpected pit data")
            self.state.pits = [{"number": numeric(p.get("driver_number")), "lap": numeric(p.get("lap_number")),
                                "date": p.get("date"), "stop_seconds": numeric(p.get("stop_duration")),
                                "lane_seconds": numeric(p.get("lane_duration", p.get("pit_duration"))), "source": "OpenF1"}
                               for p in data if isinstance(p, dict) and p.get("session_key") == key]
            self.state.pits_session, self.state.pits_error = key, False
            if not data:
                self._pit_checked[key] = monotonic() - 3300
        except (aiohttp.ClientError, asyncio.TimeoutError, ValueError, TypeError):
            self.state.pits_error = True

    async def run(self, season):
        failures = 0
        try:
            while True:
                try:
                    async with asyncio.timeout(35):
                        async with self.session.post(BASE + "/negotiate", params={"negotiateVersion": 1}, headers={"User-Agent": "BestHTTP"}) as response:
                            response.raise_for_status()
                            negotiation = await response.json()
                        token = negotiation.get("connectionToken")
                        if not token:
                            raise ValueError("Missing connection token")
                        self.ws = await self.session.ws_connect(BASE.replace("https:", "wss:"), params={"id": token}, heartbeat=20, max_msg_size=2_000_000)
                        await self.ws.send_str(json.dumps({"protocol": "json", "version": 1}) + SEP)
                        handshake = await self.ws.receive(timeout=15)
                        if handshake.type != aiohttp.WSMsgType.TEXT:
                            raise ValueError("Handshake failed")
                        records = [json.loads(r) for r in handshake.data.split(SEP) if r]
                        if not records or records[0].get("error"):
                            raise ValueError("Handshake rejected")
                        await self.ws.send_str(json.dumps({"type": 1, "target": "Subscribe", "arguments": [STREAMS], "invocationId": "0"}) + SEP)
                    self.state.connected = True
                    idle = False
                    async for message in self.ws:
                        if message.type != aiohttp.WSMsgType.TEXT:
                            break
                        for raw in message.data.split(SEP):
                            if not raw:
                                continue
                            record = json.loads(raw)
                            if record.get("type") == 6:
                                await self.ws.send_str('{"type":6}' + SEP)
                            elif record.get("type") == 3:
                                payload = record.get("result")
                                if not isinstance(payload, dict) or record.get("error"):
                                    raise ValueError("Subscription failed")
                                self.state.initial(payload)
                                await self._historical_pits()
                                await self._notify(True)
                                failures = 0
                                state = self.state.snapshot([], season)
                                if state["phase"] not in {"live", "stale"} and not self.watch():
                                    # Recheck every five minutes off-session; no permanent idle socket.
                                    idle = True
                                    break
                            elif record.get("type") == 1 and record.get("target", "").lower() == "feed":
                                args = record.get("arguments", [])
                                if len(args) >= 2:
                                    self.state.apply(args[0], args[1], args[2] if len(args) > 2 else None)
                                    await self._notify()
                                    if args[0] == "SessionStatus" and self.state.snapshot([], season)["phase"] == "finished":
                                        await self._historical_pits()
                                        await self._notify(True)
                                        idle = True
                            elif record.get("type") == 7:
                                raise ValueError("Server ended stream")
                        if idle:
                            break
                    await self.close()
                    self.state.connected = False
                    await self._notify(True)
                    await asyncio.sleep(300 if idle else 30)
                except (aiohttp.ClientError, asyncio.TimeoutError, ValueError, KeyError, TypeError):
                    await self.close()
                    self.state.connected = False
                    await self._notify(True)
                    failures += 1
                    LOGGER.debug("Public F1 connection will retry (attempt %s)", failures)
                    await asyncio.sleep(min(900, 30 * 2 ** min(failures - 1, 5)))
        finally:
            self.state.connected = False
            await self.close()
