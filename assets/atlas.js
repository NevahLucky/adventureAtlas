/* Waypoint atlas — index + per-state table */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function num(n) { return Number(n).toLocaleString("en-US"); }
  function money(n) { return n === 0 ? "Free" : "$" + num(n); }

  /* ---------------------------------------------------------------- INDEX */
  if (document.body.dataset.page === "index") {
    var S = window.ATLAS.stats;
    $("#stats").innerHTML = [
      [num(S.total), "Adventures"],
      [String(S.states), "States & DC"],
      [num(S.counties), "Counties"],
      [String(S.cats), "Categories"],
      ["$" + num(S.median), "Median cost"]
    ].map(function (p) {
      return '<div class="stat"><b>' + p[0] + "</b><span>" + p[1] + "</span></div>";
    }).join("");

    var STATES = window.ATLAS.states;
    var grid = $("#stateGrid");
    var input = $("#stateSearch");
    var countEl = $("#stateCount");
    var sortMode = "best";

    function stateCard(c) {
      return '<a class="state-card" href="states/' + c.slug + '.html" ' +
        'data-name="' + esc(c.name.toLowerCase()) + '" ' +
        'data-text="' + esc((c.name + " " + c.top + " " + c.topCounty).toLowerCase()) + '">' +
        '<div class="sc-top"><span class="sc-abbr">' + esc(c.abbr) + '</span>' +
        '<span class="score-chip">' + c.best + '</span></div>' +
        "<div><h3>" + esc(c.name) + "</h3></div>" +
        '<div class="sc-topick">' + esc(c.top) + "<span>" + esc(c.topCounty) +
        " &middot; " + c.count + " " + (c.count === 1 ? "entry" : "entries") + "</span></div>" +
        '<div class="sc-foot"><span>' + c.counties + " " + (c.counties === 1 ? "county" : "counties") +
        "</span>" + (c.free ? '<span class="free-flag">' + c.free + " free</span>" : "<span></span>") +
        "</div></a>";
    }

    function renderStates() {
      var q = input.value.trim().toLowerCase();
      var list = STATES.filter(function (c) {
        return !q || c.name.toLowerCase().indexOf(q) > -1 || c.top.toLowerCase().indexOf(q) > -1 ||
          c.topCounty.toLowerCase().indexOf(q) > -1 || c.abbr.toLowerCase() === q;
      });
      if (sortMode === "az") list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      if (sortMode === "count") list.sort(function (a, b) { return b.count - a.count || b.best - a.best; });
      if (sortMode === "best") list.sort(function (a, b) { return b.best - a.best || a.name.localeCompare(b.name); });
      grid.innerHTML = list.map(stateCard).join("") ||
        '<div class="empty" style="grid-column:1/-1"><b>No state matches that.</b>Try a county, a city, or an adventure name.</div>';
      countEl.textContent = list.length + " of " + STATES.length + " states";
    }
    input.addEventListener("input", renderStates);
    $$("#sortSeg button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#sortSeg button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        sortMode = b.dataset.sort;
        renderStates();
      });
    });
    renderStates();
    return;
  }

  /* ---------------------------------------------------------------- STATE */
  if (document.body.dataset.page !== "state") return;
  var D = window.STATE;
  var rows = D.rows.slice();

  var st = {
    key: "rating", dir: -1, secondary: null,
    q: "", county: "", cats: [], dur: "", cost: "", party: "", starOnly: false
  };
  var STARS = {};
  try { STARS = JSON.parse(localStorage.getItem("waypoint:stars") || "{}"); } catch (e) { STARS = {}; }
  function saveStars() { try { localStorage.setItem("waypoint:stars", JSON.stringify(STARS)); } catch (e) {} }

  /* header */
  $("#stateSub").textContent = D.stats.count + " adventures across " + D.stats.counties +
    " counties, from free afternoons to week-long expeditions. Sorted by how much you'd enjoy them; " +
    "filter the list down to a county and a free Saturday.";
  $("#stateStats").innerHTML = [
    [D.stats.count, "Adventures"], [D.stats.counties, "Counties"],
    [D.stats.free, "Free"], ["$" + num(D.stats.median), "Median cost"], [D.stats.top, "Top score"]
  ].map(function (p) {
    return "<div><b>" + p[0] + "</b><span>" + p[1] + "</span></div>";
  }).join("");

  /* county select + chips */
  var sel = $("#fCounty");
  D.counties.forEach(function (c) {
    var o = document.createElement("option");
    o.value = c; o.textContent = c;
    sel.appendChild(o);
  });
  $("#countyChips").innerHTML = D.counties.map(function (c) {
    return '<button class="county-chip" data-county="' + esc(c) + '">' + esc(c) + "</button>";
  }).join("");

  /* category chips */
  var catCounts = {};
  rows.forEach(function (r) { (r.cats || []).forEach(function (c) { catCounts[c] = (catCounts[c] || 0) + 1; }); });
  var cats = Object.keys(catCounts).sort(function (a, b) { return catCounts[b] - catCounts[a]; });
  $("#catRow").innerHTML = '<span class="lbl">Category</span>' + cats.map(function (c) {
    return '<button class="chip" data-cat="' + esc(c) + '">' + esc(c) + '<span class="n">' + catCounts[c] + "</span></button>";
  }).join("");

  /* ------------------------------------------------------------- helpers */
  function partyTag(p) {
    p = String(p || "").trim();
    if (/^na$/i.test(p) || p === "" || p === "—") return "na";
    var nums = p.match(/\d+/g);
    if (!nums) return "na";
    var a = +nums[0], b = +(nums[1] || nums[0]);
    if (/solo/i.test(p)) return "solo";
    if (b <= 2) return "couple";
    if (b <= 6) return "small";
    return "big";
  }
  function durOK(h) {
    if (!st.dur) return true;
    var p = st.dur.split("-").map(Number);
    return h >= p[0] && h < p[1];
  }
  function costOK(c) {
    if (!st.cost) return true;
    var p = st.cost.split("-").map(Number);
    return c >= p[0] && c <= p[1];
  }
  function match(r) {
    if (st.county && r.county !== st.county) return false;
    if (st.cats.length && !st.cats.some(function (c) { return (r.cats || []).indexOf(c) > -1; })) return false;
    if (!durOK(r.dur_h)) return false;
    if (!costOK(r.cost_num)) return false;
    if (st.party && partyTag(r.party) !== st.party) return false;
    if (st.starOnly && !STARS[r.id]) return false;
    if (st.q) {
      var hay = [r.name, r.city, r.county, r.company, (r.cats || []).join(" "), r.customer,
        r.unique, r.buzz, r.dates].join(" ").toLowerCase();
      if (hay.indexOf(st.q) < 0) return false;
    }
    return true;
  }
  function cmp(a, b, key) {
    var av = a[key], bv = b[key];
    if (key === "star") { av = STARS[a.id] ? 1 : 0; bv = STARS[b.id] ? 1 : 0; }
    if (key === "cats") { av = (av || []).join(", "); bv = (bv || []).join(", "); }
    if (key === "start") { av = String(av || "").replace(/[^0-9]/g, "") || ""; bv = String(bv || "").replace(/[^0-9]/g, "") || ""; }
    var ae = av === "" || av == null || av === "—";
    var be = bv === "" || bv == null || bv === "—";
    if (ae && be) return 0;
    if (ae) return 1;
    if (be) return -1;
    if (typeof av === "number" && typeof bv === "number") return av - bv;
    return String(av).localeCompare(String(bv), "en", { numeric: true });
  }
  function applySort(list) {
    list.sort(function (a, b) {
      var d = cmp(a, b, st.key) * st.dir;
      if (d !== 0) return d;
      if (st.secondary) {
        var e = cmp(a, b, st.secondary.key) * st.secondary.dir;
        if (e !== 0) return e;
      }
      return b.rating - a.rating;
    });
    return list;
  }

  /* ---------------------------------------------------------------- table */
  var COLS = [
    { k: "name", label: "Adventure", w: "206px" },
    { k: "county", label: "County", w: "104px" },
    { k: "cats", label: "Category", w: "118px" },
    { k: "cost_num", label: "Cost", w: "92px" },
    { k: "dur_h", label: "Duration", w: "86px" },
    { k: "party", label: "Party", w: "72px" },
    { k: "dates", label: "Season", w: "112px" },
    { k: "start", label: "Est.", w: "66px" },
    { k: "company", label: "Access", w: "138px" },
    { k: "customer", label: "Customer", w: "104px" },
    { k: "unique", label: "Why it's unique", w: "210px" },
    { k: "buzz", label: "Reviews", w: "196px" },
    { k: "rating", label: "Overall", w: "84px" }
  ];

  function ratingCell(v) {
    var cls = v >= 90 ? "hi" : "";
    return '<div class="rate"><b>' + v + '</b><span class="bar"><i class="' + cls +
      '" style="width:' + Math.max(8, v) + '%"></i></span></div>';
  }

  function td(label, inner, cls) {
    return '<td data-label="' + label + '"' + (cls ? ' class="' + cls + '"' : "") +
      '><div class="cv">' + inner + "</div></td>";
  }

  function rowHTML(r) {
    var starOn = STARS[r.id] ? " on" : "";
    var tags = (r.cats || []).slice(0, 2).map(function (c) {
      return '<span class="cat-tag">' + esc(c) + "</span>";
    }).join("") + ((r.cats || []).length > 2 ?
      '<span class="cat-tag more">+' + ((r.cats || []).length - 2) + "</span>" : "");

    var html = '<tr class="row" id="' + esc(r.id) + '" data-id="' + esc(r.id) + '">' +
      '<td class="cell-star" data-label=""><button class="star' + starOn + '" aria-label="Save to shortlist" ' +
      'data-star="' + esc(r.id) + '">&#9733;</button></td>' +
      td("Adventure", '<div class="name-row"><div><strong>' + esc(r.name) + "</strong>" +
        '<div class="city">' + esc(r.city) + "</div></div></div>", "cell-name") +
      td("County", esc(r.county)) +
      td("Category", tags) +
      td("Cost", esc(r.cost), "cost" + (r.cost_num === 0 ? " free" : "")) +
      td("Duration", esc(r.dur)) +
      td("Party", esc(r.party)) +
      td("Season", esc(r.dates)) +
      td("Established", esc(r.start), "cell-est") +
      td("Company", '<span class="clamp2" title="' + esc(r.company) + '">' + esc(r.company) + "</span>", "hide-sm") +
      td("Customer", '<span class="clamp2" title="' + esc(r.customer) + '">' + esc(r.customer) + "</span>", "hide-sm") +
      td("Why it's unique", '<span class="clamp" title="' + esc(r.unique) + '">' + esc(r.unique) + "</span>", "uniq") +
      td("Reviews", '<span class="clamp" title="' + esc(r.buzz) + '">' + esc(r.buzz) + "</span>", "buzz") +
      td("Overall", ratingCell(r.rating), "cell-rate") +
      "</tr>";

    html += '<tr class="detail" data-detail="' + esc(r.id) + '"><td colspan="' + (COLS.length + 1) + '">' +
      '<div class="detail-inner">' +
      "<div><h4>Why it's on the list</h4><p>" + esc(r.unique) + "</p></div>" +
      "<div><h4>Word of mouth</h4><p>" + esc(r.buzz) + "</p></div>" +
      '<div><h4>The practical bit</h4><p class="detail-meta">' +
      "<span><b>Where</b> " + esc(r.city) + ", " + esc(r.county) + " County</span>" +
      "<span><b>Access</b> " + esc(r.company) + "</span>" +
      "<span><b>Cost</b> " + esc(r.cost) + " per person</span>" +
      "<span><b>Time</b> " + esc(r.dur) + "</span>" +
      "<span><b>Party</b> " + esc(r.party) + "</span>" +
      "<span><b>When</b> " + esc(r.dates) + "</span>" +
      "<span><b>Since</b> " + esc(r.start) + "</span>" +
      "<span><b>Usually</b> " + esc(r.customer) + "</span>" +
      "</p></div></div></td></tr>";
    return html;
  }

  var tb = $("#tb");

  function currentRows() {
    return applySort(rows.filter(match));
  }

  function render() {
    var list = currentRows();
    tb.innerHTML = list.map(rowHTML).join("") ||
      '<tr><td colspan="' + (COLS.length + 1) + '" class="empty"><b>Nothing matches those filters.</b>' +
      "Loosen the budget or the county, or clear the search.</td></tr>";
    $("#counter").textContent = "Showing " + list.length + " of " + rows.length + " adventures";
    var label = (COLS.filter(function (c) { return c.k === st.key; })[0] || { label: "Overall" }).label;
    $("#sortedBy").textContent = "Sorted by " + label + (st.dir === -1 ? ", high \u2192 low" : ", low \u2192 high");
    $$("#head th").forEach(function (th) {
      th.classList.toggle("sorted", th.dataset.k === st.key);
      var a = th.querySelector(".arw");
      if (a) a.textContent = th.dataset.k === st.key ? (st.dir === -1 ? "\u25BC" : "\u25B2") : "\u2195";
    });
  }

  /* sort UI */
  $$("#head th").forEach(function (th) {
    if (!th.querySelector(".arw")) th.insertAdjacentHTML("beforeend", '<span class="arw">\u2195</span>');
    th.addEventListener("click", function (e) {
      var k = th.dataset.k;
      if (k === "star") {
        st.key = "star"; st.dir = -1; st.secondary = null;
      } else if (e.shiftKey) {
        st.secondary = { key: k, dir: st.key === k ? -st.dir : -1 };
        st.key = k; st.dir = -1;
      } else if (st.key === k) {
        st.dir = -st.dir;
      } else {
        st.key = k; st.dir = k === "name" || k === "county" || k === "cats" || k === "company" ||
          k === "customer" || k === "party" || k === "dates" ? 1 : -1;
      }
      render();
    });
  });

  /* filters */
  $("#fCounty").addEventListener("change", function () { st.county = this.value; syncCountyChips(); render(); });
  $("#fDur").addEventListener("change", function () { st.dur = this.value; render(); });
  $("#fCost").addEventListener("change", function () { st.cost = this.value; render(); });
  $("#fParty").addEventListener("change", function () { st.party = this.value; render(); });
  $("#q").addEventListener("input", function () { st.q = this.value.trim().toLowerCase(); render(); });
  $("#fStar").addEventListener("click", function () {
    st.starOnly = !st.starOnly;
    this.classList.toggle("on", st.starOnly);
    render();
  });
  $("#btnReset").addEventListener("click", function () {
    st.q = ""; st.county = ""; st.cats = []; st.dur = ""; st.cost = ""; st.party = "";
    st.starOnly = false; st.key = "rating"; st.dir = -1; st.secondary = null;
    $("#q").value = ""; $("#fCounty").value = ""; $("#fDur").value = ""; $("#fCost").value = "";
    $("#fParty").value = ""; $("#fStar").classList.remove("on");
    $$(".chip").forEach(function (c) { c.classList.remove("on"); });
    syncCountyChips(); render();
  });

  function syncCountyChips() {
    $$(".county-chip").forEach(function (c) {
      c.classList.toggle("on", c.dataset.county === st.county);
    });
    $("#fCounty").value = st.county;
  }
  $$(".county-chip").forEach(function (c) {
    c.addEventListener("click", function () {
      st.county = st.county === c.dataset.county ? "" : c.dataset.county;
      syncCountyChips(); render();
    });
  });
  $$(".chip").forEach(function (c) {
    c.addEventListener("click", function () {
      var v = c.dataset.cat, i = st.cats.indexOf(v);
      if (i > -1) st.cats.splice(i, 1); else st.cats.push(v);
      c.classList.toggle("on", i === -1);
      render();
    });
  });

  /* row expansion + stars (delegated) */
  tb.addEventListener("click", function (e) {
    var star = e.target.closest("[data-star]");
    if (star) {
      e.stopPropagation();
      var id = star.dataset.star;
      if (STARS[id]) delete STARS[id]; else STARS[id] = true;
      saveStars();
      star.classList.toggle("on", !!STARS[id]);
      if (st.starOnly) render();
      return;
    }
    var tr = e.target.closest("tr.row");
    if (!tr) return;
    var det = tb.querySelector('tr.detail[data-detail="' + tr.dataset.id + '"]');
    if (!det) return;
    var isOpen = det.classList.contains("open");
    $$("tr.detail.open", tb).forEach(function (d) { d.classList.remove("open"); });
    $$("tr.row.open", tb).forEach(function (r) { r.classList.remove("open"); });
    if (!isOpen) {
      det.classList.add("open");
      tr.classList.add("open");
    }
  });

  /* CSV of the current view */
  $("#btnCsv").addEventListener("click", function () {
    var list = currentRows();
    var head = ["Adventure", "City", "County", "State", "Category", "Cost", "Duration",
      "Party Size", "Season / Dates", "Established", "Company / Access", "Typical Customer",
      "Uniqueness", "Reviews", "Overall Rating", "Shortlist"];
    var q = function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; };
    var lines = [head.map(q).join(",")];
    list.forEach(function (r) {
      lines.push([r.name, r.city, r.county, r.state, (r.cats || []).join(" / "), r.cost, r.dur,
        r.party, r.dates, r.start, r.company, r.customer, r.unique, r.buzz, r.rating,
        STARS[r.id] ? "yes" : ""].map(q).join(","));
    });
    var blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "waypoint-" + D.slug + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
  });

  render();

  /* deep link from the index / shortlist */
  if (location.hash) {
    var id = location.hash.slice(1);
    var row = tb.querySelector('tr.row[data-id="' + id.replace(/"/g, "") + '"]');
    if (row) {
      var det = tb.querySelector('tr.detail[data-detail="' + row.dataset.id + '"]');
      if (det) { det.classList.add("open"); row.classList.add("open"); }
      (det || row).scrollIntoView({ block: "center" });
      row.style.outline = "2px solid var(--accent)";
      setTimeout(function () { row.style.outline = ""; }, 2400);
    }
  }
})();
