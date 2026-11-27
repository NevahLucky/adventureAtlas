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
2. There is no cap, ever. Not per county, per state or per category. If Fulton County has thirty qualifying entries, it gets thirty. Never stop because a county already has ten, fifteen or fifty.
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

- A county is not done until it clears its floor: five entries for a rural county, eight for a county
  with a real town in it, twelve for a metro county and fifteen for a metro of a million people or
  more. `data/metros.json` lists the metro counties, and `scripts/gaps.py` applies the floor.
- Minimum 30 entries per state. Dense states should reach 50 or more.
- At least five entries within 30 minutes of every metro area above 250,000 people.
- Three entries is the alarm, not the target. A county sitting on exactly three was filled to a
  threshold, not researched. Florida has 38 counties on exactly three and 61 of 67 under five.
- There is no cap of any kind. Greenville County, SC is the current high at 15 and it can take more.
  Depth is the product. A thin county is a research failure.
- A state is done when every county clears its floor, not when every county has something, and the
  duplicate sweep is finished.
- Only after the United States is at target should another country be started.

## The coverage audit

`data/counties.json` holds the official Census county list for all 51 states and districts.
`scripts/coverage.py` answers whether a county is in the atlas at all. `scripts/gaps.py` answers
whether it is actually researched, by measuring every county against its floor. Run both.

```bash
python3 scripts/coverage.py
python3 scripts/gaps.py                       # every county under its floor, worst first
python3 scripts/gaps.py --state Florida
python3 scripts/gaps.py --at 3               # the counties filled to the old threshold
```

Current picture: 1,274 of 3,143 counties covered, 3,780 entries. Every state and district has at
least thirty entries. 266 counties nationally still have a single entry, and 3,008 counties sit
under their floor, 13,122 entries short. `coverage.py` prints the coverage table and `gaps.py`
prints the depth table; the numbers in this file go stale, those two commands do not.

Five states have every county covered: Georgia (594 in 159), North Carolina (337 in 100), Tennessee
(362 in 95), South Carolina (287 in 46) and Florida (192 in 67). All five have had the duplicate
sweep. Covered is not deep, and by the floors above none of the five is finished: South Carolina is
5 counties short, Tennessee 81, North Carolina 97, Georgia 140, and Florida 66 of 67 with 262 entries
missing. Florida is the clearest threshold sweep in the atlas. Thirty eight of its 67 counties sit
on exactly three entries, and Miami-Dade, its largest metro, has nine.

## The radius tool

`explore.html` lets the user pick a state, a county, and a town, then set a drive time in hours and
minutes. There is no four hour ceiling. Results sort by closest, best rated or cheapest, and filter
by category and price.

Drive times are estimated in the browser from coordinates: `minutes = 16 + 1.16 * straight line
miles`, calibrated against the routed Fort Mill and Clemson pages. Expect within about ten minutes
of a real routing, which the user has said is fine for planning. The saved radius pages keep exact
routed times for those two origins.

## Where it stands, 3,780 entries

Five states are covered: Georgia (594 in 159 counties), North Carolina (337 in 100), Tennessee (362
in 95), South Carolina (287 in 46) and Florida (192 in 67). None of the five is deep. Behind them the
thickest are Virginia (212 in 53 of 133), New York (157 in 44 of 62) and Pennsylvania (89 in 32 of 67).

Coverage is no longer the queue. Depth is. 3,008 counties sit under their floor, 13,122 entries short,
and the order by entries missing is Texas 1,337, Missouri 584, Kentucky 584, Illinois 546, Virginia
525, Kansas 516, Ohio 466, Iowa 464, Indiana 458, Nebraska 456, Michigan 427, Minnesota 401, Florida
262. `python3 scripts/gaps.py` is the live number.

## Queue

1. Florida, depth pass. 262 entries short across 66 counties. Thirty eight counties on exactly three
   entries and every metro on three to nine. Start with Miami-Dade at 9, then Broward, Palm Beach,
   Hillsborough, Duval, Orange and Pinellas, all between three and five.
2. The other covered states, by how short they are: South Carolina 24 entries, Tennessee 189,
   North Carolina 213, Georgia 284.
3. Texas, coverage and depth together. 17 of 254 counties and 52 entries, the largest single gap in
   the atlas. Region by region: the Hill Country (Kerr, Gillespie, Bandera, Kendall, Llano, Burnet,
   Blanco), then Wichita Falls, Abilene, Tyler, Waco, the Valley, then the Panhandle.
4. The Midwest and Plains, thinnest first: Illinois, Missouri, Kentucky, Kansas, Indiana, Nebraska.
5. The South: Alabama, Mississippi, Arkansas, Oklahoma, Louisiana.
6. The mid-Atlantic and Northeast depth pass: Virginia 53 of 133, Pennsylvania 32 of 67, New York 44
   of 62, then the New England states that are complete but thin.
7. Then a third country, using the same rules.

Fill single-entry, two-entry and three-entry counties before widening to a new state where the
choice is close. A county at one is a research failure, and so is a metro at three.

## Verification

- Check that every operator still exists before adding it. A 2026 audit found three closures and
  removed them: Charleston Cooks, the Viking Cooking School in Ridgeland, and Fleishers in Cos Cob.
  Removals go in `data/removed.json`. The merge script skips that list, because otherwise an older
  region file will quietly bring a closed business back on the next merge. It happened once.
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
# 2. Open explore.html and a state page at 1440px and 420px, confirm the row counts, commit and push
```

If the Valhalla router is slow, use OSRM directly:
`https://router.project-osrm.org/route/v1/driving/{lon},{lat};{lon},{lat}?overview=false`
and convert seconds to minutes and meters to miles.

