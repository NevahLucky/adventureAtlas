#!/usr/bin/env python3
"""Merge data/regions/*.json into data/adventures.json.

Dedupes on (name, state), skips anything listed in data/removed.json, and reports
what changed. Run this after adding a regional file, then run build.py.

removed.json is the blocklist for closures and duplicates. Without it, a later
merge will happily bring a closed business back from an older region file.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGIONS = ROOT / "data" / "regions"
OUT = ROOT / "data" / "adventures.json"
REMOVED = ROOT / "data" / "removed.json"

REQUIRED = ("name", "city", "county", "state", "cats", "cost", "cost_num", "dur",
            "dur_h", "dates", "start", "company", "party", "customer",
            "unique", "buzz", "rating")


def check(path, records) -> None:
    """Fail loudly on an incomplete record instead of letting build.py crash later."""
    for i, r in enumerate(records):
        missing = [k for k in REQUIRED if k not in r]
        if missing:
            raise SystemExit(f"{path.name}: record {i} ({r.get('name', '?')}) missing {missing}")


def main() -> None:
    rows = json.loads(OUT.read_text())
    blocked = {(r["name"].lower(), r["state"]) for r in json.loads(REMOVED.read_text())}
    seen = {(r["name"].lower(), r["state"]) for r in rows}
    rows = [r for r in rows if (r["name"].lower(), r["state"]) not in blocked]
    added = skipped = dropped = 0
    for path in sorted(REGIONS.glob("*.json")):
        records = json.loads(path.read_text())
        for r in records:
            r.pop("h", None)
            key = (r["name"].lower(), r["state"])
            if key in blocked:
                dropped += 1
                continue
            if key in seen:
                skipped += 1
                continue
            check(path, [r])
            seen.add(key)
            rows.append(r)
            added += 1
        print(f"  {path.name}: {len(records)} records")
    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    print(f"merged {added} new, skipped {skipped} duplicates, blocked {dropped}, total {len(rows)}")


if __name__ == "__main__":
    main()
