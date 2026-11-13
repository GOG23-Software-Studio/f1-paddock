# Contributing to F1 Paddock

Use [Issues](https://github.com/GOG23-Software-Studio/f1-paddock/issues) for reproducible bugs and feature requests. Search existing issues first. Include the integration version, HA version, browser/app, affected card and sporting session, expected behavior and reproduction steps. Explain whether the data is live, historical or simulated.

Never post access tokens, credentials, private URLs, household configuration or unredacted diagnostics/screenshots. Redact logs before sharing. Do not report a security-sensitive problem with private details in a public issue.

## Changes and verification

Keep runtime files inside `custom_components/f1_paddock`. Preserve entity IDs, shared polling, source timestamps, honest stale/finished labels and favorite identity. Do not replace absent data with fictional values outside the explicit simulation. Avoid unrelated dashboard or integration changes.

Use Python 3.14 and Home Assistant 2026.11.1 with aiohttp, pytest, pytest-asyncio and ruff in an isolated environment. Frontend tests use Node and the jsdom development dependency in `package.json`.

```text
python -m pytest
python -m ruff check custom_components tests tools
npm install --ignore-scripts
npm test
python tools/package_release.py --tag 0.1.0b6
python -m unittest discover -s tests -p packaging_checks.py
```

Run checks relevant to the change. HACS and hassfest run in GitHub Actions without ignored checks. A fresh clone does not contain the local preview's cached media or snapshot. Never commit `.local`, credentials or household captures.

For releases, synchronize the manifest, runtime constant, card header, package version and release notes. Validate the exact commit before publishing a release. Do not edit old tags or claim a beta is stable without evidence.

Original contributions use the project's MIT code license. Provider data, media and marks have separate conditions: read [third-party notices](THIRD_PARTY_NOTICES.md) and [publication review](PUBLICATION_REVIEW.md). Do not add assets or data without recording provenance and the applicable permission.
