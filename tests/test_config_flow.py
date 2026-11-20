"""Options stay usable when setup is unavailable or an entry unloads."""
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.data_entry_flow import FlowResultType

from custom_components.f1_paddock.config_flow import F1OptionsFlow
from custom_components.f1_paddock.const import CONF_FAVORITE


def options_flow(entry):
    flow = F1OptionsFlow()
    flow.handler = "f1-entry"
    flow.hass = SimpleNamespace(config_entries=SimpleNamespace(async_get_known_entry=Mock(return_value=entry)))
    return flow


@pytest.mark.parametrize("state", [state for state in ConfigEntryState if state is not ConfigEntryState.LOADED])
@pytest.mark.parametrize("user_input", [None, {CONF_FAVORITE: "norris"}])
async def test_unloaded_options_abort_without_reading_runtime_or_changing_favorite(state, user_input):
    # Failed setup has never assigned runtime_data; stale submissions can arrive after unload.
    entry = SimpleNamespace(state=state, options={CONF_FAVORITE: "alonso", "result_round": 20})
    flow = options_flow(entry)
    result = await flow.async_step_init(user_input)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "integration_not_loaded"
    assert entry.options == {CONF_FAVORITE: "alonso", "result_round": 20}


async def test_loaded_options_preserve_current_favorite_and_other_preferences():
    entry = SimpleNamespace(
        state=ConfigEntryState.LOADED,
        options={CONF_FAVORITE: "alonso", "result_round": 20},
        runtime_data=SimpleNamespace(coordinator=SimpleNamespace(data={"drivers": [
            {"id": "alonso", "name": "Fernando Alonso"}, {"id": "norris", "name": "Lando Norris"},
        ]})),
    )
    flow = options_flow(entry)
    result = await flow.async_step_init()
    assert result["type"] is FlowResultType.FORM
    assert result["data_schema"]({}) == {CONF_FAVORITE: "alonso"}
    result = await flow.async_step_init({CONF_FAVORITE: "norris"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["data"] == {CONF_FAVORITE: "norris", "result_round": 20}
    assert entry.options[CONF_FAVORITE] == "alonso"


async def test_second_entry_is_rejected_before_season_form_or_network():
    from custom_components.f1_paddock.config_flow import F1Flow
    flow = F1Flow()
    flow._async_current_entries = Mock(return_value=[SimpleNamespace(entry_id="existing")])
    result = await flow.async_step_user()
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_migration_preserves_ids_favorite_and_round_and_enables_current(monkeypatch):
    from datetime import datetime

    from custom_components.f1_paddock import async_migrate_entry
    entry = SimpleNamespace(version=1, entry_id="keep-id", unique_id="f1_paddock_2026",
                            data={"season": datetime.now().year}, options={CONF_FAVORITE:"alonso", "result_round":20})
    update = Mock()
    hass = SimpleNamespace(config_entries=SimpleNamespace(async_update_entry=update))
    assert await async_migrate_entry(hass, entry)
    args = update.call_args.kwargs
    assert args["version"] == 2
    assert args["options"] == {"season":"current", CONF_FAVORITE:"alonso", "result_round":20}
    assert "data" not in args and "unique_id" not in args and entry.entry_id == "keep-id"
    entry.data["season"] = 2023
    await async_migrate_entry(hass, entry)
    assert update.call_args.kwargs["options"]["season"] == "2023"
