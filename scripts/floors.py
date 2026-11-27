#!/usr/bin/env python3
"""The depth floor for a county, in one place.

Population decides how much a county owes the atlas. A county of four thousand people can
be finished in five entries. A county of a million cannot, no matter how good the five are.

  under 50,000          5 entries
  50,000 to 249,999     8
  250,000 to 999,999   12
  1,000,000 and up     15

This module is imported by gaps.py and claim.py so the audit and the assignment ledger can
never disagree about whether a county is done. That disagreement is what let Florida's metros
sit at three entries while the plan called them finished.

Population comes from data/county-pop.json, rebuilt by scripts/fetch_pop.py.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POP = json.loads((ROOT / "data" / "county-pop.json").read_text())

TIERS = ((1_000_000, 15), (250_000, 12), (50_000, 8), (0, 5))
DEFAULT_FLOOR = 5


def population(state: str, county: str) -> int | None:
    return POP.get(f"{state}|{county}")


def floor_for(state: str, county: str) -> int:
    pop = population(state, county)
    if pop is None:
        return DEFAULT_FLOOR
    for threshold, floor in TIERS:
        if pop >= threshold:
            return floor
    return DEFAULT_FLOOR


def label(state: str, county: str) -> str:
    pop = population(state, county)
    return f"{pop:,}" if pop is not None else "unknown"


if __name__ == "__main__":
    import sys
    for spec in sys.argv[1:]:
        state, county = spec.split("|", 1)
        print(f"{state} / {county}: {label(state, county)} people, floor {floor_for(state, county)}")
