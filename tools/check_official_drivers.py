"""Find graphics in official driver pages; do not guess CDN filenames."""
import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "custom_components" / "f1_paddock" / "assets.json"
OUT = ROOT / ".local" / "assets"


def get(url):
    with urlopen(Request(url, headers={"User-Agent": "Mozilla/5.0 F1Paddock resource audit"}), timeout=25) as r:
        return r.read(), r.headers.get_content_type()


def slug(text):
    text = "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c))
    return "-".join(text.lower().split())


if __name__ == "__main__":
    assets = json.loads(CATALOG.read_text(encoding="utf-8"))
    index, _ = get("https://www.formula1.com/en/drivers")
    links = set(re.findall(r"/en/drivers/([a-z-]+)", index.decode()))
    standings = json.loads((ROOT / "tests" / "fixtures" / "standings.json").read_text(encoding="utf-8"))["MRData"]["StandingsTable"]["StandingsLists"][0]["DriverStandings"]
    report = []
    for row in standings:
        d = row["Driver"]
        name = d["givenName"] + " " + d["familyName"]
        route = "kimi-antonelli" if d["driverId"] == "antonelli" else slug(name)
        if route not in links:
            report.append({"driver": name, "status": "not_in_current_official_directory"})
            continue
        page_url = "https://www.formula1.com/en/drivers/" + route
        try:
            raw, _ = get(page_url)
            text = raw.decode()
            urls = sorted(set(re.findall(r'https://media\.formula1\.com/[^\s<>"\\)]+', text)))
            number = next((u for u in urls if "/common/f1/2026/" in u and u.endswith("numberwhite.webp")), None)
            photo = next((u for u in urls if "/common/f1/2026/" in u and u.endswith("right.webp")), None)
            code = d["code"]
            asset = assets["drivers"].setdefault(code, {"name": name, "season": 2026, "number": int(d["permanentNumber"])})
            asset["name"] = name
            for kind, url in [("number_art", number), ("photo", photo)]:
                if not url:
                    continue
                data, mime = get(url)
                if not mime.startswith("image/"):
                    raise ValueError("Resource is not an image")
                file = f"{code}-{kind}.webp"
                (OUT / file).write_bytes(data)
                metadata = {"url": url, "source": "Formula1.com", "source_page": page_url,
                            "verified_at": datetime.now(timezone.utc).isoformat(), "preview_file": file,
                            "season": 2026, "number": int(d["permanentNumber"])}
                if kind == "number_art":
                    asset[kind] = metadata
                else:
                    asset.update(metadata)
            report.append({"driver": name, "page": page_url, "number": bool(number), "photo": bool(photo), "status": "verified"})
        except Exception as exc:
            report.append({"driver": name, "page": page_url, "error": str(exc)})
    CATALOG.write_text(json.dumps(assets, indent=2, ensure_ascii=False), encoding="utf-8")
    (ROOT / "official-drivers-audit.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
