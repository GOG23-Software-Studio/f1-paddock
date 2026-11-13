"""Package a release without HA, fixtures, network access or private assets.

HACS installs custom_components/f1_paddock from the release's source tree.
The attached ZIP is the separate manual installer, not a HACS zip_release.
"""
import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def validate(root=ROOT, tag=None):
    """Check the repository contract and exact release/version alignment."""
    component = root / "custom_components" / "f1_paddock"
    manifest = json.loads((component / "manifest.json").read_text(encoding="utf-8"))
    hacs = json.loads((root / "hacs.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    if not re.fullmatch(r"\d+\.\d+\.\d+(?:b\d+)?", version):
        raise ValueError("Unsupported release version")
    if tag is not None and tag != version:
        raise ValueError("Release tag must match manifest.version exactly")
    constant = re.search(r'^VERSION = "([^"]+)"$', (component / "const.py").read_text(), re.M)
    if not constant or constant[1] != version:
        raise ValueError("Runtime version differs from manifest.version")
    if manifest["domain"] != "f1_paddock" or hacs["name"] != manifest["name"]:
        raise ValueError("Integration identity differs")
    for key in ("documentation", "issue_tracker", "codeowners", "name"):
        if not manifest.get(key):
            raise ValueError(f"Missing manifest field: {key}")
    if hacs.get("zip_release") or hacs.get("content_in_root"):
        raise ValueError("HACS must use the standard custom_components source layout")
    integrations = [p.name for p in (root / "custom_components").iterdir() if p.is_dir() and not p.name.startswith(".")]
    if integrations != ["f1_paddock"]:
        raise ValueError("Exactly one integration per repository is required")
    for name in ("__init__.py", "config_flow.py", "strings.json", "assets.json", "translations/es.json",
                 "translations/en.json", "www/f1-paddock-card.js"):
        if not (component / name).is_file():
            raise ValueError(f"Missing runtime file: {name}")
    return version


def package(root=ROOT, tag=None):
    """Build only reviewed runtime files, examples and documentation."""
    version = validate(root, tag)
    files = []
    for base in (root / "custom_components" / "f1_paddock", root / "examples"):
        for path in base.rglob("*"):
            if path.is_file() and not path.is_symlink() and "__pycache__" not in path.parts and path.suffix != ".pyc":
                files.append(path)
    for name in ("README.md", "SOURCES.md", "CHANGELOG.md", "LICENSE", "THIRD_PARTY_NOTICES.md", "VALIDATION.md", "hacs.json"):
        files.append(root / name)
    dist = root / "dist"
    dist.mkdir(exist_ok=True)
    archive = dist / f"f1-paddock-{version}.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as target:
        for path in sorted(files):
            name = path.relative_to(root).as_posix()
            if any(part.startswith(".") for part in Path(name).parts):
                raise ValueError(f"Hidden file excluded from release: {name}")
            item = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            item.compress_type = zipfile.ZIP_DEFLATED
            item.external_attr = 0o100644 << 16
            data = path.read_bytes()
            if path.suffix in {".py", ".js", ".json", ".yaml", ".yml", ".md", ".txt", ".css"} or path.name == "LICENSE":
                data = data.replace(b"\r\n", b"\n")
            target.writestr(item, data)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    archive.with_name(archive.name + ".sha256").write_text(f"{digest}  {archive.name}\n", encoding="utf-8", newline="\n")
    return archive


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--tag", help="Require an exact match with the release tag")
    args = parser.parse_args()
    print(package(tag=args.tag).name)
