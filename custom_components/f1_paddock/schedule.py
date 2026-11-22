"""Independent, published FastF1 schedule; never synthesize race results."""
from datetime import datetime, timezone

from .models import event

SCHEDULE_URL = "https://raw.githubusercontent.com/theOehrly/f1schedule/master/schedule_{season}.json"
SESSION_CODES = {"Practice 1": ("FP1", "Libres 1"), "Practice 2": ("FP2", "Libres 2"),
                 "Practice 3": ("FP3", "Libres 3"), "Qualifying": ("QUAL", "Clasificación"),
                 "Sprint Qualifying": ("SQ", "Clasificación sprint"), "Sprint Shootout": ("SQ", "Clasificación sprint"),
                 "Sprint": ("SPR", "Sprint"), "Race": ("RAC", "Carrera")}
# Location identity, not calendar position: rounds may be cancelled or rescheduled.
CIRCUITS = {"Melbourne": "albert_park", "Shanghai": "shanghai", "Suzuka": "suzuka", "Miami Gardens": "miami",
            "Montréal": "villeneuve", "Monte Carlo": "monaco", "Barcelona": "catalunya", "Spielberg": "red_bull_ring",
            "Silverstone": "silverstone", "Spa-Francorchamps": "spa", "Budapest": "hungaroring", "Zandvoort": "zandvoort",
            "Monza": "monza", "Madrid": "madring", "Baku": "baku", "Kuala Lumpur": "sepang", "Marina Bay": "marina_bay",
            "Austin": "americas", "Mexico City": "rodriguez", "São Paulo": "interlagos", "Las Vegas": "vegas",
            "Lusail": "losail", "Yas Marina": "yas_marina", "Sakhir": "bahrain", "Jeddah": "jeddah", "Imola": "imola"}


def normalize_schedule(payload, season, assets):
    """Validate year, unique round and timezone before exposing a backup schedule."""
    if not isinstance(payload, dict) or not isinstance(payload.get("round_number"), dict):
        raise ValueError("Invalid FastF1 schedule")
    calendar, seen = [], set()
    for key, round_number in payload["round_number"].items():
        if not isinstance(round_number, int) or isinstance(round_number, bool):
            raise ValueError("Invalid round")
        if round_number == 0:  # Pre-season tests are not Grands Prix.
            continue
        if round_number < 1 or round_number in seen:
            raise ValueError("Invalid or duplicate round")
        seen.add(round_number)
        def value(field):
            return payload.get(field, {}).get(key)
        offset = value("gmt_offset")
        sessions = []
        for index in range(1, 6):
            code = SESSION_CODES.get(value(f"session{index}"))
            local = value(f"session{index}_date")
            if not code or not local:
                continue
            start = datetime.fromisoformat(local)
            if start.year != season:
                raise ValueError("Schedule year does not match requested season")
            if start.tzinfo is None:
                if not isinstance(offset, str):
                    raise ValueError("Missing session timezone")
                start = datetime.fromisoformat(local + offset)
            start = start.astimezone(timezone.utc)
            sessions.append({"code": code[0], "name": code[1], "date": start.date().isoformat(), "start": start.isoformat()})
        race = next((s for s in sessions if s["code"] == "RAC"), None)
        if not race or not value("event_name"):
            raise ValueError("Published race time is missing")
        circuit_id = CIRCUITS.get(value("location"))
        asset = assets.get("circuits", {}).get(circuit_id, {})
        raw = {"season": str(season), "round": str(round_number), "raceName": value("event_name"),
               "date": race["date"], "Circuit": {"circuitId": circuit_id,
               "circuitName": asset.get("circuit_name") or value("location"),
               "Location": {"locality": value("location"), "country": value("country")}}}
        normalized = event(raw, assets)
        normalized.update(start=race["start"], sessions=sorted(sessions, key=lambda s: s["start"]), source="FastF1")
        calendar.append(normalized)
    if not calendar:
        raise ValueError("Empty FastF1 schedule")
    return sorted(calendar, key=lambda e: e["round"])
