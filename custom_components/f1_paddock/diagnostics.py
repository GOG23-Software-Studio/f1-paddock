"""No household identifiers, preferences, or credentials in diagnostics."""
async def async_get_config_entry_diagnostics(hass, entry):
    data = entry.runtime_data.coordinator.data or {}
    return {key: data.get(key) for key in ["schema_version", "season", "updated_at", "warnings", "sources", "capabilities"]}
