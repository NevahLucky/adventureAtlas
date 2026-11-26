# Waypoint build plan and field notes

Read this before touching the data. It is the brief, not just a task list.

## The product

A browsable atlas of adventures in the United States, eventually the world. It is not a list of
attractions and it is not a travel brochure. The user is a multipotentialite: many different things
can hold their interest, but only if they hear about them. The failure mode is omission, not
inclusion. When in doubt, add it and rate it honestly. It is easier to remove an entry later than to
miss a place someone would have loved.

## Research by county, not by state

This is the central rule. States are a navigation layer. Counties are the unit of research.

The test for a county is the one visit test:

> If the user visits this county once in their life, and never comes back, what would they regret
> not doing? List all of it, then rate it.

If a county has one entry, that is not a finding about the county. It is a sign the research stopped
early. Almost every county in America has a courthouse square, a state park, a river access, a
family restaurant that has lasted forty years, a fairground, a speedway, a museum run by volunteers,
a church cookbook, a roadside oddity or a festival. Most have several.

A county page with one entry is a research failure. Go back.

### The method for one county

1. Find the county seat and the two or three other towns people actually live in.
2. Look for these in order: county museum or historical society, state park or wildlife refuge,
   river or lake access, fairground and annual festival, speedway or dirt track, historic district,
   the oldest restaurant or bakery, a maker or farm that takes visitors, a roadside landmark.
3. Search local sources, not listicles: county chambers, historical societies, state parks,
   recreation departments, local newspapers, festival pages.
4. Write five to eight entries for a rural county and ten to twenty for a metro county. No cap.
5. Apply the one visit test to each. If it is only a bench, cut it. If it is a bench with a story
   nobody else has, keep it and rate it in the low 70s.

### The state sweep

Do the county work first. Only at the end of a state, sweep for true duplicates.

Drop one entry only when all three are true:

- same category,
- nearly the same quality,
- within an hour of each other.

Otherwise keep both. Two music festivals in one state are not redundant if they are two hours
apart, and a second county fair is not redundant if it is the only thing in that county.

## What counts as an adventure

Side quests are the core of the product, not a side category.

- A glassblowing class twenty minutes from home.
- A line dancing bar where regulars teach you the steps.
- A velodrome with Tuesday night races and beginner classes.
- A drag strip where anyone with a car and a helmet can make a pass for twenty dollars.
- A honey farm with an observation hive and a keeper who explains the colony.
- A big cat sanctuary that explains the exotic pet trade instead of letting you pet a cub.
- An abandoned mill village that became a film set.
- A CCC park with a stone lodge and a swimming lake.
- A haunted prison with overnight investigations.
- An ATV park with a hundred miles of trail.
- A forge, a neon studio, a perfume archive, a taxidermy class.
- A counter that has sold the same fried chicken since 1944.

What does not count: generic breweries, chain restaurants, malls, hotel bars, anywhere you could
swap the name and have the same afternoon. Local does not automatically mean interesting, but
interesting is often local.

## Inclusion rules

1. If it makes a curious person say "oh, that is interesting", include it.
2. Do not cap entries per county, per state or per category.
3. Do not drop one music festival because another is better. Include both and give the better one a
   higher rating. The rating is the filter, not the inclusion decision.
4. Fame is irrelevant. A ten minute stop at a giant ball of twine can earn a 70. A world class museum
   can earn a 92. Both belong.
5. The floor is "would a curious friend be glad they went", not "is it nationally significant".
6. Prefer participatory things: classes, rides, tours, dances, races, forges, farms, sanctuaries,
   investigations, markets, workshops.
7. Bias toward young adults, but keep family institutions, retiree rituals and kid first places when
   they are genuinely good.
8. If a place is seasonal or appointment only, say so in the dates field. Never imply year round.
9. One entry can be a single object if the story is good enough. A bridge, a spring, a grave, a sign.

## Diversity lanes

Use this as a checklist for every county, not just every state. A county is not covered until it has
several lanes or a good reason it cannot.

