from types import SimpleNamespace
from unittest.mock import AsyncMock

from custom_components.f1_paddock import frontend


class Body:
    async def iter_chunked(self, _):
        yield b"wOFF" + b"a" * 100
        yield b"b" * 100


class Response:
    content = Body()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass

    def raise_for_status(self):
        pass


async def test_complete_font_download_and_single_registration(tmp_path, monkeypatch):
    calls = []

    def get(url, **kwargs):
        calls.append((url, kwargs))
        return Response()

    monkeypatch.setattr(frontend, "async_get_clientsession", lambda h: SimpleNamespace(get=get))

    async def executor(fn):
        return fn()

    hass = SimpleNamespace(data={}, config=SimpleNamespace(path=lambda *parts: str(tmp_path.joinpath(*parts))),
                           http=SimpleNamespace(async_register_static_paths=AsyncMock()), async_add_executor_job=executor)
    assert await frontend.async_prepare_font(hass) == frontend.FONT_URL
    assert await frontend.async_prepare_font(hass) == frontend.FONT_URL
    assert len(calls) == 1
    assert calls[0][0] == frontend.FONT_SOURCE
    assert calls[0][1]["allow_redirects"] is False
    assert tmp_path.joinpath(".storage", "f1_paddock", "Formula1-Bold.woff").read_bytes() == b"wOFF" + b"a" * 100 + b"b" * 100
    hass.http.async_register_static_paths.assert_awaited_once()


async def test_offline_cached_font_needs_no_provider_call(tmp_path, monkeypatch):
    font = tmp_path / ".storage" / "f1_paddock" / "Formula1-Bold.woff"
    font.parent.mkdir(parents=True)
    font.write_bytes(b"wOFFcached")
    monkeypatch.setattr(frontend, "async_get_clientsession", lambda h: (_ for _ in ()).throw(AssertionError("Network forbidden")))

    async def executor(fn):
        return fn()

    hass = SimpleNamespace(data={}, config=SimpleNamespace(path=lambda *parts: str(tmp_path.joinpath(*parts))),
                           http=SimpleNamespace(async_register_static_paths=AsyncMock()), async_add_executor_job=executor)
    assert await frontend.async_prepare_font(hass) == frontend.FONT_URL
