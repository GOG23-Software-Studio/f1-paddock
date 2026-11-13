"""Persistent driver and result GP selectors."""
from homeassistant.components.select import SelectEntity
from homeassistant.exceptions import HomeAssistantError

from .const import CONF_FAVORITE, CONF_ROUND
from .entity import F1Entity


async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities([F1Select(entry.runtime_data.coordinator, False), F1Select(entry.runtime_data.coordinator, True)])


class F1Select(F1Entity, SelectEntity):
    def __init__(self, coordinator, rounds):
        super().__init__(coordinator, "result_gp" if rounds else "favorite_driver")
        self.rounds = rounds
        self._attr_name = "Result GP" if rounds else "Favorite driver"
        self._attr_icon = "mdi:flag-checkered" if rounds else "mdi:account-star"

    def _choices(self):
        data = self.coordinator.data
        if self.rounds:
            return [(e["round"], f"R{e['round']} · {e['name']}") for e in data["calendar"]]
        return [(d["id"], d["name"]) for d in data["drivers"]]

    @property
    def options(self):
        return [name for _, name in self._choices()]

    @property
    def current_option(self):
        key = (self.coordinator.entry.options.get(CONF_ROUND) or self.coordinator.data["result_round"]) if self.rounds else self.coordinator.entry.options.get(CONF_FAVORITE)
        return next((label for value, label in self._choices() if value == key), None)

    async def async_select_option(self, option):
        selected = next((value for value, label in self._choices() if label == option), None)
        if selected is None:
            raise HomeAssistantError("Unknown selection")
        entry = self.coordinator.entry
        self.hass.config_entries.async_update_entry(entry, options={**entry.options, (CONF_ROUND if self.rounds else CONF_FAVORITE): selected})
