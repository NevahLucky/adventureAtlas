#!/usr/bin/env python3
"""Add routed drive times from one or more origin cities.

Usage:
  python3 scripts/drive_times.py --states "South Carolina,North Carolina" \
      --origin "Fort Mill,SC,35.0074,-80.9451,drive_min" \
      --origin "Clemson,SC,34.6851,-82.8364,drive_min_clemson"

Geocodes any city not already in data/drive-times.json with Nominatim (1 req/sec),
then asks the public Valhalla server for a traffic free routing estimate from each
origin. Writes both the cache and every matching row in data/adventures.json.
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


def get_json(url: str, payload: dict | None = None) -> dict:
    data = json.dumps(payload).encode() if payload else None
    headers = dict(UA)
    if payload:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as f:
        return json.loads(f.read().decode())


def geocode(city: str, state: str) -> dict | None:
    q = urllib.parse.quote(f"{city}, {state}, USA")
    res = get_json(f"https://nominatim.openstreetmap.org/search?q={q}&format=json&limit=1&countrycodes=us")
    if not res:
        return None
    return {"lat": float(res[0]["lat"]), "lon": float(res[0]["lon"]),
            "name": res[0].get("display_name", "")[:80]}


def route(origin: dict, dest: dict) -> tuple[int, int]:
    payload = {"locations": [origin, dest], "costing": "auto", "units": "miles"}
    s = get_json("https://valhalla1.openstreetmap.de/route", payload)["trip"]["summary"]
    return round(s["time"] / 60), round(s["length"])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--states", required=True, help="comma separated full state names")
    ap.add_argument("--origin", action="append", required=True,
                    help="label,state,lat,lon,field")
    args = ap.parse_args()

    states = {s.strip() for s in args.states.split(",") if s.strip()}
    origins = []
    for spec in args.origin:
        label, state, lat, lon, field = spec.split(",")
        origins.append({"label": label, "lat": float(lat), "lon": float(lon), "field": field})

    rows = json.loads(DATA.read_text())
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}

    todo = sorted({(r["city"], r["state"]) for r in rows if r["state"] in states
                   and f"{r['city']}|{r['state']}" not in cache})
    for city, state in todo:
        found = geocode(city, state)
        if not found:
            print(f"  no geocode for {city}, {state}")
            continue
        cache[f"{city}|{state}"] = found
        time.sleep(1.05)
        print(f"  geocoded {city}, {state}")

    added = 0
    for row in rows:
        key = f"{row['city']}|{row['state']}"
        place = cache.get(key)
        if not place:
            continue
        for o in origins:
            if place.get(o["field"]) is None:
                place[o["field"]], place[o["field"].replace("min", "mi")] = route(o, place)
                added += 1
        for o in origins:
            if place.get(o["field"]) is not None:
                row[o["field"]] = place[o["field"]]

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1))
    DATA.write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    print(f"routed {added} new pairs across {len(rows)} entries")


if __name__ == "__main__":
    main()
