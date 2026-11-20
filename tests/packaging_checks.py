"""Offline, stdlib-only checks for the install/update distribution contract."""
import hashlib
import importlib.util
import os
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("package_release", ROOT / "tools" / "package_release.py")
PACKAGE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PACKAGE)
sys.path.insert(0, str(ROOT / "tools"))
import upload_release_assets as UPLOAD  # noqa: E402


class PackagingChecks(unittest.TestCase):
    def test_repeated_upload_preserves_download_counts_and_rejects_changed_assets(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {"GH_REPO": "example/test"}):
            root = Path(directory)
            (root / "dist").mkdir()
            names = ("f1_paddock.zip", "f1_paddock.zip.sha256", "f1-paddock-1.0.0.zip", "f1-paddock-1.0.0.zip.sha256")
            for name in names:
                (root / "dist" / name).write_bytes(b"reviewed bytes")
            assets = [{"name": n, "digest": "sha256:" + hashlib.sha256(b"reviewed bytes").hexdigest(),
                       "size": 14, "download_count": 123} for n in names]
            with patch.object(UPLOAD, "ROOT", root), patch.object(UPLOAD, "validate", return_value="1.0.0"), \
                    patch.object(UPLOAD, "api", return_value={"id": 1, "assets": assets}) as api:
                UPLOAD.upload("1.0.0")
                self.assertEqual(api.call_count, 1)  # GET only: no replacing or uploading existing assets.
                self.assertEqual(assets[0]["download_count"], 123)
                (root / "dist" / names[0]).write_bytes(b"different")
                with self.assertRaisesRegex(ValueError, "Existing asset differs"):
                    UPLOAD.upload("1.0.0")

    def test_wrong_tag_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "tag"):
            PACKAGE.validate(tag="999.0.0")

    def test_archive_contains_complete_runtime_and_no_private_data(self):
        with tempfile.TemporaryDirectory() as directory:
            import shutil
            root = Path(directory)
            for name in ("custom_components", "examples"):
                shutil.copytree(ROOT / name, root / name, ignore=shutil.ignore_patterns("__pycache__"))
            for name in ("README.md", "SOURCES.md", "CHANGELOG.md", "LICENSE", "THIRD_PARTY_NOTICES.md", "VALIDATION.md", "PUBLICATION_REVIEW.md", "CONTRIBUTING.md", "hacs.json", "docs/studio-banner.png"):
                (root / name).parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(ROOT / name, root / name)
            (root / ".local").mkdir()
            (root / ".local" / "secret.txt").write_text("excluded")
            archive = PACKAGE.package(root)
            with zipfile.ZipFile(archive) as result:
                names = result.namelist()
                self.assertIn("custom_components/f1_paddock/manifest.json", names)
                self.assertIn("custom_components/f1_paddock/www/f1-paddock-card.js", names)
                self.assertIn("custom_components/f1_paddock/translations/es.json", names)
                self.assertIn("custom_components/f1_paddock/brand/icon.png", names)
                self.assertIn("custom_components/f1_paddock/brand/icon@2x.png", names)
                self.assertIn("docs/studio-banner.png", names)
                self.assertIn("CONTRIBUTING.md", names)
                self.assertFalse(any(n.startswith((".local/", "tests/", "preview/")) for n in names))
                self.assertEqual([n for n in names if n.startswith("docs/")], ["docs/studio-banner.png"])
                self.assertFalse(any("__pycache__" in n for n in names))
            previous = archive.read_bytes()
            runtime = root / "dist" / "f1_paddock.zip"
            runtime_previous = runtime.read_bytes()
            with zipfile.ZipFile(runtime) as result:
                self.assertEqual(result.namelist(), sorted(result.namelist()))
                self.assertTrue(all(entry.compress_type == zipfile.ZIP_STORED for entry in result.infolist()))
                self.assertTrue(all(entry.create_system == 3 for entry in result.infolist()))
                self.assertIn("manifest.json", result.namelist())
                self.assertIn("www/f1-paddock-card.js", result.namelist())
                self.assertIn("translations/es.json", result.namelist())
                self.assertFalse(any(n.startswith(("custom_components/", "docs/", "examples/", ".local/")) for n in result.namelist()))
                install = root / "ha" / "custom_components" / "f1_paddock"
                result.extractall(install)
                self.assertEqual((install / "manifest.json").read_bytes(), (root / "custom_components/f1_paddock/manifest.json").read_bytes().replace(b"\r\n", b"\n"))
                # An update replaces runtime files without touching HA configuration.
                settings = root / "ha" / ".storage" / "core.config_entries"
                settings.parent.mkdir()
                settings.write_text('{"favorite_driver":"alonso"}')
                (install / "const.py").write_text("old version")
                result.extractall(install)
                self.assertEqual(settings.read_text(), '{"favorite_driver":"alonso"}')
                self.assertNotEqual((install / "const.py").read_text(), "old version")
            self.assertEqual(PACKAGE.package(root).read_bytes(), previous)
            self.assertEqual(runtime.read_bytes(), runtime_previous)
            source = root / "custom_components/f1_paddock/const.py"
            source.write_bytes(source.read_bytes().replace(b"\r\n", b"\n").replace(b"\n", b"\r\n"))
            self.assertEqual(PACKAGE.package(root).read_bytes(), previous)


if __name__ == "__main__":
    unittest.main()
