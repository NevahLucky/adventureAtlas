#!/usr/bin/env python3
"""Build data/county-pop.json from the Census county population estimates.

Floors in scripts/floors.py are derived from population, so this file is the
foundation of the whole depth audit. Refresh it once a year.

    python3 scripts/fetch_pop.py

Downloads the Census vintage estimate file (no API key), keeps the 050 rows
(counties and county equivalents), and writes {"State|County": population}.
Connecticut is mapped from its 2022 planning regions back to the eight legacy
counties, because the atlas and the county list still use those.
"""
from __future__ import annotations

import csv
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "county-pop.json"
COUNTIES = json.loads((ROOT / "data" / "counties.json").read_text())

VINTAGE = 2024
URL = (f"https://www2.census.gov/programs-surveys/popest/datasets/2020-{VINTAGE}"
       f"/counties/totals/co-est{VINTAGE}-alldata.csv")

# Connecticut replaced its counties with planning regions in 2022. The atlas keeps the
# eight legacy counties, so map back to them with the 2020 census counts.
CT = {
    "Fairfield": 957419, "Hartford": 899498, "Litchfield": 185186, "Middlesex": 164245,
    "New Haven": 864835, "New London": 268555, "Tolland": 149788, "Windham": 116418,
}

SUFFIX = re.compile(
    r"\s+(city and borough|county|parish|borough|census area|municipality|city|municipio)$",
    re.I,
)


def norm(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", SUFFIX.sub("", name.strip()).lower())


def main() -> int:
    print(f"downloading {URL}")
    with urllib.request.urlopen(URL, timeout=180) as r:
        raw = r.read().decode("latin-1")
    csv.field_size_limit(10**7)

    # Exact candidate matching, not fuzzy. A few states have a county and an independent city
    # with the same name ("Fairfax" and "Fairfax City"), and any normalisation that strips the
    # type word sends both Census rows to the same place.
    SUFFIXES = (" county", " parish", " borough", " census area", " municipality",
                " city and borough", "")
    lookup: dict[tuple[str, str], str] = {}
    for state, names in COUNTIES.items():
        for c in names:
            if c.lower().endswith(" city"):
                lookup[(state, c.lower())] = c
            else:
                for suf in SUFFIXES:
                    lookup[(state, c.lower() + suf)] = c

    pop: dict[str, int] = {}
    unmatched = []
    for row in csv.DictReader(io.StringIO(raw)):
        if row["SUMLEV"] != "050":
            continue
        state, county = row["STNAME"], row["CTYNAME"]
        value = int(row["POPESTIMATE2024"])
        if state == "Connecticut":
            continue
        if state == "District of Columbia":
            pop["District of Columbia|District of Columbia"] = value
            continue
        hit = lookup.get((state, county.lower()))
        if hit:
            pop[f"{state}|{hit}"] = value
        else:
            unmatched.append((state, county, value))

    for county, value in CT.items():
        pop[f"Connecticut|{county}"] = value

    # Second pass. A handful of counties share a name with an independent city in the same
    # state ("Fairfax" county and "Fairfax City"), so the loose match can send the row to the
    # city and leave the county empty. Match "X County" straight to a still-missing "X".
    for state, cty, value in unmatched:
        base = re.sub(r"\s+County$", "", cty, flags=re.I).strip()
        for candidate in COUNTIES.get(state, []):
            key = f"{state}|{candidate}"
            if candidate.lower() == base.lower() and key not in pop:
                pop[key] = value
                break

    still = [(s, c) for s, c, _ in unmatched if f"{s}|{c}" not in pop]

    missing = [f"{s}|{c}" for s, names in COUNTIES.items() for c in names
               if f"{s}|{c}" not in pop and c != "Statewide"]

    OUT.write_text(json.dumps(dict(sorted(pop.items())), indent=0) + "\n")
    print(f"wrote {len(pop)} counties to {OUT.relative_to(ROOT)}")
    print(f"still unresolved census rows: {len(still)} {still[:5]}")
    print(f"atlas counties with no population: {len(missing)} {missing[:8]}")
    print(f"total population: {sum(pop.values()):,}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
