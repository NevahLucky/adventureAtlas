# Waypoint — An Atlas of Adventures Worth the Trip

A static, dependency-free field guide to 613 singular things to do in the United States, from world class spectacles to the local dance hall.
Browse by country → state → county, sort by any column, filter by budget, duration,
party size and category, and keep a personal shortlist.

Open `index.html` directly in a browser. No build step, server, CDN or network access is required.

## Structure

```
index.html                 country + state index (generated)
states/<state-slug>.html   one page per state, sortable/filterable table (generated)
regions/fort-mill.html     the 4-hour drive radius around Fort Mill, SC (generated)
regions/clemson.html       the 4-hour drive radius around Clemson, SC (generated)
data/adventures.json       single source of truth — edit this
data/regions/*.json        the regional source files the master list was merged from
data/by-state/*.json       per-state extracts (generated)
assets/atlas.css           all styling
assets/atlas.js            index + table behaviour
templates/index.html       page shell with {{TOKENS}}
templates/state.html       page shell with {{TOKENS}}
build.py                   regenerates every page, CSV and JSON extract
all-adventures.csv         flat export of the whole atlas (generated)
```

## Rebuild

```bash
python3 build.py
```

That rewrites `index.html`, all 51 state pages, `data/by-state/*.json`, and
`all-adventures.csv` from `data/adventures.json`. Never hand-edit the generated HTML.

To preview over HTTP instead of `file://`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Entry schema

| Field | Meaning |
|---|---|
| `name` | Adventure name |
| `city` | Nearest town or city |
| `county` | County / parish / borough / independent city |
| `state` | Full state name (must match `STATE_ORDER` in `build.py`) |
| `cats` | Array of categories (Physical, Water, Historical, Festival, Quirky…) |
| `cost` | Display string, indicative per-person cost |
| `cost_num` | Numeric mid-point in USD, used for sorting and budget filters |
| `dur` | Display duration |
| `dur_h` | Numeric hours, used for duration filters (multi-day = 24 × days) |
| `dates` | Season, festival window or "Year-round" |
| `start` | Year the place/event/venue was established, `1970s`, `c. 1050`, or `—` |
| `company` | Operator, institution, or "Free / self-guided" |
| `party` | Recommended party size, or `NA` if it genuinely doesn't matter |
| `customer` | Typical customer profile |
| `unique` | Why it is worth a flight |
| `buzz` | What reviews and word of mouth actually say |
| `rating` | 0–100 editorial enjoyment score (see below) |
| `drive_min` | Optional: traffic-free driving minutes from Fort Mill, SC, routed via OSM/Valhalla |
| `drive_min_clemson` | Optional: the same, from Clemson, SC |

## How the score works

`rating` is a single editorial number for how much a wide-ranging, experience-hungry
traveller would get out of the thing itself — novelty first, then thrill, craft,
hospitality, freedom to roam, value, and how well a first-timer is treated. It is
deliberately biased toward young adults but keeps world-class family institutions,
retiree rituals and kid-first places when they earn it. It is not a review-site average.

Rows default to `rating` descending; every column is sortable (shift-click adds a
secondary sort), and the header arrow shows direction.

## Regional pages

`regions/fort-mill.html` uses every entry with `drive_min <= 240`; `regions/clemson.html` uses
`drive_min_clemson <= 240`. A new nearby entry only needs the right field to appear on the page.
Drive times are traffic-free routing estimates (OpenStreetMap + Valhalla; origins: downtown Fort Mill
35.0074, -80.9451 and Clemson 34.6851, -82.8364); add 15–25% for rush hour. The raw geocodes and both
sets of times are cached in `data/drive-times.json`.

To build another regional page, copy `templates/region.html`, point `build.py` at a different
filter (a bounding box, a list of states, a maximum drive time) and add it to `main()`.

## Accuracy notes

- Costs are indicative per-person ranges for the activity, standard gear and guiding.
  They are deliberately ranges, not quotes; confirm with operators before booking.
- `start` is the establishment year of the venue, event, park or company where that is
  documented (e.g. Wynwood Walls 2009, Maid of the Mist 1846). `—` means it isn't a
  meaningful or reliably documented date.
- Seasonal windows shift; festivals move weekends. Always confirm the current year.
- Ratings are opinionated on purpose. They are the point of the atlas, not a claim of
  objectivity.

## Adding entries

Append an object with every field above to `data/adventures.json` (or to a file in
`data/regions/` and re-merge), then run `python3 build.py`. The build assigns stable
slugs, dedupes nothing silently, and fails loudly on an unknown state name.

## Git

```bash
git add -A
git commit -m "…"
```
