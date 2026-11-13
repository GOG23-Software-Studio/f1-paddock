from datetime import datetime, timezone

import pytest

from custom_components.f1_paddock.models import driver, driver_standings, event, instant, next_event, numeric, races, result


def test_missing_values_are_not_zero():
    for v in [None, "", "not available", "NaN", "inf"]:
        assert numeric(v) is None
    assert numeric("0") == 0
    assert instant("2026-11-22") is None
    assert instant("2026-11-22", "04:00:00Z") == "2026-11-22T04:00:00+00:00"


def test_real_calendar_and_exact_circuit_mapping(fixture, assets):
    calendar = [event(r, assets) for r in races(fixture("calendar"))]
    assert len(calendar) == 23
    vegas = next(r for r in calendar if r["circuit_id"] == "vegas")
    assert "lasvegasdetailed" in vegas["map"]
    assert next(s for s in vegas["sessions"] if s["code"] == "FP1")["start"] == "2026-11-20T00:30:00+00:00"
    assert next_event(calendar, datetime(2026, 11, 12, tzinfo=timezone.utc))["round"] == 21
    assert next_event(calendar, datetime(2027, 1, 1, tzinfo=timezone.utc)) is None


def test_future_or_wrong_map_not_reused(fixture, assets):
    r = races(fixture("calendar"))[0]
    r["season"] = "2027"
    assert event(r, assets)["map"] is None
    r["season"] = "2026"
    r["Circuit"]["circuitName"] = "Different circuit layout"
    assert event(r, assets)["map"] is None


def test_current_driver_identity_and_number(fixture, assets):
    ds = driver_standings(fixture("standings"), assets, 2026)
    maxv = next(d for d in ds if d["id"] == "max_verstappen")
    assert maxv["number"] == 3  # No hardcoded old champion's number.
    assert maxv["photo"] and maxv["deficit"] == 111
    assert ds[0]["deficit"] == 0
    raw = {"driverId": "someone_else", "code": "VER", "givenName": "Different", "familyName": "Person"}
    assert driver(raw, assets, 2026)["photo"] is None


def test_results_never_cross_gp_or_season(fixture, assets):
    raw = fixture("last_race")
    with pytest.raises(ValueError):
        result(raw, "RAC", assets, 2026, 21)
    with pytest.raises(ValueError):
        result(raw, "RAC", assets, 2025, 20)
    r = result(raw, "RAC", assets, 2026, 20)
    assert r["rows"][0]["id"] == "norris"
    assert r["rows"][0]["number"] == 1
    assert r["rows"][0]["points"] == 25
    assert r["event"]["round"] == 20


def test_sprint_absence_and_q_segments(fixture, assets):
    r = result(fixture("sprint"), "SPR", assets, 2026, 20)
    assert r["available"] is False and r["rows"] == []
    q = result(fixture("qualifying"), "QUAL", assets, 2026, 20)
    assert q["available"]
    assert any(r["q3"] for r in q["rows"])
    assert any(r["q3"] is None for r in q["rows"])
    assert all(r["points"] is None for r in q["rows"])


def test_number_art_is_official_and_never_reused_for_another_number(fixture, assets):
    alonso = next(r["Driver"] for r in fixture("standings")["MRData"]["StandingsTable"]["StandingsLists"][0]["DriverStandings"] if r["Driver"]["driverId"] == "alonso")
    d = driver(alonso, assets, 2026)
    assert "numberwhite.webp" in d["number_art"]
    assert d["number_art_source"] == "https://www.formula1.com/en/drivers/fernando-alonso"
    assert driver(alonso, assets, 2026, 99)["number_art"] is None
    assert driver(alonso, assets, 2025)["number_art"] is None
