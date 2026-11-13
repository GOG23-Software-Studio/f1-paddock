"""Shared snapshot. Results always use an explicit season and round."""
from datetime import datetime, timedelta, timezone

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import F1Error
from .const import CONF_ROUND, CONF_SEASON, DOMAIN
from .live import F1LiveClient
from .models import constructors, driver_standings, event, next_event, races, result


class F1Coordinator(DataUpdateCoordinator):
    def __init__(self, hass, entry, client, assets):
        import logging
        super().__init__(hass, logging.getLogger(__name__), name=DOMAIN, update_interval=timedelta(minutes=5), config_entry=entry)
        self.entry, self.client, self.assets = entry, client, assets
        self.live = F1LiveClient(client.session, self._publish_live)
        self.live.watch = self._watch_live

    def _watch_live(self):
        now = datetime.now(timezone.utc)
        for event_data in (self.data or {}).get("calendar", []):
            for session in event_data.get("sessions", []):
                if session.get("start"):
                    start = datetime.fromisoformat(session["start"])
                    if start - timedelta(minutes=15) <= now <= start + timedelta(hours=3):
                        return True
        return False

    def _publish_live(self, state):
        if self.data:
            timing = state.snapshot(self.data["drivers"], int(self.entry.data[CONF_SEASON]))
            self.async_set_updated_data({**self.data, "timing": timing,
                                        "capabilities": {**self.data["capabilities"], "live": timing["live"]}})

    async def _async_update_data(self):
        season = int(self.entry.data[CONF_SEASON])
        warnings = []
        payloads = {}
        async def read(key, path, ttl=900):
            try:
                payloads[key] = await self.client.get(path, ttl)
            except F1Error:
                if path in self.client.cache:
                    payloads[key] = self.client.cache[path][1]
                    warnings.append(f"{key}:cached")
                else:
                    warnings.append(f"{key}:unavailable")
                    payloads[key] = {}
            return payloads[key]
        raw_calendar = await read("calendar", str(season), 21600)
        if not races(raw_calendar):
            raise UpdateFailed("Calendar unavailable or season not yet published")
        calendar = [event(r, self.assets) for r in races(raw_calendar)]
        calendar.sort(key=lambda e: e["round"])
        standing_payload = await read("standings", f"{season}/driverStandings")
        standings = driver_standings(standing_payload, self.assets, season)
        team_payload = await read("constructors", f"{season}/constructorStandings")
        latest_payload = await read("last_race", f"{season}/last/results")
        latest = races(latest_payload)
        last_round = int(latest[0]["round"]) if latest else None
        selected_round = self.entry.options.get(CONF_ROUND) or last_round or calendar[0]["round"]
        valid_rounds = {e["round"] for e in calendar}
        if selected_round not in valid_rounds:
            selected_round = last_round or calendar[0]["round"]
        results = []
        for code, endpoint in [("RAC", "results"), ("QUAL", "qualifying"), ("SPR", "sprint")]:
            payload = await read(f"result_{code}", f"{season}/{selected_round}/{endpoint}")
            try:
                results.append(result(payload, code, self.assets, season, selected_round))
            except (ValueError, KeyError, TypeError):
                results.append({"code": code, "available": False, "rows": [], "round": selected_round, "season": season})
                warnings.append(f"result_{code}:identity_mismatch")
        podium = result(latest_payload, "RAC", self.assets, season, last_round) if last_round else None
        return {"schema_version": 1, "season": season, "updated_at": datetime.now(timezone.utc).isoformat(),
                "calendar": calendar, "event": next_event(calendar), "standings": standings,
                "standings_round": standing_payload.get("MRData", {}).get("StandingsTable", {}).get("round"),
                "constructors": constructors(team_payload), "drivers": standings,
                "results": results, "result_round": selected_round, "last_race": podium,
                "warnings": warnings, "sources": dict(self.client.sources),
                "timing": self.live.state.snapshot(standings, season) if hasattr(self, "live") else {},
                "capabilities": {"live": bool(hasattr(self, "live") and self.live.state.snapshot(standings, season)["live"]), "live_timing": True, "tyres": True, "pit_counts": True, "pit_times_live": False, "practice_results": False, "history": False},
                "logo": self.assets.get("logo", {}).get("url"), "font": self.assets.get("font", {}).get("url")}
