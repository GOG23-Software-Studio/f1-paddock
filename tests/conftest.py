import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


@pytest.fixture
def fixture():
    return lambda name: json.loads((ROOT / "tests" / "fixtures" / (name + ".json")).read_text(encoding="utf-8"))


@pytest.fixture
def assets():
    return json.loads((ROOT / "custom_components" / "f1_paddock" / "assets.json").read_text(encoding="utf-8"))
