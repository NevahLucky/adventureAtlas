#!/usr/bin/env python3
"""The single-writer step. Merge, route, build, audit, and optionally commit.

Research workers only ever write one new file into data/regions/. Everything shared
(data/adventures.json, the generated HTML, PLAN.md, git) is touched by this script and
nobody else. It takes an exclusive lock on data/.pipeline.lock so two sessions cannot
interleave a merge and a build.

    python3 scripts/pipeline.py                 # merge, route, build, audit. No commit.
    python3 scripts/pipeline.py --commit -m "Add Lamar and Motley, Texas"
    python3 scripts/pipeline.py --no-route --commit -m "..."
    python3 scripts/pipeline.py --push -m "..."  # commit and push, triggers the deploy

Exit codes: 0 ok, 2 bad region file, 3 pipeline already running, 4 validation failed.
"""
from __future__ import annotations

import argparse
import atexit
import fcntl
import json
import os
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "adventures.json"
REGIONS = ROOT / "data" / "regions"
COUNTIES = ROOT / "data" / "counties.json"
LOCK = ROOT / "data" / ".pipeline.lock"

REQUIRED = ("name", "city", "county", "state", "cats", "cost", "cost_num", "dur",
            "dur_h", "dates", "start", "company", "party", "customer",
            "unique", "buzz", "rating")

ORIGINS = [
    "Fort Mill,SC,35.0074,-80.9451,drive_min",
    "Clemson,SC,34.6851,-82.8364,drive_min_clemson",
]


def run(cmd: list[str], label: str) -> str:
    print(f"\n$ {label}")
    p = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True)
    out = (p.stdout + p.stderr).strip()
    for line in out.splitlines():
        print(f"  {line}")
    if p.returncode != 0:
        raise SystemExit(f"{label} failed with exit {p.returncode}")
    return out


def keyset(path: Path) -> set:
    if not path.exists():
        return set()
    return {(r["name"].lower(), r["state"]) for r in json.loads(path.read_text())}


def preflight() -> None:
    """A worker killed mid-write leaves a truncated file. Catch it before the merge."""
    broken = []
    for f in sorted(REGIONS.glob("*.json")):
        try:
            rows = json.loads(f.read_text())
        except json.JSONDecodeError as e:
            broken.append(f"{f.name}: {e}")
            continue
        if not isinstance(rows, list):
            broken.append(f"{f.name}: not a JSON array")
    if broken:
        print("Broken region files, not merging:")
        for b in broken:
            print(f"  {b}")
        raise SystemExit(2)


def audit() -> list[str]:
    rows = json.loads(DATA.read_text())
    problems: list[str] = []
    seen = Counter((r["name"].lower(), r["state"]) for r in rows)
    dupes = [k for k, n in seen.items() if n > 1]
    if dupes:
        problems.append(f"{len(dupes)} duplicate (name, state) pairs, e.g. {dupes[:3]}")

    for r in rows:
        missing = [k for k in REQUIRED if k not in r]
        if missing:
            problems.append(f"{r.get('name', '?')} missing {missing}")
            break

    off_band = [f"{r['name']} {r['rating']}" for r in rows
                if not isinstance(r.get("rating"), int) or not 60 <= r["rating"] <= 95]
    if off_band:
        print(f"  note: {len(off_band)} ratings outside the 60-95 band: {', '.join(off_band[:5])}")

    official = json.loads(COUNTIES.read_text())
    counts = Counter((r["state"], r["county"]) for r in rows)
    per_state = Counter(r["state"] for r in rows)
    unknown = sorted({f"{s}/{c}" for (s, c) in counts
                      if s in official and c not in set(official[s]) and c != "Statewide"})
    if unknown:
        print(f"  note: {len(unknown)} county names not in the Census list: {', '.join(unknown[:6])}")

    thin = sorted(f"{s} {n}" for s, n in per_state.items() if n < 30)
    if thin:
        problems.append(f"states under the 30 entry floor: {', '.join(thin)}")

    total = len(rows)
    covered = len({(r["state"], r["county"]) for r in rows if r["county"] != "Statewide"})
    ones = sum(1 for (s, c), n in counts.items() if n == 1 and c != "Statewide")
    print(f"\n  entries {total}   counties {covered}   single-entry counties {ones}")
    return problems


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--commit", action="store_true")
    ap.add_argument("--push", action="store_true")
    ap.add_argument("-m", "--message", default=None)
    ap.add_argument("--no-merge", action="store_true")
    ap.add_argument("--no-route", action="store_true")
    ap.add_argument("--no-build", action="store_true")
    ap.add_argument("--route-states", default=None,
                    help="comma separated states to route; default is whatever the merge added")
    args = ap.parse_args()

    LOCK.touch(exist_ok=True)
    lock_fh = open(LOCK, "r+")
    try:
        fcntl.flock(lock_fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("pipeline is already running in another session (data/.pipeline.lock)")
        return 3
    lock_fh.seek(0)
    lock_fh.truncate()
    lock_fh.write(f"pid {os.getpid()}\n")
    lock_fh.flush()
    atexit.register(lambda: (lock_fh.seek(0), lock_fh.truncate(), lock_fh.close()))

    before = keyset(DATA)
    if not args.no_merge:
        preflight()
        run([sys.executable, "scripts/merge_regions.py"], "merge_regions.py")
    after = keyset(DATA)
    new = after - before
    print(f"\n  {len(new)} new entries from {len({s for _, s in new})} state(s)")

    if not args.no_route and new:
        if args.route_states:
            states = [s.strip() for s in args.route_states.split(",") if s.strip()]
        else:
            states = sorted({s for _, s in new})
        cmd = [sys.executable, "scripts/drive_times.py", "--states", ",".join(states)]
        for o in ORIGINS:
            cmd += ["--origin", o]
        run(cmd, f"drive_times.py for {', '.join(states)}")

    if not args.no_build:
        run([sys.executable, "build.py"], "build.py")

    run([sys.executable, "scripts/coverage.py"], "coverage.py")
    run([sys.executable, "scripts/gaps.py", "--top", "5"], "gaps.py")

    print("\n$ audit")
    problems = audit()
    if problems:
        print("\nVALIDATION FAILED, nothing committed:")
        for p in problems:
            print(f"  - {p}")
        return 4
    print("  ok")

    dirty = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT,
                           text=True, capture_output=True).stdout.strip()
    if not dirty:
        print("\nnothing to commit")
        return 0
    if not args.commit:
        print("\ntree is dirty, not committing (pass --commit -m \"...\")")
        return 0

    msg = args.message or f"Add {len(new)} entries"
    run(["git", "add", "-A"], "git add -A")
    run(["git", "commit", "-m", msg], f"git commit -m {msg!r}")
    if args.push:
        run(["git", "push"], "git push")
    print("\ncommitted" + (" and pushed" if args.push else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
