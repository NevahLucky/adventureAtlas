#!/usr/bin/env python3
"""Merge data/regions/*.json into data/adventures.json.

Dedupes on (name, state), keeps the first record, and reports what changed.
Run this after adding a regional file, then run build.py.
"""
import glob
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGIONS = ROOT / "data" / "regions"
OUT = ROOT / "data" / "adventures.json"


def main() -> None:
    rows = json.loads(OUT.read_text())
    seen = {(r["name"].lower(), r["state"]) for r in rows}
    added = skipped = 0
    for path in sorted(REGIONS.glob("*.json")):
        for r in json.loads(path.read_text()):
            r.pop("h", None)
            key = (r["name"].lower(), r["state"])
            if key in seen:
                skipped += 1
                continue
            seen.add(key)
            rows.append(r)
            added += 1
        print(f"  {path.name}: {len(json.loads(path.read_text()))} records")
    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    print(f"merged {added} new records, skipped {skipped} duplicates, total {len(rows)}")


if __name__ == "__main__":
    main()
