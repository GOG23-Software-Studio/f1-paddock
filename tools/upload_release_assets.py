"""Attach reviewed packages without replacing assets or resetting download counts."""
import argparse
import hashlib
import json
import os
from urllib.parse import quote
from urllib.request import Request, urlopen

from package_release import ROOT, validate


def api(path, data=None, upload=False):
    base = "https://uploads.github.com" if upload else "https://api.github.com"
    request = Request(base + path, data=data, headers={
        "Authorization": "Bearer " + os.environ["GH_TOKEN"],
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/octet-stream",
        "User-Agent": "F1-Paddock-release",
        "X-GitHub-Api-Version": "2022-11-28",
    })
    with urlopen(request, timeout=60) as response:
        return json.load(response)


def upload(tag):
    version = validate(tag=tag)
    repository = os.environ["GH_REPO"]
    release = api(f"/repos/{repository}/releases/tags/{quote(tag, safe='')}")
    assets = {a["name"]: a for a in release["assets"]}
    for name in ("f1_paddock.zip", "f1_paddock.zip.sha256", f"f1-paddock-{version}.zip", f"f1-paddock-{version}.zip.sha256"):
        data = (ROOT / "dist" / name).read_bytes()
        digest = "sha256:" + hashlib.sha256(data).hexdigest()
        if name in assets:
            if assets[name].get("digest") != digest or assets[name]["size"] != len(data):
                raise ValueError(f"Existing asset differs; publish a new version instead: {name}")
            print(f"Preserved existing asset and download count: {name}")
            continue
        asset = api(f"/repos/{repository}/releases/{release['id']}/assets?name={quote(name)}", data, upload=True)
        if asset.get("digest") != digest or asset["size"] != len(data):
            raise ValueError(f"Uploaded asset failed checksum verification: {name}")
        print(f"Uploaded and verified: {name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--tag", required=True)
    upload(parser.parse_args().tag)
