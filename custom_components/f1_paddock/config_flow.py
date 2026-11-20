"""Local UI configuration. This beta has no credentials or paid service."""
from datetime import datetime

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import F1Client, F1Error
from .const import CONF_FAVORITE, CONF_SEASON, DOMAIN, NAME
from .models import driver_standings, races


class F1Flow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 2

    async def async_step_user(self, user_input=None):
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")
        errors = {}
        if user_input is not None:
            season = datetime.now().year
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()
            client = F1Client(async_get_clientsession(self.hass))
            try:
                calendar = await client.get(str(season))
                if not races(calendar):
                    errors["base"] = "no_calendar"
                else:
                    drivers = driver_standings(await client.get(f"{season}/driverStandings"), {}, season)
                    self._season, self._drivers = season, drivers
                    if not drivers:
                        errors["base"] = "no_drivers"
                    else:
                        return await self.async_step_driver()
            except F1Error:
                errors["base"] = "cannot_connect"
        return self.async_show_form(step_id="user", data_schema=vol.Schema({}), errors=errors)

    async def async_step_driver(self, user_input=None):
        choices = {d["id"]: d["name"] for d in self._drivers}
        errors = {}
        if user_input is not None:
            if user_input.get(CONF_FAVORITE) in choices:
                return self.async_create_entry(title=NAME, data={CONF_SEASON: self._season}, options={CONF_FAVORITE: user_input[CONF_FAVORITE], CONF_SEASON: "current"})
            errors["base"] = "invalid_driver"
        return self.async_show_form(step_id="driver", data_schema=vol.Schema({vol.Required(CONF_FAVORITE): vol.In(choices)}), errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return F1OptionsFlow()


class F1OptionsFlow(config_entries.OptionsFlow):
    async def async_step_init(self, user_input=None):
        if self.config_entry.state is not config_entries.ConfigEntryState.LOADED:
            return self.async_abort(reason="integration_not_loaded")
        choices = {d["id"]: d["name"] for d in self.config_entry.runtime_data.coordinator.data["drivers"]}
        if user_input is not None and user_input.get(CONF_FAVORITE) in choices:
            return self.async_create_entry(title="", data={**self.config_entry.options, **user_input})
        current = self.config_entry.options.get(CONF_FAVORITE)
        field = vol.Required(CONF_FAVORITE, default=current) if current in choices else vol.Required(CONF_FAVORITE)
        return self.async_show_form(step_id="init", data_schema=vol.Schema({field: vol.In(choices)}))
