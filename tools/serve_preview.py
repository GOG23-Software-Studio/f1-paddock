"""Serve a loopback-only preview. No HA access or credentials."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        from urllib.parse import unquote, urlsplit
        path = unquote(urlsplit(path).path)
        if path.startswith("/component/"):
            root, suffix = ROOT / "custom_components" / "f1_paddock" / "www", path[len("/component/"):]
        elif path.startswith("/preview-assets/"):
            root, suffix = ROOT / ".local" / "assets", path[len("/preview-assets/"):]
        else:
            root, suffix = ROOT / "preview", path.lstrip("/") or "index.html"
        target = (root / suffix).resolve()
        if not target.is_relative_to(root.resolve()):
            return str(ROOT / "not-found")
        return str(target)


if __name__ == "__main__":
    print("F1 Paddock preview: http://127.0.0.1:8769", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 8769), Handler).serve_forever()