- Adrenaline: skydiving, via ferrata, bungee, hang gliding, paragliding, aerobatics.
- Air: gliders, balloons, flightseeing, dogfights, blimps.
- Water: rafting, kayaking, springs, diving, snorkeling, sailing, surfing.
- Snow: ski, snowshoe, ice climbing, sled dogs, snow sculptures.
- Off road: ATV parks, rock crawling, dune buggies, overland routes, rally school.
- Motorsport: drag strips, dirt ovals, track days, demolition derbies, karting, land speed.
- Maker and class: glass, forge, pottery, neon, perfume, taxidermy, butchery, baking, welding.
- Food and drink: institutions, distilleries, farms, markets, cooking classes, food halls.
- Animals: sanctuaries, rescues, farms, apiaries, falconry, bat flights, wildlife refuges.
- Haunted and dark: prisons, asylums, ghost towns, tours, overnight investigations.
- History: battlefields, plantations, native sites, labor history, civil rights, industrial ruins.
- Art: museums, outsider art, sculpture parks, murals, residencies, galleries.
- Music and nightlife: honky tonks, punk rooms, jazz clubs, bluegrass, DJ nights, record shops.
- Performance: theater, burlesque, improv, circus, storytelling, Shakespeare.
- Games: arcades, pinball, escape rooms, board game cafes, mini golf, disc golf.
- Spiritual: chapels, vortexes, meditation, pilgrimage sites, cemeteries.
- Wellness: hot springs, bathhouses, salt caves, saunas.
- Quirky and roadside: giant objects, museums of odd things, gravity hills, novelty architecture.
- Community: third places, diners, dance halls, flea markets, civic festivals, volunteer nights.
- Sports: minor league, roller derby, speedways, climbing gyms, curling, polo, rodeo.
- Literature and film: author houses, film locations, bookshops, festivals.
- Science and industry: caves, observatories, power plants, mines, factories, aquariums.
- Rail and transit: heritage railroads, depots, funiculars, incline railways, canal locks.
- Cycling: rail trails, velodromes, mountain bike parks, BMX.

## Coverage targets

- Minimum 30 entries per state. Dense states should reach 50 or more.
- At least five entries within 30 minutes of every metro area above 250,000 people.
- No county below three entries where the county has three real things. One entry is not done.
- No per county cap. Greenville County, SC is the current high at 15.
- A state is done when every county is at three or more and the state sweep for duplicates is finished.
- Only after the United States is at target should another country be started.

## The coverage audit

`data/counties.json` holds the official Census county list for all 51 states and districts.
`scripts/coverage.py` compares it to the atlas and prints, per state: entries, total counties,
counties covered, and how many have one, two, or three or more entries. It also flags county names
that do not match the Census list, which usually means a spelling or type error.

```bash
python3 scripts/coverage.py
```

Current picture: 469 of 3,143 counties covered. South Carolina is 46 of 46. Georgia is 20 of 159.
300 counties nationally still have a single entry, and those are the backlog.

## The radius tool

`explore.html` lets the user pick a state, a county, and a town, then set a drive time in hours and
minutes. There is no four hour ceiling. Results sort by closest, best rated or cheapest, and filter
by category and price.

Drive times are estimated in the browser from coordinates: `minutes = 16 + 1.16 * straight line
miles`, calibrated against the routed Fort Mill and Clemson pages. Expect within about ten minutes
of a real routing, which the user has said is fine for planning. The saved radius pages keep exact
routed times for those two origins.

## Where it stands, 937 entries

South Carolina is done for this pass: 220 entries across all 46 counties, minimum three per county,
zero single-entry counties. That makes it the model for the other states.

Georgia has started in earnest: 89 entries in 28 of 159 counties. The Atlanta core (Fulton, DeKalb,
Cobb, Gwinnett, Clayton) is in, along with Savannah, Macon, Columbus, Albany, Athens, Augusta,
Brunswick and the Golden Isles, Rome, Milledgeville, Thomasville, Dahlonega, Blue Ridge, Ellijay,
Helen, Waycross and the Okefenokee. 131 counties remain.

