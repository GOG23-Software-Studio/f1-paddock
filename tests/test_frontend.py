"""Registration must be safe across installation, upgrade and reload."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

from homeassistant.components.lovelace import LOVELACE_DATA
from homeassistant.components.lovelace.resources import ResourceStorageCollection

from custom_components.f1_paddock.const import DOMAIN
from custom_components.f1_paddock.frontend import CARD_PATH, CARD_URL, async_register_frontend


def setup(items):
    resources = Mock(spec=ResourceStorageCollection)
    resources.async_get_info = AsyncMock()
    resources.async_items.return_value = items

    async def create(data):
        items.append({"id": "new", "type": data["res_type"], "url": data["url"]})

    async def update(item_id, data):
        next(item for item in items if item["id"] == item_id).update(type=data["res_type"], url=data["url"])

    resources.async_create_item = AsyncMock(side_effect=create)
    resources.async_update_item = AsyncMock(side_effect=update)
    hass = SimpleNamespace(
        data={LOVELACE_DATA: SimpleNamespace(resources=resources)},
        http=SimpleNamespace(async_register_static_paths=AsyncMock()),
    )
    return hass, resources


async def test_fresh_install_and_concurrent_reload_do_not_duplicate():
    hass, resources = setup([])
    await asyncio.gather(*(async_register_frontend(hass) for _ in range(3)))
    resources.async_create_item.assert_awaited_once_with({"res_type": "module", "url": CARD_URL})
    hass.http.async_register_static_paths.assert_awaited_once()
    assert resources.async_items()[0]["url"] == CARD_URL


async def test_upgrade_preserves_id_and_unrelated_resources():
    other = {"id": "other", "url": "/other.js", "type": "module"}
    external = {"id": "external", "url": f"https://example.com{CARD_PATH}", "type": "module"}
    malformed = {"id": "malformed", "url": "http://[invalid", "type": "module"}
    items = [
        {"id": "manual", "url": CARD_PATH + "?v=0.1.0b3", "type": "js"},
        other.copy(), external.copy(), malformed.copy(),
    ]
    hass, resources = setup(items)
    await async_register_frontend(hass)
    await async_register_frontend(hass)
    resources.async_update_item.assert_awaited_once_with("manual", {"res_type": "module", "url": CARD_URL})
    resources.async_create_item.assert_not_awaited()
    assert items[1:] == [other, external, malformed]


async def test_existing_duplicates_share_url_without_deleting_entries():
    items = [{"id": str(i), "url": CARD_PATH + f"?v={i}", "type": "module"} for i in range(2)]
    hass, resources = setup(items)
    await async_register_frontend(hass)
    assert len(items) == 2
    assert {item["url"] for item in items} == {CARD_URL}
    resources.async_delete_item.assert_not_called()


async def test_yaml_uses_frontend_api_without_rewriting_yaml(monkeypatch):
    add = Mock()
    monkeypatch.setattr("custom_components.f1_paddock.frontend.frontend.add_extra_js_url", add)
    resources = SimpleNamespace(data=[{"url": "/user-owned.js", "type": "module"}])
    hass = SimpleNamespace(
        data={LOVELACE_DATA: SimpleNamespace(resources=resources)},
        http=SimpleNamespace(async_register_static_paths=AsyncMock()),
    )
    await async_register_frontend(hass)
    await async_register_frontend(hass)
    add.assert_called_once_with(hass, CARD_URL)
    assert resources.data == [{"url": "/user-owned.js", "type": "module"}]
    assert hass.data[DOMAIN]["extra_module_registered"]


async def test_failed_registration_is_retried_without_re_registering_static_path():
    hass, resources = setup([])
    resources.async_get_info.side_effect = [OSError("storage unavailable"), {}]
    try:
        await async_register_frontend(hass)
    except OSError:
        pass
    await async_register_frontend(hass)
    resources.async_create_item.assert_awaited_once()
    hass.http.async_register_static_paths.assert_awaited_once()


async def test_real_ha_resource_collection_persists_and_updates_in_place(tmp_path):
    """Exercise HA's actual schema, storage and resource collection, not a mock."""
    from homeassistant import loader
    from homeassistant.core import HomeAssistant

    hass = HomeAssistant(str(tmp_path))
    loader.async_setup(hass)
    try:
        resources = ResourceStorageCollection(hass, SimpleNamespace(async_load=AsyncMock(return_value={})))
        # Avoid binding an HTTP server: this test targets real resource persistence.
        hass.data[DOMAIN] = {"static_registered": True}
        hass.data[LOVELACE_DATA] = SimpleNamespace(resources=resources)
        await async_register_frontend(hass)
        created = dict(resources.async_items()[0])
        assert created["url"] == CARD_URL
        assert created["type"] == "module"
        await resources.async_update_item(created["id"], {"url": CARD_PATH + "?v=old"})
        await async_register_frontend(hass)
        assert resources.async_items() == [created]
        # Flush to disk and reconstruct the actual HA collection as after restart.
        await resources.store.async_save({"items": resources.async_items()})
        reloaded = ResourceStorageCollection(hass, SimpleNamespace(async_load=AsyncMock(return_value={})))
        await reloaded.async_get_info()
        assert reloaded.async_items() == [created]
    finally:
        await hass.async_stop()
