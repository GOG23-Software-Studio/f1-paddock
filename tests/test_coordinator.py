from types import SimpleNamespace

from custom_components.f1_paddock.api import F1Error
from custom_components.f1_paddock.coordinator import F1Coordinator


class Client:
    sources = {}

    def __init__(self, fixture, failing=None):
        self.fixture = fixture
        self.failing = failing
        self.cache = {}
        self.calls = []

    async def get(self, path, ttl=900):
        self.calls.append(path)
        if path == self.failing:
            raise F1Error("offline")
        key = {"2026": "calendar", "2026/driverStandings": "standings", "2026/constructorStandings": "constructors",
               "2026/last/results": "last_race", "2026/20/results": "last_race", "2026/20/qualifying": "qualifying", "2026/20/sprint": "sprint"}.get(path)
        return self.fixture(key) if key else {"MRData": {"RaceTable": {"Races": []}}}


async def test_requested_gp_does_not_change_last_podium(fixture, assets):
    client = Client(fixture)
    c = SimpleNamespace(entry=SimpleNamespace(data={"season": 2026}, options={"result_round": 21}), client=client, assets=assets)
    data = await F1Coordinator._async_update_data(c)
    assert data["result_round"] == 21
    assert all(r["round"] == 21 and not r["available"] for r in data["results"])
    assert data["last_race"]["round"] == 20
    assert data["capabilities"]["live"] is False
    assert "2026/21/sprint" in client.calls


async def test_outage_keeps_cached_values_and_explicit_warning(fixture, assets):
    client = Client(fixture, "2026/driverStandings")
    client.cache["2026/driverStandings"] = (0, fixture("standings"))
    c = SimpleNamespace(entry=SimpleNamespace(data={"season": 2026}, options={}), client=client, assets=assets)
    data = await F1Coordinator._async_update_data(c)
    assert len(data["standings"]) == 25
    assert "standings:cached" in data["warnings"]
