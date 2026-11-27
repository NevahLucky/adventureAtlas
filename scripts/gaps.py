#!/usr/bin/env python3
"""Depth report: which counties were filled to a threshold instead of researched.

coverage.py answers "is this county in the atlas". This answers "is this county
actually researched", which is the question the plan cares about.

A county counts against the floor until it clears it:

  - metro counties in data/metros.json:        12 entries
  - every other county:                         5 entries

Three is the alarm, not the target. A county sitting on exactly three is the
signature of a sweep that stopped the moment it reached the old completion rule.

    python3 scripts/gaps.py
    python3 scripts/gaps.py --state Florida
    python3 scripts/gaps.py --top 40
    python3 scripts/gaps.py --at 3          # counties on exactly three entries
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "adventures.json").read_text())
COUNTIES = json.loads((ROOT / "data" / "counties.json").read_text())
METRO_FILE = ROOT / "data" / "metros.json"

RURAL_FLOOR = 5
METRO_FLOOR = 12


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--state", default=None)
    ap.add_argument("--top", type=int, default=30)
    ap.add_argument("--at", type=int, default=None, help="only counties on exactly this many entries")
    ap.add_argument("--metro-floor", type=int, default=METRO_FLOOR)
    ap.add_argument("--rural-floor", type=int, default=RURAL_FLOOR)
    args = ap.parse_args()

    metros = {}
    if METRO_FILE.exists():
        metros = {k.lower(): v for k, v in json.loads(METRO_FILE.read_text()).items()
                  if not k.startswith("_")}

    counts = Counter((r["state"], r["county"]) for r in DATA)
    valid = {f"{s}|{c}".lower() for s, names in COUNTIES.items() for c in names}
    unknown = sorted(k for k in metros if k not in valid)

    gaps = []
    for state, names in COUNTIES.items():
        if args.state and state != args.state:
            continue
        for county in names:
            if county == "Statewide":
                continue
            have = counts[(state, county)]
            if args.at is not None:
                if have == args.at:
                    gaps.append((have, 0, state, county, have))
                continue
            floor = args.metro_floor if f"{state}|{county}".lower() in metros else args.rural_floor
            if have < floor:
                gaps.append((floor - have, have, state, county, floor))

    if args.at is not None:
        print(f"{len(gaps)} counties sit on exactly {args.at} entries\n")
        by_state = Counter(s for _, _, s, _, _ in gaps)
        for state, n in by_state.most_common():
            print(f"  {state:24} {n:>3} counties at {args.at}")
        return

    gaps.sort(key=lambda g: (-g[0], g[2], g[3]))
    short = sum(g[0] for g in gaps)
    print(f"{len(gaps)} counties under the floor, {short} entries short in total\n")

    per_state = Counter()
    for missing, _, state, _, _ in gaps:
        per_state[state] += missing
    print("by state, worst first:")
    for state, missing in per_state.most_common(12):
        n = sum(1 for g in gaps if g[2] == state)
        print(f"  {state:24} {n:>4} counties   {missing:>5} entries short")

    print(f"\nworst {args.top} counties:")
    print(f"  {'STATE':22}{'COUNTY':20}{'HAVE':>5}{'FLOOR':>6}{'SHORT':>6}")
    for missing, have, state, county, floor in gaps[: args.top]:
        print(f"  {state:22}{county:20}{have:>5}{floor:>6}{missing:>6}")

    if unknown:
        print(f"\nmetros.json names not found in the Census list: {', '.join(sorted(unknown))}")


if __name__ == "__main__":
    main()
