"""Serve and register the bundled cards without a manual resource step."""

import asyncio
import logging
from pathlib import Path
from urllib.parse import urlsplit

import aiohttp
from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace import LOVELACE_DATA
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import DOMAIN, VERSION

CARD_PATH = "/f1_paddock/f1-paddock-card.js"
CARD_URL = f"{CARD_PATH}?v={VERSION}"
FONT_URL = "/f1_paddock_font/Formula1-Bold.woff"
FONT_SOURCE = "https://www.formula1.com/etc/designs/fom-website/fonts/F1Bold/Formula1-Bold.woff"


async def async_prepare_font(hass: HomeAssistant) -> str | None:
    """Cache the original font on HA: F1's font response lacks CORS headers.

    This is a single fixed URL, not a general proxy. No font file is bundled.
    Failure leaves the cards functional with their system-font fallback.
    """
    data = hass.data.setdefault(DOMAIN, {})
    async with data.setdefault("font_lock", asyncio.Lock()):
        if data.get("font_registered"):
            return FONT_URL
        path = Path(hass.config.path(".storage", DOMAIN, "Formula1-Bold.woff"))

        def read_cached():
            try:
                value = path.read_bytes()
                return value if value[:4] in (b"wOFF", b"wOF2") else None
            except OSError:
                return None

        font = await hass.async_add_executor_job(read_cached)
        if not font:
            try:
                async with async_get_clientsession(hass).get(FONT_SOURCE, allow_redirects=False, timeout=aiohttp.ClientTimeout(total=20)) as response:
                    response.raise_for_status()
                    font = bytearray()
                    async for chunk in response.content.iter_chunked(65536):
                        font.extend(chunk)
                        if len(font) > 1_000_000:
                            raise ValueError("Font exceeds size limit")
                    if len(font) > 1_000_000 or font[:4] not in (b"wOFF", b"wOF2"):
                        raise ValueError("Unexpected font data")

                def save():
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_bytes(font)

                await hass.async_add_executor_job(save)
            except (aiohttp.ClientError, asyncio.TimeoutError, OSError, ValueError):
                logging.getLogger(__name__).warning("F1 font unavailable; using the system font")
                return None
        await hass.http.async_register_static_paths([StaticPathConfig(FONT_URL, str(path), True)])
        data["font_registered"] = True
        return FONT_URL


def _is_bundled_resource(url: str) -> bool:
    """Only manage this integration's local resource, never a third-party URL."""
    try:
        parsed = urlsplit(url)
    except ValueError:
        return False
    return not parsed.scheme and not parsed.netloc and parsed.path == CARD_PATH


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register once, including concurrent entries, reloads and version upgrades."""
    data = hass.data.setdefault(DOMAIN, {})
    async with data.setdefault("frontend_lock", asyncio.Lock()):
        if not data.get("static_registered"):
            await hass.http.async_register_static_paths(
                [StaticPathConfig("/f1_paddock", str(Path(__file__).parent / "www"), False)]
            )
            data["static_registered"] = True

        resources = hass.data[LOVELACE_DATA].resources
        if isinstance(resources, ResourceStorageCollection):
            # Public collection API loads storage before inspecting its items.
            await resources.async_get_info()
            matches = [item for item in resources.async_items() if _is_bundled_resource(item.get("url", ""))]
            if not matches:
                await resources.async_create_item({"res_type": "module", "url": CARD_URL})
            else:
                # Keep IDs and any existing registrations; normalize old duplicates
                # to one module URL so browsers do not execute different versions.
                for item in matches:
                    if item["url"] != CARD_URL or item.get("type") != "module":
                        await resources.async_update_item(item["id"], {"res_type": "module", "url": CARD_URL})
        elif not data.get("extra_module_registered"):
            # YAML resources are user-owned. HA's frontend API works without
            # rewriting YAML and announces the module to connected clients.
            frontend.add_extra_js_url(hass, CARD_URL)
            data["extra_module_registered"] = True

