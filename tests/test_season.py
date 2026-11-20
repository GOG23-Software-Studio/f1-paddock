from datetime import datetime as RealDateTime
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from homeassistant.exceptions import HomeAssistantError

from custom_components.f1_paddock import season
from custom_components.f1_paddock.select import F1SeasonSelect


def test_current_rolls_over_while_historical_selection_stays_fixed(monkeypatch):
    class Clock(RealDateTime):
        year_value = 2026

        @classmethod
        def now(cls):
            return cls(cls.year_value, 1, 1)

    monkeypatch.setattr(season, "datetime", Clock)
    current = SimpleNamespace(options={"season":"current"})
    historic = SimpleNamespace(options={"season":"2023"})
    assert season.selected_season(current) == 2026
    Clock.year_value = 2027
    assert season.selected_season(current) == 2027
    assert season.selected_season(historic) == 2023
    assert season.season_choices() == ["current", "2027", "2026", "2025", "2024", "2023"]


async def test_season_selection_keeps_favorite_clears_gp_and_uses_same_entry():
    entry = SimpleNamespace(options={"season":"current", "favorite_driver_id":"alonso", "result_round":21})
    update = Mock()
    selector = object.__new__(F1SeasonSelect)
    selector.coordinator = SimpleNamespace(entry=entry, last_update_success=False)
    selector.hass = SimpleNamespace(config_entries=SimpleNamespace(async_update_entry=update))
    assert selector.available
    await selector.async_select_option("2023")
    update.assert_called_once_with(entry, options={"season":"2023", "favorite_driver_id":"alonso"})
    with pytest.raises(HomeAssistantError):
        await selector.async_select_option("1900")
    update.reset_mock()
    await selector.async_select_option("current")
    update.assert_not_called()
