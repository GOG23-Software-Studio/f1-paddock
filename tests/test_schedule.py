from copy import deepcopy

import pytest

from custom_components.f1_paddock.api import F1Client, F1Error
from custom_components.f1_paddock.models import roster
from custom_components.f1_paddock.schedule import normalize_schedule
from tests.test_api import Response, Session


def published():
    return {"round_number": {"test": 0, "race": 21}, "event_name": {"race": "Las Vegas Grand Prix"},
            "country": {"race": "United States"}, "location": {"race": "Las Vegas"}, "gmt_offset": {"race": "-08:00"},
            "session4": {"race": "Qualifying"}, "session4_date": {"race": "2026-11-20T20:00:00"},
            "session5": {"race": "Race"}, "session5_date": {"race": "2026-11-21T20:00:00"}}


def test_real_rounds_timezone_and_verified_maps(assets):
    calendar = normalize_schedule(published(), 2026, assets)
    assert len(calendar) == 1
    race = calendar[0]
    assert race["round"] == 21 and race["season"] == 2026
    assert race["start"] == "2026-11-22T04:00:00+00:00"
    assert race["date"] == "2026-11-22"
    assert race["sessions"][0]["start"] == "2026-11-21T04:00:00+00:00"
    assert race["circuit_id"] == "vegas" and race["map"] == assets["circuits"]["vegas"]["url"]
    assert race["source"] == "FastF1"


def test_rejects_wrong_year_missing_timezone_and_duplicate_rounds(assets):
    with pytest.raises(ValueError, match="year"):
        normalize_schedule(published(), 2025, assets)
    data = published()
    data.pop("gmt_offset")
    with pytest.raises(ValueError, match="timezone"):
        normalize_schedule(data, 2026, assets)
    data = published()
    data["round_number"]["duplicate"] = 21
    with pytest.raises(ValueError, match="duplicate"):
        normalize_schedule(data, 2026, assets)
    data = published()
    data["session5_date"]["race"] = None
    with pytest.raises(ValueError, match="race time"):
        normalize_schedule(data, 2026, assets)


async def test_backup_has_own_cache_and_is_not_blocked_by_jolpica(assets):
    class JsonResponse(Response):
        async def json(self, **kwargs):
            return deepcopy(self.payload)
    session = Session(JsonResponse(published()))
    client = F1Client(session)
    client._blocked_until = float("inf")
    first = await client.calendar_fallback(2026, assets)
    assert await client.calendar_fallback(2026, assets) == first
    assert session.calls == 1
    assert client.sources["2026/calendar_fallback"]["provider"] == "FastF1"
    assert not client.cache  # Backup cannot masquerade as Jolpica results.
    with pytest.raises(F1Error):
        await client.get("2026/last/results")


def test_roster_keeps_alonso_without_inventing_standings(assets):
    drivers = roster(assets, 2026)
    alonso = next(d for d in drivers if d["id"] == "alonso")
    assert alonso["name"] == "Fernando Alonso" and alonso["number"] == 14 and alonso["photo"]
    assert all(d["position"] is None and d["points"] is None for d in drivers)
    assert roster(assets, 2023) == []
