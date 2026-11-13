"""Offline, stdlib-only checks for the install/update distribution contract."""
import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("package_release", ROOT / "tools" / "package_release.py")
PACKAGE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PACKAGE)


class PackagingChecks(unittest.TestCase):
    def test_wrong_tag_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "tag"):
            PACKAGE.validate(tag="999.0.0")

    def test_archive_contains_complete_runtime_and_no_private_data(self):
        with tempfile.TemporaryDirectory() as directory:
            import shutil
            root = Path(directory)
            for name in ("custom_components", "examples"):
                shutil.copytree(ROOT / name, root / name, ignore=shutil.ignore_patterns("__pycache__"))
            for name in ("README.md", "SOURCES.md", "CHANGELOG.md", "LICENSE", "THIRD_PARTY_NOTICES.md", "VALIDATION.md", "PUBLICATION_REVIEW.md", "hacs.json"):
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
                self.assertFalse(any(n.startswith((".local/", "docs/", "tests/", "preview/")) for n in names))
                self.assertFalse(any("__pycache__" in n for n in names))
            previous = archive.read_bytes()
            self.assertEqual(PACKAGE.package(root).read_bytes(), previous)
            source = root / "custom_components/f1_paddock/const.py"
            source.write_bytes(source.read_bytes().replace(b"\r\n", b"\n").replace(b"\n", b"\r\n"))
            self.assertEqual(PACKAGE.package(root).read_bytes(), previous)


if __name__ == "__main__":
    unittest.main()
