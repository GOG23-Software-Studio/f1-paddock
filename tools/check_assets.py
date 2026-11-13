"""Verify the original F1 resources and retain private preview copies."""
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".local" / "assets"
OUT.mkdir(parents=True, exist_ok=True)
FIX = ROOT / "tests" / "fixtures"
MAPS = {
    "albert_park": "melbourne", "shanghai": "shanghai", "suzuka": "suzuka",
    "miami": "miami", "villeneuve": "montreal", "monaco": "montecarlo",
    "catalunya": "catalunya", "red_bull_ring": "spielberg", "silverstone": "silverstone",
    "spa": "spafrancorchamps", "hungaroring": "hungaroring", "zandvoort": "zandvoort",
    "monza": "monza", "madring": "madring", "baku": "baku", "sepang": "kualalumpur",
    "marina_bay": "singapore", "americas": "austin", "rodriguez": "mexicocity",
    "interlagos": "interlagos", "vegas": "lasvegas", "losail": "lusail", "yas_marina": "yasmarina",
}
report = []
catalog = {"circuits": {}, "drivers": {}, "font": {}}

def check(key, url, name):
    try:
        with urlopen(Request(url, headers={"User-Agent": "Mozilla/5.0 F1Paddock source check"}), timeout=20) as r:
            mime = r.headers.get_content_type()
            raw = r.read()
            ok = mime.startswith("image/") or "font" in mime or name.endswith("woff") and raw[:4] in [b"wOFF", b"wOF2"]
            report.append({"key": key, "url": url, "status": r.status, "mime": mime, "verified": ok})
            if ok:
                (OUT / name).write_bytes(raw)
                return {"url": url, "source": "Formula1.com", "verified_at": datetime.now(timezone.utc).isoformat(), "preview_file": name}
    except Exception as exc:
        report.append({"key": key, "url": url, "error": str(exc), "verified": False})
    return None

if __name__ == "__main__":
    races = json.loads((FIX / "calendar.json").read_text(encoding="utf-8"))["MRData"]["RaceTable"]["Races"]
    for r in races:
        cid = r["Circuit"]["circuitId"]
        slug = MAPS.get(cid)
        if slug:
            url = f"https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000001/common/f1/2026/track/2026track{slug}detailed.webp"
            asset = check(cid, url, cid + ".webp")
            if asset:
                catalog["circuits"][cid] = {**asset, "season": 2026, "circuit_name": r["Circuit"]["circuitName"]}
    for d in json.loads((FIX / "openf1_drivers.json").read_text(encoding="utf-8")):
        if d.get("headshot_url"):
            asset = check(d["name_acronym"], d["headshot_url"], d["name_acronym"] + ".png")
            if asset:
                catalog["drivers"][d["name_acronym"]] = {**asset, "season": 2026, "name": d["full_name"], "number": d["driver_number"], "color": d.get("team_colour")}
    asset = check("font", "https://www.formula1.com/etc/designs/fom-website/fonts/F1Bold/Formula1-Bold.woff", "Formula1-Bold.woff")
    if asset:
        catalog["font"] = asset
    (ROOT / "asset-audit.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    component = ROOT / "custom_components" / "f1_paddock"
    component.mkdir(parents=True, exist_ok=True)
    (component / "assets.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"circuits": list(catalog["circuits"]), "photos": len(catalog["drivers"]), "font": bool(catalog["font"]), "failures": [r for r in report if not r["verified"]]}, indent=2))
