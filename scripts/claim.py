#!/usr/bin/env python3
"""Claim a disjoint batch of counties before researching them.

The atlas is researched county by county. Parallel workers must never pick the same
county, because merge_regions.py dedupes on (name, state) in sorted filename order and
silently drops the loser. This script is the assignment ledger that prevents that.

    python3 scripts/claim.py next --n 8 --owner r04
    python3 scripts/claim.py next --n 6 --owner r04 --state Virginia
    python3 scripts/claim.py list
    python3 scripts/claim.py release --id r04
    python3 scripts/claim.py prune

A claim expires after --ttl minutes (default 180) so a crashed round cannot wedge the
queue. Counties are ordered by how thin their state is, then by how far the county is under
its floor, so the ledger always hands out the worst gaps first.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "adventures.json"
COUNTIES = ROOT / "data" / "counties.json"
CLAIMS = ROOT / "data" / "claims.json"
METRO_FILE = ROOT / "data" / "metros.json"
REGIONS = ROOT / "data" / "regions"

RURAL_FLOOR = 5
METRO_FLOOR = 12


def now() -> datetime:
    return datetime.now(timezone.utc)


def load_claims() -> dict:
    if not CLAIMS.exists():
        return {"rounds": []}
    return json.loads(CLAIMS.read_text())


def save(claims: dict) -> None:
    claims["updated"] = now().isoformat(timespec="seconds")
    CLAIMS.write_text(json.dumps(claims, indent=1) + "\n")


def live(claims: dict) -> list[dict]:
    """Drop expired rounds, return the rest."""
    cutoff = now() - timedelta(minutes=claims.get("ttl_minutes", 180))
    kept = []
    for r in claims["rounds"]:
        try:
            born = datetime.fromisoformat(r["created"])
        except (KeyError, ValueError):
            continue
        if born > cutoff:
            kept.append(r)
    claims["rounds"] = kept
    return kept


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def next_round(args) -> int:
    claims = load_claims()
    counts = Counter((r["state"], r["county"]) for r in json.loads(DATA.read_text()))
    official = json.loads(COUNTIES.read_text())
    active = live(claims)

    metros = {}
    if METRO_FILE.exists():
        metros = {k.lower(): v for k, v in json.loads(METRO_FILE.read_text()).items()
                  if not k.startswith("_")}

    def floor_for(state: str, county: str) -> int:
        return METRO_FLOOR if f"{state}|{county}".lower() in metros else RURAL_FLOOR

    claimed = {(r["state"], c) for r in active for c in r["counties"]}
    if any(r["id"] == args.id for r in active):
        raise SystemExit(f"round id {args.id} is already live; release it or pick another")

    states = {args.state} if args.state else set(official)
    wanted = {" ".join(c.strip().split()).lower() for c in args.counties.split(",")} if args.counties else None
    ranked = []
    for state in states:
        names = [n for n in official.get(state, []) if n != "Statewide"]
        covered = {c for (s, c) in counts if s == state and c in set(names)}
        thinness = len(covered) / max(1, len(names))
        for county in names:
            if county == "Statewide":
                continue
            if wanted is not None and county.lower() not in wanted:
                continue
            have = counts[(state, county)]
            floor = floor_for(state, county)
            if have >= floor or (state, county) in claimed:
                continue
            ranked.append((thinness, have - floor, state, county, have, floor))
    ranked.sort()

    picked = ranked[: args.n]
    if not picked:
        print("nothing left to claim under the current filters")
        return 1

    states_used = [p[2] for p in picked]
    if len(set(states_used)) == 1:
        state = states_used[0]
        fname = f"{slug(state)}-{args.id}.json"
    else:
        state = "mixed"
        fname = f"mixed-{args.id}.json"

    entry = {
        "id": args.id,
        "owner": args.owner,
        "created": now().isoformat(timespec="seconds"),
        "state": state,
        "counties": [f"{p[2]}:{p[3]}" for p in picked],
        "file": f"data/regions/{fname}",
    }
    claims.setdefault("ttl_minutes", 180)
    claims["rounds"].append(entry)
    save(claims)

    print(f"ROUND {args.id}")
    print(f"FILE  {entry['file']}")
    print(f"OWNER {args.owner}")
    print(f"TTL   {claims['ttl_minutes']} minutes (release with: claim.py release --id {args.id})")
    print(f"COUNT {len(picked)}")
    print("")
    for _, deficit, st, county, have, floor in picked:
        print(f"  {st} / {county}  (has {have}, floor {floor}, short {abs(deficit)})")
    print("")
    print(f"Write ONE JSON array of entries for these counties into {entry['file']}.")
    print("Target the floor, not three. Write the file after the first three entries, then rewrite it.")
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    n = sub.add_parser("next", help="assign the next counties and record the claim")
    n.add_argument("--n", type=int, default=8)
    n.add_argument("--owner", required=True, help="who is doing the work, e.g. a session or round name")
    n.add_argument("--id", default=None, help="round id; default rNN derived from the ledger")
    n.add_argument("--state", default=None, help="pin the batch to one state")
    n.add_argument("--counties", default=None,
                   help="explicit comma separated counties, for a coherent metro or region batch")
    n.add_argument("--ttl", type=int, default=180, help="minutes before the claim expires")

    l = sub.add_parser("list", help="show live claims")
    r = sub.add_parser("release", help="drop a claim by id or owner")
    r.add_argument("--id", default=None)
    r.add_argument("--owner", default=None)
    sub.add_parser("prune", help="drop expired claims")

    args = ap.parse_args(argv)

    if args.cmd == "next":
        claims = load_claims()
        if args.id is None:
            used = {x.get("id") for x in claims.get("rounds", [])}
            n = 1
            while f"r{n:02d}" in used:
                n += 1
            args.id = f"r{n:02d}"
        claims["ttl_minutes"] = args.ttl
        save(claims)
        return next_round(args)

    claims = load_claims()
    active = live(claims)

    if args.cmd == "list":
        if not active:
            print("no live claims")
        for e in active:
            age = int((now() - datetime.fromisoformat(e["created"])).total_seconds() // 60)
            print(f"{e['id']:6} {e['owner'][:22]:22} {e['state']:14} {age:>4}m  {e['file']}")
            for c in e["counties"]:
                print(f"       {c}")
        return 0

    if args.cmd == "release":
        before = len(claims["rounds"])
        claims["rounds"] = [e for e in claims["rounds"]
                            if not ((args.id and e["id"] == args.id)
                                    or (args.owner and e["owner"] == args.owner))]
        save(claims)
        print(f"released {before - len(claims['rounds'])} round(s)")
        return 0

    if args.cmd == "prune":
        save(claims)
        print(f"{len(claims['rounds'])} live round(s) remain")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
