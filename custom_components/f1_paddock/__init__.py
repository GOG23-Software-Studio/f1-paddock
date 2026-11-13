"""F1 Paddock. Read-only data; local selections are the only writes."""
import json
from dataclasses import dataclass
from pathlib import Path

from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import F1Client
from .const import CONF_ROUND, PLATFORMS
from .coordinator import F1Coordinator
from .frontend import async_prepare_font, async_register_frontend


@dataclass
class RuntimeData:
    coordinator: F1Coordinator


def load_assets():
    return json.loads(Path(__file__).with_name("assets.json").read_text(encoding="utf-8"))


async def async_setup_entry(hass, entry):
    assets = await hass.async_add_executor_job(load_assets)
    assets["font"]["url"] = await async_prepare_font(hass)
    coordinator = F1Coordinator(hass, entry, F1Client(async_get_clientsession(hass)), assets)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = RuntimeData(coordinator)
    await async_register_frontend(hass)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    coordinator.async_set_updated_data(coordinator.data)
    entry.async_create_background_task(hass, coordinator.live.run(int(entry.data['season'])), "F1 Paddock public timing")
    entry.async_on_unload(entry.add_update_listener(async_options_updated))
    return True


async def async_unload_entry(hass, entry):
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        await entry.runtime_data.coordinator.live.close()
    return unloaded


async def async_options_updated(hass, entry):
    coordinator = entry.runtime_data.coordinator
    requested = entry.options.get(CONF_ROUND)
    if requested and requested != coordinator.data.get("result_round"):
        await coordinator.async_request_refresh()
    else:
        coordinator.async_set_updated_data(coordinator.data)
