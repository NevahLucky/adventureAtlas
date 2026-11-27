#!/usr/bin/env python3
"""Depth report: which counties were filled to a threshold instead of researched.

coverage.py answers "is this county in the atlas". This answers "is it actually researched",
against a floor set by population (see scripts/floors.py).

    python3 scripts/gaps.py                    # worst first by people underserved
    python3 scripts/gaps.py --by entries       # worst first by raw entries missing
    python3 scripts/gaps.py --state Florida --top 20
    python3 scripts/gaps.py --at 3             # counties on exactly three entries

Three is the alarm, not the target. A county sitting on exactly three is the signature of a
sweep that stopped the moment it reached the old completion rule.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path

from floors import floor_for, population

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "adventures.json").read_text())
COUNTIES = json.loads((ROOT / "data" / "counties.json").read_text())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--state", default=None)
    ap.add_argument("--top", type=int, default=30)
    ap.add_argument("--at", type=int, default=None, help="only counties on exactly this many entries")
    ap.add_argument("--by", choices=("people", "entries"), default="people")
    args = ap.parse_args()

    counts = Counter((r["state"], r["county"]) for r in DATA)

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
                    gaps.append((have, 0, 0, state, county, have, have))
                continue
            floor = floor_for(state, county)
            if have < floor:
                pop = population(state, county) or 0
                gaps.append((floor - have, pop * (floor - have), pop, state, county, have, floor))

    if args.at is not None:
        print(f"{len(gaps)} counties sit on exactly {args.at} entries\n")
        for state, n in Counter(g[3] for g in gaps).most_common():
            print(f"  {state:22} {n:>3} counties at {args.at}")
        return

    key = 0 if args.by == "entries" else 1
    gaps.sort(key=lambda g: (-g[key], -g[0], g[3], g[4]))

    short = sum(g[0] for g in gaps)
    pop_under = sum(g[2] for g in gaps)
    weighted = sum(g[1] for g in gaps)
    print(f"{len(gaps)} counties under the floor, {short} entries short, "
          f"{pop_under / 1e6:.0f}M people live in them")
    print(f"population weighted gap: {weighted / 1e6:.0f}M person-entries\n")

    per_state = defaultdict(lambda: [0, 0, 0, 0])
    for missing, people_missing, pop, state, _county, _have, _floor in gaps:
        row = per_state[state]
        row[0] += 1
        row[1] += missing
        row[2] += pop
        row[3] += people_missing
    print("by state, worst weighted gap first:")
    for state, (n, missing, ppl, w) in sorted(per_state.items(), key=lambda kv: -kv[1][3])[:12]:
        print(f"  {state:22} {n:>4} counties  {missing:>5} short  "
              f"{ppl / 1e6:>6.1f}M people  {w / 1e6:>7.1f}M weighted")

    print(f"\nworst {args.top} counties by {args.by}:")
    print(f"  {'STATE':20}{'COUNTY':22}{'POP':>10}{'HAVE':>6}{'FLOOR':>7}{'SHORT':>7}")
    for missing, _pm, pop, state, county, have, floor in gaps[: args.top]:
        print(f"  {state:20}{county:22}{pop:>10,}{have:>6}{floor:>7}{missing:>7}")


if __name__ == "__main__":
    main()
