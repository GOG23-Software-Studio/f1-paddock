"""Dashboard plus small sensors; exclude the large payload from Recorder."""
from datetime import datetime, timezone

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity

from .const import CONF_FAVORITE
from .entity import F1Entity


async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities([F1Sensor(entry.runtime_data.coordinator, key, name) for key, name in [
        ("dashboard", "Dashboard"), ("next_session", "Next session"), ("favorite_position", "Favorite position"),
        ("favorite_points", "Favorite points"), ("last_update", "Last update")]])


class F1Sensor(F1Entity, SensorEntity):
    _unrecorded_attributes = frozenset({"snapshot", "favorite_id", "favorite_entity", "round_entity"})

    def __init__(self, coordinator, key, name):
        super().__init__(coordinator, key)
        self.key = key
        self._attr_name = name
        self._attr_icon = "mdi:flag-checkered"
        if key in {"next_session", "last_update"}:
            self._attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def native_value(self):
        data = self.coordinator.data
        if self.key == "dashboard":
            return (data.get("event") or {}).get("name") or "season_finished"
        if self.key == "last_update":
            return datetime.fromisoformat(data["updated_at"])
        if self.key == "next_session":
            now = datetime.now(timezone.utc)
            dates = [datetime.fromisoformat(s["start"]) for s in (data.get("event") or {}).get("sessions", []) if s.get("start")]
            return min((d for d in dates if d > now), default=None)
        selected = next((d for d in data["drivers"] if d["id"] == self.coordinator.entry.options.get(CONF_FAVORITE)), {})
        return selected.get("position" if self.key == "favorite_position" else "points")

    @property
    def extra_state_attributes(self):
        if self.key != "dashboard":
            return None
        from homeassistant.helpers import entity_registry as er
        registry = er.async_get(self.hass)
        prefix = self.coordinator.entry.entry_id
        return {"snapshot": self.coordinator.data, "favorite_id": self.coordinator.entry.options.get(CONF_FAVORITE),
                "favorite_entity": registry.async_get_entity_id("select", "f1_paddock", f"{prefix}_favorite_driver"),
                "round_entity": registry.async_get_entity_id("select", "f1_paddock", f"{prefix}_result_gp")}