| State | Entries | Counties | | State | Entries | Counties |
|---|---:|---:|---|---|---:|---:|
| South Carolina | 220 | 46 | | New Mexico | 10 | 8 |
| North Carolina | 83 | 38 | | Nevada | 10 | 5 |
| Georgia | 89 | 28 | | Massachusetts | 10 | 8 |
| California | 30 | 18 | | Connecticut | 9 | 5 |
| Tennessee | 29 | 12 | | New Jersey | 9 | 8 |
| Florida | 25 | 16 | | Alabama | 9 | 6 |
| New York | 24 | 12 | | Mississippi | 9 | 8 |
| Texas | 21 | 12 | | Arkansas | 9 | 9 |
| West Virginia | 18 | 14 | | Minnesota | 8 | 7 |
| Pennsylvania | 16 | 11 | | Wyoming | 8 | 6 |
| Virginia | 16 | 13 | | Iowa | 7 | 7 |
| Colorado | 14 | 11 | | Maine | 7 | 5 |
| Arizona | 14 | 8 | | Rhode Island | 7 | 3 |
| Oregon | 14 | 10 | | Maryland | 7 | 4 |
| Louisiana | 14 | 9 | | District of Columbia | 7 | 1 |
| Utah | 13 | 8 | | Indiana | 6 | 6 |
| Hawaii | 13 | 5 | | Kansas | 6 | 6 |
| Ohio | 12 | 12 | | Montana | 6 | 6 |
| Washington | 12 | 9 | | Idaho | 6 | 5 |
| Kentucky | 12 | 9 | | New Hampshire | 6 | 3 |
| Wisconsin | 11 | 8 | | Vermont | 6 | 6 |
| Alaska | 11 | 7 | | Delaware | 6 | 2 |
| Illinois | 10 | 5 | | Oklahoma | 6 | 5 |
| Michigan | 10 | 9 | | Nebraska | 5 | 5 |
| Missouri | 10 | 6 | | North Dakota | 5 | 4 |
| South Dakota | 10 | 5 | | | | |

## Queue, county by county

1. Georgia. 28 of 159 counties have entries. Next: the remaining Atlanta metro counties (Fayette,
   Henry, Douglas, Paulding, Cherokee, Forsyth, Rockdale, Newton), then south and west Georgia county
   by county, until all 159 are at three or more.
2. North Carolina. 38 of 100 counties have entries, 62 are blank. Start with Mecklenburg, Wake,
   Guilford, Forsyth, Durham, Buncombe, New Hanover, Buncombe and the rural east.
3. Tennessee. 12 of 95 counties. Start with Davidson, Knox, Hamilton, Shelby, Sevier, Blount.
4. Florida, Virginia, West Virginia, Alabama, Mississippi, Kentucky, Arkansas and Louisiana.
5. The remaining states, thinnest first, using the coverage report to choose.
6. Then a third country, using the same rules.

## Verification

- Check that every operator still exists before adding it. A 2026 audit found three closures and
  removed them: Charleston Cooks, the Viking Cooking School in Ridgeland, and Fleishers in Cos Cob.
- The UFO Welcome Center in Bowman was demolished and is not in the atlas. Do not add places from
  old listicles without checking that they still exist.
- Mars Bluff is a roadside marker, not a crater you can walk into. Say so.
- For haunted places, write "reported" and "said to", and lead with the documented history.
- Costs are indicative per person ranges. Dates are windows. Start is a documented year, a decade,
  or `—`. Never invent a year.
- Prefer official sites, tourism boards, local press and recent reviews over listicles.

## Data rules

- One JSON object per entry. See `README.md` for the schema.
- `unique` answers "why is this worth a detour". `buzz` answers "what do people actually say".
- Ratings run 60 to 95. Local institutions sit in the 70s and low 80s and stay in.
- Reuse existing categories first so the filters stay useful.
- No dashes as sentence punctuation. Compound words like hole-in-the-wall are fine.
- Do not use marketing adjectives. Specifics beat adjectives.

## Workflow

```bash
# 1. Add entries to data/regions/<county-batch>.json using the same schema
python3 scripts/merge_regions.py
python3 scripts/drive_times.py \
  --states "Georgia,Tennessee" \
  --origin "Fort Mill,SC,35.0074,-80.9451,drive_min" \
  --origin "Clemson,SC,34.6851,-82.8364,drive_min_clemson"
python3 build.py
python3 scripts/coverage.py
# 2. Open explore.html and a state page at 1440px and 420px, confirm the row counts, then commit
```

If the Valhalla router is slow, use OSRM directly:
`https://router.project-osrm.org/route/v1/driving/{lon},{lat};{lon},{lat}?overview=false`
and convert seconds to minutes and meters to miles.

Keep batches to 20 or 30 entries so each commit is easy to review.

## Deploy

`npx vercel` from the project folder. Framework is Other, no build command, output directory is the
current folder. See `DEPLOY.md`.

## First moves in a fresh session

1. Read `PLAN.md`, then `README.md`.
2. Run `python3 scripts/coverage.py` and pick the next county from the thinnest state.
3. Run `python3 build.py` and open `explore.html` and one state page.
4. List what the county actually has, then write five to eight entries.
5. Merge, route, build, check both widths, commit.
6. Repeat for the next county. Only sweep a state for duplicates after all its counties are at three.
