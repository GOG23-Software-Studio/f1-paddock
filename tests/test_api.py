from time import monotonic

import aiohttp
import pytest

from custom_components.f1_paddock.api import F1Client, F1Error


class Response:
    status = 200
    headers = {}

    def __init__(self, payload):
        self.payload = payload

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass

    async def json(self):
        return self.payload

    def raise_for_status(self):
        if self.status != 200:
            raise aiohttp.ClientResponseError(None, (), status=self.status)


class Session:
    def __init__(self, response):
        self.response, self.calls = response, 0

    def get(self, *args, **kwargs):
        self.calls += 1
        return self.response


async def test_cache_shared_between_cards(fixture):
    session = Session(Response(fixture("calendar")))
    client = F1Client(session)
    assert await client.get("2026") == await client.get("2026")
    assert session.calls == 1
    assert client.sources["2026"]["received_at"]


async def test_rate_limit_has_backoff_not_retry_loop():
    response = Response({})
    response.status = 429
    response.headers = {"Retry-After": "120"}
    session = Session(response)
    client = F1Client(session)
    with pytest.raises(F1Error):
        await client.get("2026")
    assert client._blocked_until > monotonic() + 100
    with pytest.raises(F1Error):
        await client.get("2026/last/results")
    assert session.calls == 1


async def test_incomplete_classification_rejected():
    client = F1Client(Session(Response({"MRData": {"total": "101", "limit": "100"}})))
    with pytest.raises(F1Error, match="truncated"):
        await client.get("2026")
