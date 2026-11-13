import copy
from datetime import datetime, timezone

from custom_components.f1_paddock.live import F1LiveState, merge
from custom_components.f1_paddock.models import driver_standings


def test_actual_public_snapshot_not_live_after_session_finished(fixture, assets):
    state = F1LiveState()
    state.connected = True
    state.initial(fixture("live_public"))
    data = state.snapshot(driver_standings(fixture("standings"), assets, 2026), 2026)
    assert data["phase"] == "finished"
    assert not data["live"]
    assert len(data["rows"]) == 22
    norris = next(r for r in data["rows"] if r["code"] == "NOR")
    assert norris["id"] == "norris"
    assert norris["pit_count"] == 3
    assert norris["tyre"]["compound"] == "INTERMEDIATE"
    assert norris["tyre"]["age"] == 9
    assert norris["last_lap"] == "1:27.621"
    assert not norris["in_pit"]


def active_state(fixture):
    state = F1LiveState()
    state.initial(fixture("live_public"))
    state.connected = True
    state.apply("SessionInfo", {"StartDate": "2026-11-08T14:00:00", "EndDate": "2026-11-08T16:00:00"})
    state.apply("SessionStatus", {"Status": "Started"})
    state.timing_at = "2026-11-08T17:30:00Z"
    return state


def test_live_needs_active_session_fresh_source_and_connection(fixture):
    state = active_state(fixture)
    now = datetime(2026, 11, 8, 17, 30, 30, tzinfo=timezone.utc)
    assert state.snapshot([], 2026, now)["phase"] == "live"
    state.connected = False
    assert state.snapshot([], 2026, now)["phase"] == "stale"
    state.connected = True
    state.timing_at = "2026-11-08T17:28:00Z"
    assert state.snapshot([], 2026, now)["phase"] == "stale"
    assert state.snapshot([], 2025, now)["live"] is False
    assert state.snapshot([], 2025, now)["rows"] == []


def test_recursive_delta_preserves_other_drivers_and_stints(fixture):
    state = F1LiveState()
    state.initial(fixture("live_public"))
    before = copy.deepcopy(state.topics)
    state.apply("TimingData", {"Lines": {"1": {"LastLapTime": {"Value": "1:20.123"}, "NumberOfPitStops": 4}}}, "2026-11-08T17:30:00Z")
    assert state.topics["TimingData"]["Lines"]["1"]["BestLapTime"] == before["TimingData"]["Lines"]["1"]["BestLapTime"]
    assert state.topics["TimingData"]["Lines"]["3"] == before["TimingData"]["Lines"]["3"]
    state.apply("TimingAppData", {"Lines": {"1": {"Stints": {"3": {"TotalLaps": 10}}}}})
    assert state.topics["TimingAppData"]["Lines"]["1"]["Stints"][3]["Compound"] == "INTERMEDIATE"
    assert state.topics["TimingAppData"]["Lines"]["1"]["Stints"][3]["TotalLaps"] == 10


def test_new_session_clears_old_timing_tyres_pits(fixture):
    state = active_state(fixture)
    state.pits = [{"number": 1}]
    state.pits_session = 11412
    state.apply("SessionInfo", {"Key": 99999, "Name": "Practice 1"})
    assert "TimingData" not in state.topics
    assert "TimingAppData" not in state.topics
    assert state.pits == []
    assert state.timing_at is None


def test_reconnect_snapshot_replaces_old_values_and_wrong_number_has_no_portrait(fixture, assets):
    state = active_state(fixture)
    state.apply("TimingData", {"Lines": {"999": {"Position": "99"}}})
    data = fixture("live_public")
    data["DriverList"]["1"]["Tla"] = "VER"  # A reused number must not lend Verstappen's portrait.
    state.initial(data)
    rows = state.snapshot(driver_standings(fixture("standings"), assets, 2026), 2026)["rows"]
    assert not any(r["number"] == 999 for r in rows)
    assert not next(r for r in rows if r["number"] == 1).get("photo")


def test_missing_pit_counts_and_tyre_data_stay_missing(fixture):
    state = F1LiveState()
    data = fixture("live_public")
    del data["TimingData"]["Lines"]["1"]["NumberOfPitStops"]
    data["TimingAppData"]["Lines"]["1"] = {}
    state.initial(data)
    row = next(r for r in state.snapshot([], 2026)["rows"] if r["number"] == 1)
    assert row["pit_count"] is None and row["tyre"] is None
    assert merge({"value": 1}, {"value": None}) == {}


def test_timing_marks_are_explicit_and_sparse_sectors_keep_their_index(fixture):
    state = F1LiveState()
    state.initial(fixture("live_public"))
    received = state.timing_received_at
    state.apply("Heartbeat", {"Utc": "2026-11-08T19:10:00Z"})
    assert state.timing_received_at == received
    state.topics["TimingData"]["Lines"]["1"]["Sectors"] = {
        "1": {"Value": "28.100", "OverallFastest": True, "PersonalFastest": True},
        "2": {"Value": "24.100", "OverallFastest": False, "PersonalFastest": True},
    }
    state.topics["TimingData"]["Lines"]["1"]["LastLapTime"] = {"Value": "1:20.000"}
    data = state.snapshot([], 2026)
    row = next(r for r in data["rows"] if r["number"] == 1)
    assert row["sectors"] == [None, "28.100", "24.100"]
    assert row["sector_marks"] == [None, "overall", "personal"]
    assert row["last_lap_mark"] is None
    assert data["timing_received_at"] == received
    state.apply("SessionInfo", {"Key": 999999})
    assert state.timing_received_at is None
