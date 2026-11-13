"""A single cache and conservative request pacing for all cards."""
import asyncio
from datetime import datetime, timezone
from time import monotonic

import aiohttp

from .const import API_BASE


class F1Error(Exception):
    """Source currently unusable."""


class F1Client:
    def __init__(self, session):
        self.session = session
        self.cache = {}
        self.sources = {}
        self._lock = asyncio.Lock()
        self._last_request = -999
        self._blocked_until = 0

    async def get(self, path, ttl=900):
        async with self._lock:
            now = monotonic()
            cached = self.cache.get(path)
            if cached and now - cached[0] < ttl:
                return cached[1]
            if now < self._blocked_until:
                raise F1Error("Source backoff in progress")
            await asyncio.sleep(max(0, 1.1 - (now - self._last_request)))
            self._last_request = monotonic()
            try:
                async with self.session.get(f"{API_BASE}/{path}.json", params={"limit": 100},
                                            timeout=aiohttp.ClientTimeout(total=25)) as response:
                    if response.status == 429:
                        delay = response.headers.get("Retry-After", "300")
                        try:
                            delay = min(3600, max(60, int(delay)))
                        except ValueError:
                            delay = 300
                        self._blocked_until = monotonic() + delay
                    response.raise_for_status()
                    data = await response.json()
                    meta = data.get("MRData")
                    if not isinstance(meta, dict):
                        raise F1Error("Unexpected Jolpica response")
                    if int(meta.get("total", 0)) > int(meta.get("limit", 100)):
                        raise F1Error("Response truncated; refusing incomplete classification")
            except (aiohttp.ClientError, asyncio.TimeoutError, ValueError, TypeError) as exc:
                self._blocked_until = max(self._blocked_until, monotonic() + 60)
                raise F1Error("Could not refresh Jolpica") from exc
            self.cache[path] = (monotonic(), data)
            self.sources[path] = {"provider": "Jolpica", "received_at": datetime.now(timezone.utc).isoformat()}
            return data
