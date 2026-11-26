#!/usr/bin/env python3
"""Build the Waypoint atlas: index.html + one page per US state.

Source of truth: data/adventures.json
Outputs: index.html, states/<slug>.html, data/*.json, all-adventures.csv
"""
from __future__ import annotations

import csv
import json
import re
import shutil
import statistics
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).parent
DATA = ROOT / "data" / "adventures.json"
STATES = ROOT / "states"

STATE_ORDER = [
    ("Alabama", "AL"), ("Alaska", "AK"), ("Arizona", "AZ"), ("Arkansas", "AR"),
    ("California", "CA"), ("Colorado", "CO"), ("Connecticut", "CT"), ("Delaware", "DE"),
    ("District of Columbia", "DC"), ("Florida", "FL"), ("Georgia", "GA"), ("Hawaii", "HI"),
    ("Idaho", "ID"), ("Illinois", "IL"), ("Indiana", "IN"), ("Iowa", "IA"),
    ("Kansas", "KS"), ("Kentucky", "KY"), ("Louisiana", "LA"), ("Maine", "ME"),
    ("Maryland", "MD"), ("Massachusetts", "MA"), ("Michigan", "MI"), ("Minnesota", "MN"),
    ("Mississippi", "MS"), ("Missouri", "MO"), ("Montana", "MT"), ("Nebraska", "NE"),
    ("Nevada", "NV"), ("New Hampshire", "NH"), ("New Jersey", "NJ"), ("New Mexico", "NM"),
    ("New York", "NY"), ("North Carolina", "NC"), ("North Dakota", "ND"), ("Ohio", "OH"),
    ("Oklahoma", "OK"), ("Oregon", "OR"), ("Pennsylvania", "PA"), ("Rhode Island", "RI"),
    ("South Carolina", "SC"), ("South Dakota", "SD"), ("Tennessee", "TN"), ("Texas", "TX"),
    ("Utah", "UT"), ("Vermont", "VT"), ("Virginia", "VA"), ("Washington", "WA"),
    ("West Virginia", "WV"), ("Wisconsin", "WI"), ("Wyoming", "WY"),
]
ABBR = dict(STATE_ORDER)


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def esc(s) -> str:
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def money(n: int) -> str:
    return "Free" if n == 0 else f"${n:,.0f}"


def load() -> list[dict]:
    rows = json.loads(DATA.read_text())
    seen = set()
    for r in rows:
        assert r["state"] in ABBR, f"unknown state: {r['state']}"
        rid = slugify(f"{r['name']}-{r['city']}")
        base, i = rid, 2
        while rid in seen:
            rid, i = f"{base}-{i}", i + 1
        seen.add(rid)
        r["id"] = rid
        r.setdefault("cats", [])
        r["county"] = r.get("county") or "—"
    rows.sort(key=lambda r: (-r["rating"], r["state"], r["name"]))
    return rows


def build_index(rows: list[dict]) -> str:
    by_state: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        by_state[r["state"]].append(r)

    counties = {(r["state"], r["county"]) for r in rows if r["county"] != "—"}
    cats = Counter(c for r in rows for c in r["cats"])
    free = sum(1 for r in rows if r["cost_num"] == 0)
    med = int(statistics.median(r["cost_num"] for r in rows))

    cards = []
    for name, ab in STATE_ORDER:
        items = by_state.get(name, [])
        if not items:
            continue
        top = items[0]
        cs = len({r["county"] for r in items if r["county"] != "—"})
        cards.append({
            "name": name, "abbr": ab, "slug": slugify(name), "count": len(items),
            "counties": cs, "top": top["name"], "topRating": top["rating"],
            "topId": top["id"],
            "topCounty": top["county"],
            "avg": round(sum(r["rating"] for r in items) / len(items)),
            "free": sum(1 for r in items if r["cost_num"] == 0),
            "best": max(r["rating"] for r in items),
        })
    cards.sort(key=lambda c: (-c["best"], c["name"]))

    p = rows[0]
    blurb = p["unique"].split(". ")[0].rstrip(".") + "."
    pick = f"""<aside class="hero-pick">
        <div class="hp-label">Top of the atlas</div>
        <a class="hp-name" href="states/{slugify(p['state'])}.html#{p['id']}">{esc(p['name'])}</a>
        <div class="hp-place">{esc(p['city'])}, {esc(p['state'])} &middot; {esc(p['county'])} County</div>
        <div class="hp-score"><b>{p['rating']}</b><span>of 100 &middot; {esc(p['cost'])} &middot; {esc(p['dur'])}</span></div>
        <p>{esc(blurb)}</p>
        <div class="hp-foot">{esc(' / '.join(p['cats'][:3]))}</div>
      </aside>"""

    top = rows[:15]
    top_html = []
    for i, r in enumerate(top, 1):
        top_html.append(f"""
      <a class="lead-row" href="states/{slugify(r['state'])}.html#{r['id']}">
        <span class="lead-num">{i:02d}</span>
        <span class="lead-main">
          <span class="lead-name">{esc(r['name'])}</span>
          <span class="lead-meta">{esc(r['city'])}, {esc(r['state'])} &middot; {esc(r['county'])} County &middot; {esc(' / '.join(r['cats'][:2]))}</span>
        </span>
        <span class="lead-cost">{esc(r['cost'])}</span>
        <span class="lead-score">{r['rating']}</span>
      </a>""")

    cat_html = "".join(
        f'<span class="cat-pill">{esc(c)}<b>{n}</b></span>' for c, n in cats.most_common(14)
    )

    tpl = (ROOT / "templates" / "index.html").read_text()
    return (
        tpl.replace("{{STATS}}", json.dumps({
            "total": len(rows), "states": len(by_state), "counties": len(counties),
            "cats": len(cats), "free": free, "median": med,
        }))
        .replace("{{CARDS}}", json.dumps(cards, ensure_ascii=False))
        .replace("{{TOP}}", "".join(top_html))
        .replace("{{CATS}}", cat_html)
        .replace("{{PICK}}", pick)
        .replace("{{TOPN}}", str(len(top)))
        .replace("{{BUILD}}", __import__("datetime").date.today().strftime("%B %Y"))
    )


