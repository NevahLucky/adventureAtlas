# Atlas build plan

## Where it stands

790 entries across all 51 states, 2026-08.

| State | Entries | Counties | | State | Entries | Counties |
|---|---:|---:|---|---|---:|---:|
| South Carolina | 134 | 44 | | Georgia | 29 | 19 |
| North Carolina | 83 | 38 | | Tennessee | 29 | 12 |
| California | 29 | 18 | | Florida | 25 | 16 |
| New York | 24 | 12 | | Texas | 21 | 12 |
| West Virginia | 18 | 14 | | Virginia | 16 | 13 |
| Pennsylvania | 16 | 11 | | Louisiana | 14 | 9 |
| Oregon | 14 | 10 | | Arizona | 14 | 8 |
| Colorado | 14 | 11 | | Hawaii | 13 | 5 |
| Utah | 13 | 8 | | Washington | 12 | 9 |
| Kentucky | 12 | 9 | | Ohio | 12 | 12 |
| Alaska | 11 | 7 | | Wisconsin | 11 | 8 |
| Mississippi | 10 | 8 | | Connecticut | 10 | 5 |
| Massachusetts | 10 | 8 | | Nevada | 10 | 5 |
| New Mexico | 10 | 8 | | South Dakota | 10 | 5 |
| Missouri | 10 | 6 | | Michigan | 10 | 9 |
| Illinois | 10 | 5 | | Arkansas | 9 | 9 |
| Alabama | 9 | 6 | | New Jersey | 9 | 8 |
| Wyoming | 8 | 6 | | Minnesota | 8 | 7 |
| Maryland | 7 | 4 | | Rhode Island | 7 | 3 |
| Maine | 7 | 5 | | Iowa | 7 | 7 |
| Oklahoma | 6 | 5 | | Delaware | 6 | 2 |
| Vermont | 6 | 6 | | New Hampshire | 6 | 3 |
| Idaho | 6 | 5 | | Montana | 6 | 6 |
| Kansas | 6 | 6 | | Indiana | 6 | 6 |
| North Dakota | 5 | 4 | | Nebraska | 5 | 5 |

Known county gaps in South Carolina: Saluda and Allendale.

## Definition of done

1. Every state has at least 30 entries.
2. Every state has at least one entry in each of these lanes: outdoor and adrenaline, food and drink, maker and class, history and oddity, local institution.
3. Every metro area of 250,000 or more has at least five entries within 30 minutes.
4. No entry needs fame to qualify. The test is whether a curious person would be glad they went.

## Queue

1. Georgia and Tennessee to 50 each. Both already have the anchors, so this is county level filling.
2. Florida, Virginia, West Virginia, Alabama, Mississippi, Kentucky, Arkansas, Louisiana to 35 each.
3. The bottom twenty states to 15 each, starting with Nebraska, North Dakota, Indiana, Kansas, Montana, Idaho, New Hampshire, Vermont, Delaware, Oklahoma.
4. Recheck the two South Carolina gaps.
5. Only then add a third country.

## Workflow

```bash
# 1. write entries into data/regions/<batch>.json with the same schema
python3 scripts/merge_regions.py
python3 scripts/drive_times.py \
  --states "South Carolina,North Carolina,Georgia,Tennessee" \
  --origin "Fort Mill,SC,35.0074,-80.9451,drive_min" \
  --origin "Clemson,SC,34.6851,-82.8364,drive_min_clemson"
python3 build.py
```

Then check a state page at 1440px and 420px, confirm the row count matches, and commit.

## Data rules

- Cost is an indicative per person range, not a quote.
- `start` is a documented year, a decade, or `—`. Never invent one.
- `unique` says why the thing is worth a detour. `buzz` says what people actually report.
- Ratings run 60 to 95. Local institutions sit in the 70s and low 80s and stay in.
- Categories are free text but reuse existing ones first so the filter stays useful.
