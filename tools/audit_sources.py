"""Read-only, reproducible source checks. Saves public JSON samples, never credentials."""
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures"
FIXTURES.mkdir(parents=True, exist_ok=True)
report = []

def fetch(name, url, save=True):
    try:
        with urlopen(Request(url, headers={"User-Agent": "F1Paddock/0.1 source audit", "Accept": "application/json"}), timeout=25) as response:
            raw = response.read()
            data = json.loads(raw)
            report.append({"name": name, "url": url, "status": response.status, "bytes": len(raw)})
            if save:
                (FIXTURES / (name + ".json")).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            return data
    except Exception as exc:
        report.append({"name": name, "url": url, "error": str(exc)})
        return None

if __name__ == "__main__":
    import time
    for name, path in [("calendar", "2026"), ("standings", "2026/driverStandings"), ("constructors", "2026/constructorStandings"), ("last_race", "2026/last/results"), ("qualifying", "2026/last/qualifying"), ("sprint", "2026/last/sprint")]:
        fetch(name, f"https://api.jolpi.ca/ergast/f1/{path}.json?limit=100")
        time.sleep(1)
    fetch("f1_static_index", "https://livetiming.formula1.com/static/2026/Index.json")
    sessions = fetch("openf1_sessions", "https://api.openf1.org/v1/sessions?year=2026&session_name=Race")
    if sessions:
        past = [s for s in sessions if s.get("date_end", "") < datetime.now(timezone.utc).isoformat()]
        if past:
            key = max(past, key=lambda s: s["date_start"])["session_key"]
            fetch("openf1_drivers", f"https://api.openf1.org/v1/drivers?session_key={key}")
    repo = fetch("formulaone_repo", "https://api.github.com/repos/marcokreeft87/formulaone-card", False)
    if repo:
        tree = fetch("formulaone_tree", f"https://api.github.com/repos/marcokreeft87/formulaone-card/git/trees/{repo['default_branch']}?recursive=1", False)
        if tree:
            print("SOURCE FILES", [x["path"] for x in tree.get("tree", []) if x["path"].startswith("src/")])
    (ROOT / "source-audit.json").write_text(json.dumps({"checked_at": datetime.now(timezone.utc).isoformat(), "checks": report}, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
