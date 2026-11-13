"""Provider normalization. Missing values remain None; results retain GP/session identity."""
import unicodedata
from datetime import datetime, timedelta, timezone

SESSIONS = {"FirstPractice": ("FP1", "Libres 1"), "SecondPractice": ("FP2", "Libres 2"),
            "ThirdPractice": ("FP3", "Libres 3"), "SprintQualifying": ("SQ", "Clasificación sprint"),
            "Sprint": ("SPR", "Sprint"), "Qualifying": ("QUAL", "Clasificación")}


def numeric(value):
    try:
        n = float(value)
        return int(n) if n.is_integer() else n if n == n and abs(n) != float("inf") else None
    except (TypeError, ValueError, OverflowError):
        return None


def instant(date, time=None):
    if not date or not time:
        return None
    try:
        d = datetime.fromisoformat(f"{date}T{time}".replace("Z", "+00:00"))
        return d.astimezone(timezone.utc).isoformat() if d.tzinfo else None
    except ValueError:
        return None


def races(payload):
    return payload.get("MRData", {}).get("RaceTable", {}).get("Races", [])


def standings_list(payload, key):
    lists = payload.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
    return lists[0].get(key, []) if lists else []


def driver(raw, assets, season, result_number=None):
    code = raw.get("code", "")
    name = " ".join(filter(None, [raw.get("givenName"), raw.get("familyName")]))
    asset = assets.get("drivers", {}).get(code, {})
    # Match both code and name; a reused acronym never lends another driver's portrait.
    def norm(value):
        text = "".join(c for c in unicodedata.normalize("NFKD", str(value)) if not unicodedata.combining(c))
        return " ".join(text.casefold().split())
    # Verified provider spelling difference for this driver's full given names.
    aliases = {"antonelli": {"andrea kimi antonelli", "kimi antonelli"}}
    matching_name = norm(asset.get("name")) == norm(name) or (
        norm(asset.get("name")) in aliases.get(raw.get("driverId"), set())
        and norm(name) in aliases.get(raw.get("driverId"), set())
    )
    if asset.get("season") != season or not matching_name:
        asset = {}
    number = numeric(result_number if result_number is not None else raw.get("permanentNumber"))
    number_art = asset.get("number_art") or {}
    if number_art.get("number") != number or number_art.get("season") != season:
        number_art = {}
    return {"id": raw.get("driverId"), "name": name, "code": code,
            "number": number, "number_art": number_art.get("url"), "number_art_source": number_art.get("source_page"),
            "photo": asset.get("url"), "color": asset.get("color"),
            "photo_source": asset.get("source"), "photo_verified_at": asset.get("verified_at")}


def event(raw, assets):
    season = int(raw["season"])
    circuit = raw.get("Circuit", {})
    location = circuit.get("Location", {})
    asset = assets.get("circuits", {}).get(circuit.get("circuitId"), {})
    if asset.get("season") != season or asset.get("circuit_name") != circuit.get("circuitName"):
        asset = {}
    sessions = []
    for key, (code, name) in SESSIONS.items():
        value = raw.get(key)
        if value:
            sessions.append({"code": code, "name": name, "date": value.get("date"), "start": instant(value.get("date"), value.get("time"))})
    start = instant(raw.get("date"), raw.get("time"))
    sessions.append({"code": "RAC", "name": "Carrera", "date": raw.get("date"), "start": start})
    sessions.sort(key=lambda s: s.get("start") or s.get("date") or "9999")
    return {"id": f"{season}-{raw['round']}", "season": season, "round": int(raw["round"]),
            "name": raw.get("raceName"), "date": raw.get("date"), "start": start,
            "circuit_id": circuit.get("circuitId"), "circuit": circuit.get("circuitName"),
            "city": location.get("locality"), "country": location.get("country"),
            "map": asset.get("url"), "map_source": asset.get("source"), "map_verified_at": asset.get("verified_at"),
            "sessions": sessions}


def driver_standings(payload, assets, season):
    rows = []
    for r in standings_list(payload, "DriverStandings"):
        team = (r.get("Constructors") or [{}])[-1]
        rows.append({**driver(r["Driver"], assets, season), "position": numeric(r.get("position")),
                     "points": numeric(r.get("points")), "wins": numeric(r.get("wins")),
                     "team": team.get("name"), "team_id": team.get("constructorId")})
    leader = max((r["points"] for r in rows if r["points"] is not None), default=None)
    for r in rows:
        r["deficit"] = leader - r["points"] if leader is not None and r["points"] is not None else None
    return rows


def constructors(payload):
    return [{"id": r["Constructor"]["constructorId"], "name": r["Constructor"]["name"],
             "position": numeric(r.get("position")), "points": numeric(r.get("points")), "wins": numeric(r.get("wins"))}
            for r in standings_list(payload, "ConstructorStandings")]


def result(payload, code, assets, season, expected_round):
    entries = races(payload)
    if not entries:
        return {"code": code, "available": False, "rows": [], "round": expected_round, "season": season}
    raw = entries[0]
    if int(raw["season"]) != season or int(raw["round"]) != expected_round:
        raise ValueError("Result GP or season differs from requested identity")
    field = {"RAC": "Results", "QUAL": "QualifyingResults", "SPR": "SprintResults"}[code]
    rows = []
    for r in raw.get(field, []):
        rows.append({**driver(r["Driver"], assets, season, r.get("number")),
                     "position": numeric(r.get("position")), "position_text": r.get("positionText"),
                     "team": r.get("Constructor", {}).get("name"), "points": numeric(r.get("points")),
                     "grid": numeric(r.get("grid")), "laps": numeric(r.get("laps")), "status": r.get("status"),
                     "time": r.get("Time", {}).get("time"), "q1": r.get("Q1"), "q2": r.get("Q2"), "q3": r.get("Q3"),
                     "fastest_lap": r.get("FastestLap", {}).get("Time", {}).get("time")})
    return {"code": code, "available": bool(rows), "rows": rows, "round": expected_round, "season": season,
            "event": event(raw, assets), "source": "Jolpica", "date": raw.get("date")}


def next_event(calendar, now=None):
    now = now or datetime.now(timezone.utc)
    for e in calendar:
        if e.get("start") and datetime.fromisoformat(e["start"]) + timedelta(hours=4) > now:
            return e
        if not e.get("start") and e.get("date", "") >= now.date().isoformat():
            return e
    return None
