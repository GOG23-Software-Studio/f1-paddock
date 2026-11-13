"""Build the private beta, HA examples and a real-data preview."""
import asyncio
import hashlib
import json
import sys
import zipfile
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from custom_components.f1_paddock.coordinator import F1Coordinator  # noqa: E402
from custom_components.f1_paddock.live import F1LiveState  # noqa: E402

COMPONENT = ROOT / "custom_components" / "f1_paddock"
FIX = ROOT / "tests" / "fixtures"


class FixtureClient:
    def __init__(self):
        self.cache, self.sources = {}, {}

    async def get(self, path, ttl=900):
        name = {"2026": "calendar", "2026/driverStandings": "standings", "2026/constructorStandings": "constructors",
                "2026/last/results": "last_race", "2026/20/results": "last_race", "2026/20/qualifying": "qualifying", "2026/20/sprint": "sprint"}[path]
        self.sources[path] = {"provider": "Jolpica", "received_at": json.loads((ROOT / "source-audit.json").read_text())["checked_at"]}
        return json.loads((FIX / (name + ".json")).read_text(encoding="utf-8"))


async def build():
    assets = json.loads((COMPONENT / "assets.json").read_text(encoding="utf-8"))
    coordinator = SimpleNamespace(entry=SimpleNamespace(data={"season": 2026}, options={}), client=FixtureClient(), assets=assets)
    snapshot = await F1Coordinator._async_update_data(coordinator)
    if (FIX / "live_public.json").exists():
        live = F1LiveState()
        live.initial(json.loads((FIX / "live_public.json").read_text(encoding="utf-8")))
        live.pits = [{"number": p.get("driver_number"), "lap": p.get("lap_number"), "date": p.get("date"),
                      "stop_seconds": p.get("stop_duration"), "lane_seconds": p.get("lane_duration", p.get("pit_duration")), "source": "OpenF1"}
                     for p in json.loads((FIX / "pit_openf1.json").read_text(encoding="utf-8"))]
        live.pits_session = live.topics["SessionInfo"]["Key"]
        snapshot["timing"] = live.snapshot(snapshot["drivers"], snapshot["season"])
    # A dated captured snapshot, not a continuously updating/live demonstration.
    snapshot["updated_at"] = json.loads((ROOT / "source-audit.json").read_text())["checked_at"]
    (FIX / "snapshot.json").write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
    preview = ROOT / "preview"
    preview.mkdir(exist_ok=True)
    replacements = {asset["url"]: "/preview-assets/" + asset["preview_file"] for group in [assets["drivers"], assets["circuits"]] for asset in group.values()}
    for asset in assets["drivers"].values():
        if asset.get("number_art"):
            number = asset["number_art"]
            replacements[number["url"]] = "/preview-assets/" + number["preview_file"]
    if assets.get("logo"):
        replacements[assets["logo"]["url"]] = "/preview-assets/" + assets["logo"]["preview_file"]
    if assets.get("font"):
        replacements[assets["font"]["url"]] = "/preview-assets/" + assets["font"]["preview_file"]
    text = json.dumps(snapshot, ensure_ascii=False)
    for remote, local in replacements.items():
        text = text.replace(remote, local)
    (preview / "snapshot.json").write_text(text, encoding="utf-8")
    examples = ROOT / "examples"
    examples.mkdir(exist_ok=True)
    (examples / "complete.yaml").write_text("type: custom:f1-paddock-card\nentity: sensor.f1_paddock_dashboard\n", encoding="utf-8")
    sections = [(3, ["next"]), (1, ["circuit", "programme", "results"]), (1, ["driver", "timing", "tyres", "standings"]), (1, ["podium", "pits", "constructors", "calendar"])]
    view = {"title": "F1 Paddock · beta", "path": "f1-paddock-beta", "icon": "mdi:flag-checkered", "type": "sections", "max_columns": 3, "sections": []}
    for span, keys in sections:
        view["sections"].append({"type": "grid", "column_span": span, "cards": [
            {"type": f"custom:f1-paddock-{key}-card", "entity": "sensor.f1_paddock_dashboard", "table_height": 430,
             "grid_options": {"columns": "full" if span == 3 else 12, "rows": "auto"}} for key in keys]})
    (examples / "sections-view.json").write_text(json.dumps(view, indent=2, ensure_ascii=False), encoding="utf-8")
    (examples / "sections-view.yaml").write_text(json.dumps(view, indent=2, ensure_ascii=False), encoding="utf-8")
    dist = ROOT / "dist"
    dist.mkdir(exist_ok=True)
    archive = dist / "f1-paddock-0.1.0b4.zip"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as package:
        for base in [ROOT / "custom_components", examples]:
            for path in sorted(base.rglob("*")):
                if path.is_file() and "__pycache__" not in path.parts and path.suffix != ".pyc":
                    package.write(path, path.relative_to(ROOT))
        for name in ["README.md", "SOURCES.md", "CHANGELOG.md", "LICENSE", "THIRD_PARTY_NOTICES.md", "VALIDATION.md", "source-audit.json", "asset-audit.json", "official-drivers-audit.json", "live-validation.json"]:
            if (ROOT / name).exists():
                package.write(ROOT / name, name)
    (dist / (archive.name + ".sha256")).write_text(hashlib.sha256(archive.read_bytes()).hexdigest() + "  " + archive.name + "\n")
    print(f"Built {archive.name}: {archive.stat().st_size} bytes; {len(snapshot['calendar'])} GPs; {len(snapshot['standings'])} drivers")


if __name__ == "__main__":
    asyncio.run(build())