def build_state(rows: list[dict], name: str, all_rows: list[dict]) -> str:
    ab = ABBR[name]
    items = [r for r in rows if r["state"] == name]
    counties = sorted({r["county"] for r in items if r["county"] != "—"})
    costs = [r["cost_num"] for r in items]
    stats = {
        "count": len(items), "counties": len(counties),
        "free": sum(1 for r in items if r["cost_num"] == 0),
        "median": int(statistics.median(costs)),
        "top": max(r["rating"] for r in items),
    }
    order = [n for n, _ in STATE_ORDER]
    i = order.index(name)
    prev = order[i - 1] if i > 0 else None
    nxt = order[i + 1] if i < len(order) - 1 else None

    tpl = (ROOT / "templates" / "state.html").read_text()
    return (
        tpl.replace("{{STATE}}", esc(name))
        .replace("{{STATE_JSON}}", json.dumps(name))
        .replace("{{ABBR}}", ab)
        .replace("{{SLUG}}", slugify(name))
        .replace("{{STATS}}", json.dumps(stats))
        .replace("{{COUNTIES}}", json.dumps(counties, ensure_ascii=False))
        .replace("{{ROWS}}", json.dumps(items, ensure_ascii=False))
        .replace("{{PREV}}", "" if not prev else f'<a class="pager-link" href="{slugify(prev)}.html">&larr; {esc(prev)}</a>')
        .replace("{{NEXT}}", "" if not nxt else f'<a class="pager-link" href="{slugify(nxt)}.html">{esc(nxt)} &rarr;</a>')
    )


def write_csv(rows: list[dict]) -> None:
    cols = [
        ("name", "Adventure"), ("county", "County"), ("state", "State"), ("city", "City"),
        ("cats", "Category"), ("cost", "Cost"), ("dur", "Duration"), ("party", "Party Size"),
        ("dates", "Season / Dates"), ("start", "Established"), ("company", "Company / Access"),
        ("customer", "Typical Customer"), ("unique", "Uniqueness"), ("buzz", "Reviews"),
        ("rating", "Overall Rating"),
    ]
    with (ROOT / "all-adventures.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow([c[1] for c in cols])
        for r in rows:
            w.writerow([(" / ".join(r[k]) if k == "cats" else r[k]) for k, _ in cols])


def main() -> None:
    rows = load()
    if STATES.exists():
        shutil.rmtree(STATES)
    STATES.mkdir()
    (ROOT / "data" / "by-state").mkdir(exist_ok=True)

    (ROOT / "index.html").write_text(build_index(rows), encoding="utf-8")
    for name, _ in STATE_ORDER:
        items = [r for r in rows if r["state"] == name]
        if not items:
            continue
        (STATES / f"{slugify(name)}.html").write_text(
            build_state(rows, name, rows), encoding="utf-8"
        )
        (ROOT / "data" / "by-state" / f"{slugify(name)}.json").write_text(
            json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8"
        )
    write_csv(rows)
    print(f"built {len(rows)} adventures, {len({r['state'] for r in rows})} states, "
          f"{len(list(STATES.glob('*.html')))} state pages")


if __name__ == "__main__":
    main()
