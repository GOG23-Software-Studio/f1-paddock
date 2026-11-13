"""Exercise the production client against public endpoints; no HA installation."""
import asyncio
import json
import sys
from pathlib import Path
from types import SimpleNamespace

import aiohttp

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from custom_components.f1_paddock.api import F1Client  # noqa: E402
from custom_components.f1_paddock.coordinator import F1Coordinator  # noqa: E402


async def main():
    assets = json.loads((ROOT / "custom_components" / "f1_paddock" / "assets.json").read_text(encoding="utf-8"))
    async with aiohttp.ClientSession(headers={"User-Agent": "F1Paddock/0.1 public source validation"}) as session:
        client = F1Client(session)
        c = SimpleNamespace(entry=SimpleNamespace(data={"season": 2026}, options={}), client=client, assets=assets)
        snapshot = await F1Coordinator._async_update_data(c)
        assert snapshot["calendar"] and snapshot["standings"] and snapshot["last_race"]["available"]
        assert not snapshot["warnings"], snapshot["warnings"]
        assert snapshot["capabilities"]["live"] is False
        report = {"checked_at": snapshot["updated_at"], "gps": len(snapshot["calendar"]), "drivers": len(snapshot["drivers"]),
                  "official_number_graphics": sum(bool(d.get("number_art")) for d in snapshot["drivers"]),
                  "latest_result_round": snapshot["last_race"]["round"], "warnings": snapshot["warnings"],
                  "requests": len(client.sources), "sources": client.sources}
        (ROOT / "live-validation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
