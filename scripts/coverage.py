#!/usr/bin/env python3
"""County coverage report: how much of each state is actually researched.

Compares data/adventures.json against the Census county list in data/counties.json.
A county counts as covered when it has at least one entry. The ONE and TWO columns
are the counties that still need a second pass.
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "adventures.json").read_text())
COUNTIES = json.loads((ROOT / "data" / "counties.json").read_text())


def main() -> None:
    counts = Counter((r["state"], r["county"]) for r in DATA)
    rows = []
    for state, names in COUNTIES.items():
        official = set(names)
        got = {c for (s, c) in counts if s == state}
        covered = official & got
        entries = sum(n for (s, c), n in counts.items() if s == state)
        one = sum(1 for c in covered if counts[(state, c)] == 1)
        two = sum(1 for c in covered if counts[(state, c)] == 2)
        three = sum(1 for c in covered if counts[(state, c)] >= 3)
        rows.append({
            "state": state, "entries": entries, "total": len(official),
            "covered": len(covered), "one": one, "two": two, "three": three,
            "unknown": sorted(got - official),
        })
    rows.sort(key=lambda r: (r["covered"] / max(1, r["total"]), -r["entries"]))

    print(f"{'STATE':24}{'ENTRIES':>8}{'COUNTIES':>10}{'COVERED':>9}{'ONE':>5}{'TWO':>5}{'3+':>5}")
    for r in rows:
        print(f"{r['state']:24}{r['entries']:>8}{r['total']:>10}{r['covered']:>9}"
              f"{r['one']:>5}{r['two']:>5}{r['three']:>5}")
    tot = sum(r["total"] for r in rows)
    cov = sum(r["covered"] for r in rows)
    one = sum(r["one"] for r in rows)
    print(f"\n{cov} of {tot} counties covered, {one} with a single entry")

    bad = [(r["state"], r["unknown"]) for r in rows if r["unknown"]]
    if bad:
        print("\nCounty names not in the Census list (check spelling or type):")
        for state, names in bad:
            print(f"  {state}: {', '.join(names)}")


if __name__ == "__main__":
    main()
