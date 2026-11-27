#!/usr/bin/env python3
"""Fill drive_min / drive_min_clemson with OSRM, one table request per origin.

Unlike drive_times.py (which routes one pair at a time through Valhalla), this
batches every uncached city in a state into a single OSRM table call. Geocodes
are shared with data/drive-times.json, so the two scripts can be mixed.

Usage:
  python3 scripts/osrm_times.py --states "New York,Pennsylvania"
"""
from __future__ import annotations

import argparse
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "drive-times.json"
DATA = ROOT / "data" / "adventures.json"
UA = {"User-Agent": "waypoint-atlas/1.0 (personal travel atlas)"}
ORIGINS = [
    ("Fort Mill", 35.0074, -80.9451, "drive_min"),
    ("Clemson", 34.6851, -82.8364, "drive_min_clemson"),
]
TABLE = "https://router.project-osrm.org/table/v1/driving/"


def get_json(url: str) -> dict:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as f:
        return json.loads(f.read().decode())


def geocode(city: str, state: str) -> dict | None:
    q = urllib.parse.quote(f"{city}, {state}, USA")
    res = get_json(f"https://nominatim.openstreetmap.org/search?q={q}&format=json&limit=1&countrycodes=us")
    if not res:
        return None
    return {"lat": float(res[0]["lat"]), "lon": float(res[0]["lon"]),
            "name": res[0].get("display_name", "")[:80]}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--states", required=True)
    args = ap.parse_args()
    states = {s.strip() for s in args.states.split(",") if s.strip()}

    rows = json.loads(DATA.read_text())
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}

    todo = sorted({(r["city"], r["state"]) for r in rows if r["state"] in states
                   and f"{r['city']}|{r['state']}" not in cache})
    for city, state in todo:
        try:
            found = geocode(city, state)
        except Exception as exc:
            print(f"  geocode failed {city}, {state}: {exc}")
            continue
        if found:
            cache[f"{city}|{state}"] = found
            print(f"  geocoded {city}, {state}")
        else:
            print(f"  no geocode for {city}, {state}")
        time.sleep(1.05)
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1))

    keys = [k for k in cache if k.split("|")[1] in states and cache[k].get("lat") is not None]
    filled = 0
    for label, olat, olon, field in ORIGINS:
        mi_field = field.replace("min", "mi")
        pending = [k for k in keys if cache[k].get(field) is None]
        for i in range(0, len(pending), 90):
            chunk = pending[i:i + 90]
            coords = [f"{olon},{olat}"] + [f"{cache[k]['lon']},{cache[k]['lat']}" for k in chunk]
            url = TABLE + ";".join(coords) + "?sources=0&annotations=duration,distance"
            try:
                res = get_json(url)
            except Exception as exc:
                print(f"  table failed from {label}: {exc}")
                continue
            durations = res.get("durations", [[]])[0][1:]
            distances = res.get("distances", [[]])[0][1:]
            for k, seconds, meters in zip(chunk, durations, distances):
                if seconds is None:
                    continue
                cache[k][field] = round(seconds / 60)
                cache[k][mi_field] = round(meters / 1609.34)
                filled += 1
            time.sleep(1)

    for row in rows:
        place = cache.get(f"{row['city']}|{row['state']}")
        if not place:
            continue
        for _label, _lat, _lon, field in ORIGINS:
            if place.get(field) is not None:
                row[field] = place[field]
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1))
    DATA.write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    left = sum(1 for k in keys if any(cache[k].get(f) is None for _l, _a, _b, f in ORIGINS))
    print(f"routed {filled} pairs, {len(keys)} cities, {left} still missing, {len(rows)} entries total")


if __name__ == "__main__":
    main()
