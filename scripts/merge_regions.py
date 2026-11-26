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
            seen.add(key)
            rows.append(r)
            added += 1
        print(f"  {path.name}: {len(records)} records")
    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    print(f"merged {added} new, skipped {skipped} duplicates, blocked {dropped}, total {len(rows)}")


if __name__ == "__main__":
    main()