Keep batches to 20 or 30 entries so each commit is easy to review.

## Parallel rounds

Research is the slow part and it parallelizes cleanly. The repo needs no branches, because the unit
of work is already one file per batch. What it needs is one writer.

Roles:

- Workers research a claimed set of counties and write exactly one new file in `data/regions/`.
  They may read anything. They may not touch `data/adventures.json`, `PLAN.md`, `data/claims.json`,
  the generated HTML or git, and they do not run the scripts.
- The pipeline owner runs merge, route, build, coverage and the commit, one round at a time.

The claim ledger. `scripts/claim.py` assigns counties and records who holds them.

```bash
python3 scripts/claim.py next --owner r05 --state Texas --counties "Kerr,Kendall"
python3 scripts/claim.py list
python3 scripts/claim.py release --id r05
```

It hands out the thinnest counties first, refuses a county a live claim already holds, and expires
claims after three hours so a killed round cannot wedge the queue. Never start a county that
`claim.py list` shows under another owner. `merge_regions.py` dedupes on (name, state) in filename
order and drops the loser without a word, so an overlap costs one worker the whole batch.

The lock. `scripts/pipeline.py` holds an exclusive lock on `data/.pipeline.lock` across the merge,
the route, the build and the commit. A second session that runs it exits 3 immediately instead of
interleaving a build with someone else's merge.

```bash
python3 scripts/pipeline.py                        # merge, route, build, audit. No commit.
python3 scripts/pipeline.py --commit -m "Add ..."  # also commit
python3 scripts/pipeline.py --push -m "Add ..."    # commit and push, deploys
```

It routes only the states the merge actually added entries for, runs `coverage.py`, then audits:
broken region JSON, duplicate (name, state), missing fields, and the thirty entry state floor. It
refuses to commit when the audit fails. Exit codes: 2 broken region file, 3 already running, 4
audit failed.

Model split, measured on the same county prompt:

- `kimi-k3.1-pro` for county research. Schema compliance is identical to deepseek, but it finds more
  of the county, and recall is the whole job. It also came in at 118 seconds per six entries against
  34 for deepseek, which parallel workers absorb.
- `deepseek-v4.1-flash` for triage, mechanical passes and reformatting, where the work is judgement
  over existing entries rather than recall.

Delegation is pinned in the profile config, so `delegate_task` children inherit kimi:

```bash
hermes config set delegation.provider ollama-launch
hermes config set delegation.model kimi-k3.1-pro:cloud
```

Round procedure:

1. Claim a coherent cluster, not alphabetical counties. Neighbouring counties share day trips,
   papers and tourism boards, so one worker's research compounds. Six to ten counties per worker.
2. Spawn one child per claim. Give it the county list, the exact output file, the schema and the rules
   from this file. Tell it to verify every operator still exists and to leave out anything it cannot
   confirm.
3. When the children return, run `python3 scripts/pipeline.py --commit -m "..."`, and read the audit
   before pushing.
4. Push. Vercel rebuilds from the committed HTML.
5. Release the claims.

Throughput to plan against: one worker produces roughly twenty entries in ten to fifteen minutes
with search. Six workers is where the serial pipeline, not the research, becomes the limit, because
routing costs about a second per new city.

What kills a round, learned by running one:

- One county per worker and per file. Two workers sharing an output file means one silently
  overwrites the other.
- Workers cannot use `execute_code` or `terminal`. Those need a human approval a background child
  cannot get, and the attempt wastes a turn. Give them `web_search`, `web_extract`, `read_file` and
  `write_file` only.
- Workers must write their file early, after the first three entries, then rewrite it with the full
  list. The first attempt gave two workers two counties each, and at 57 and 64 tool calls the
  runtime stopped them with good research and nothing written. A file with five entries beats a
  perfect answer that never lands.
- Budget about forty tool calls per worker, which is six to ten entries for a rural county and ten
  to fourteen for a metro. Search in batches of four or five queries, not one at a time.

## Deploy and update

The site is live through GitHub, not the Vercel CLI.

- Repo: `git@github.com:NevahLucky/adventureAtlas.git`, branch `trunk`.
- Vercel project: `adventure-atlas`, framework preset Other, root `./`, no build command.
- Every push to `trunk` triggers a production deploy. Nothing else is required.

Vercel does not run `build.py`. It serves the committed HTML. Always build before committing:

```bash
cd /home/brown/Isolate/adventures-atlas
python3 scripts/merge_regions.py   # only if new files in data/regions
python3 build.py
git add -A
git commit -m "Describe the batch"
git push
```

Then watch the deployment in the Vercel dashboard. It usually finishes in under a minute.

Rules:

- Commit the generated files (`index.html`, `explore.html`, `states/`, `regions/`). They are the site.
- Push to `trunk`. A push to another branch will not update production.
- If a push does not trigger a deploy, open the project, Deployments, and redeploy the latest.
- The CLI still works (`npx vercel --prod`) but it uploads the folder as is and bypasses Git. Use it
  only for an emergency deploy, because the next Git push will overwrite it.
- Custom domain and analytics are set in the Vercel dashboard, not in this repo.

## First moves in a fresh session

1. Read `PLAN.md`, then `README.md`.
2. Run `python3 scripts/coverage.py`, then `python3 scripts/claim.py list` to see what is already
   in flight.
3. Claim the next cluster: `python3 scripts/claim.py next --owner <name> --state Texas --counties
   "Kerr,Kendall"`.
4. Research the claimed counties, either yourself or with one child per claim, and write one new
   file per claim in `data/regions/`.
5. `python3 scripts/pipeline.py --push -m "..."`, then `python3 scripts/claim.py release --id <id>`.
6. Only sweep a state for duplicates after all its counties are at three.
