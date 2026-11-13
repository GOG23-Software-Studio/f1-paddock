"""Probe public F1 SignalR; persist sports data only, never connection tokens."""
import asyncio
import json
from pathlib import Path

import aiohttp


async def main():
    root = Path(__file__).resolve().parents[1]
    async with aiohttp.ClientSession(headers={"User-Agent": "BestHTTP"}) as session:
        url = "https://livetiming.formula1.com/signalrcore"
        async with session.post(url + "/negotiate", params={"negotiateVersion": 1}, timeout=aiohttp.ClientTimeout(total=20)) as response:
            print("negotiate", response.status, flush=True)
            response.raise_for_status()
            data = await response.json()
        async with session.ws_connect(url.replace("https:", "wss:"), params={"id": data["connectionToken"]}, timeout=aiohttp.ClientWSTimeout(ws_close=5)) as ws:
            await ws.send_str(json.dumps({"protocol": "json", "version": 1}) + "\x1e")
            print("handshake", (await ws.receive(timeout=15)).data, flush=True)
            await ws.send_str(json.dumps({"type": 1, "target": "Subscribe", "arguments": [["SessionInfo", "SessionStatus", "TimingData", "TimingAppData", "DriverList", "LapCount", "TrackStatus", "Heartbeat"]], "invocationId": "0"}) + "\x1e")
            for _ in range(5):
                msg = await ws.receive(timeout=15)
                if msg.type != aiohttp.WSMsgType.TEXT:
                    print("closed", msg.type)
                    break
                for record in msg.data.split("\x1e"):
                    if not record:
                        continue
                    obj = json.loads(record)
                    if obj.get("type") == 3:
                        payload = obj.get("result", {})
                        (root / "tests" / "fixtures" / "live_public.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                        print("snapshot keys", list(payload), flush=True)
                        print("session", json.dumps(payload.get("SessionInfo", {})), flush=True)
                        print("timing lines", len(payload.get("TimingData", {}).get("Lines", {})), flush=True)
                        return
                    if obj.get("type") == 6:
                        await ws.send_str('{"type":6}\x1e')


if __name__ == "__main__":
    asyncio.run(main())
