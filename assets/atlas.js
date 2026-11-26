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
    q: "", county: "", cats: [], dur: "", cost: "", party: "", starOnly: false,
    state: "", drive: 0
  };
  var STARS = {};
  try { STARS = JSON.parse(localStorage.getItem("waypoint:stars") || "{}"); } catch (e) { STARS = {}; }
  function saveStars() { try { localStorage.setItem("waypoint:stars", JSON.stringify(STARS)); } catch (e) {} }

  /* header */
  if (D.mode === "region") {
    $("#stateSub").textContent = D.stats.count + " adventures within a four-hour drive of Fort Mill, across " +
      D.stats.states + " states — Charlotte in half an hour, the Blue Ridge in two and a half, the coast and the " +
      "New River Gorge at the edge of the radius. Drive times are traffic-free routing estimates.";
    $("#stateStats").innerHTML = [
      [D.stats.count, "Adventures"], [D.stats.states, "States"],
      [D.stats.within60, "Within an hour"], ["$" + num(D.stats.median), "Median cost"], [D.stats.top, "Top score"]
    ].map(function (p) {
      return "<div><b>" + p[0] + "</b><span>" + p[1] + "</span></div>";
    }).join("");
  } else {
    $("#stateSub").textContent = D.stats.count + " adventures across " + D.stats.counties +
      " counties, from free afternoons to week-long expeditions. Sorted by how much you'd enjoy them; " +
      "filter the list down to a county and a free Saturday.";
    $("#stateStats").innerHTML = [
      [D.stats.count, "Adventures"], [D.stats.counties, "Counties"],
      [D.stats.free, "Free"], ["$" + num(D.stats.median), "Median cost"], [D.stats.top, "Top score"]
    ].map(function (p) {
      return "<div><b>" + p[0] + "</b><span>" + p[1] + "</span></div>";
    }).join("");
  }

  /* county select + chips (state pages only) */
  if (D.mode !== "region") {
    var sel = $("#fCounty");
    D.counties.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });
    $("#countyChips").innerHTML = D.counties.map(function (c) {
      return '<button class="county-chip" data-county="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");
  }

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
    if (D.mode === "region") {
      if (st.state && r.state !== st.state) return false;
      if (st.drive && (r.drive_min == null || r.drive_min > st.drive)) return false;
    }
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
  var REGION = D.mode === "region";

  var COLS = REGION ? [
    { k: "name", label: "Adventure", w: "228px" },
    { k: "drive_min", label: "Drive", w: "78px" },
    { k: "county", label: "County", w: "110px" },
    { k: "cats", label: "Category", w: "100px" },
    { k: "cost_num", label: "Cost", w: "78px" },
    { k: "dur_h", label: "Duration", w: "70px" },
    { k: "party", label: "Party", w: "54px" },
    { k: "dates", label: "Season", w: "96px" },
    { k: "unique", label: "Why it's unique", w: "220px" },
    { k: "buzz", label: "Reviews", w: "200px" },
    { k: "rating", label: "Overall", w: "76px" }
  ] : [
    { k: "name", label: "Adventure", w: "180px" },
    { k: "county", label: "County", w: "90px" },
    { k: "cats", label: "Category", w: "100px" },
    { k: "cost_num", label: "Cost", w: "80px" },
    { k: "dur_h", label: "Duration", w: "72px" },
    { k: "party", label: "Party", w: "56px" },
    { k: "dates", label: "Season", w: "96px" },
    { k: "start", label: "Est.", w: "54px" },
    { k: "company", label: "Access", w: "112px" },
    { k: "customer", label: "Customer", w: "88px" },
    { k: "unique", label: "Why it's unique", w: "170px" },
    { k: "buzz", label: "Reviews", w: "158px" },
    { k: "rating", label: "Overall", w: "76px" }
  ];

  function ratingCell(v) {
    var cls = v >= 90 ? "hi" : "";
    return '<div class="rate"><b>' + v + '</b><span class="bar"><i class="' + cls +
      '" style="width:' + Math.max(8, v) + '%"></i></span></div>';
  }

  function fmtDrive(m) {
    if (m == null) return "\u2014";
    if (m < 60) return m + " min";
    var h = Math.floor(m / 60), r = m % 60;
    return h + "h" + (r ? " " + r + "m" : "");
  }

  function td(label, inner, cls, key) {
    return '<td data-label="' + label + '"' + (key ? ' data-k="' + key + '"' : "") +
      (cls ? ' class="' + cls + '"' : "") + '><div class="cv">' + inner + "</div></td>";
  }

  var CLS = {
    name: "cell-name", drive_min: "cell-drive", cost_num: null,
    start: "cell-est", company: "hide-sm", customer: "hide-sm",
    unique: "uniq", buzz: "buzz", rating: "cell-rate"
  };

  var CELL = {
    name: function (r) {
      return '<div class="name-row"><div><strong>' + esc(r.name) + "</strong>" +
        '<div class="city">' + esc(r.city) + (REGION && r.state_abbr ? ", " + esc(r.state_abbr) : "") +
        "</div></div></div>";
    },
    drive_min: function (r) { return esc(fmtDrive(r.drive_min)); },
    county: function (r) { return esc(r.county_full); },
    cats: function (r) {
      return (r.cats || []).slice(0, 2).map(function (c) {
        return '<span class="cat-tag">' + esc(c) + "</span>";
      }).join("") + ((r.cats || []).length > 2 ?
        '<span class="cat-tag more">+' + ((r.cats || []).length - 2) + "</span>" : "");
    },
    cost_num: function (r) { return esc(r.cost); },
    dur_h: function (r) { return esc(r.dur); },
    party: function (r) { return esc(r.party); },
    dates: function (r) { return esc(r.dates); },
    start: function (r) { return esc(r.start); },
    company: function (r) {
      return '<span class="clamp2" title="' + esc(r.company) + '">' + esc(r.company) + "</span>";
    },
    customer: function (r) {
      return '<span class="clamp2" title="' + esc(r.customer) + '">' + esc(r.customer) + "</span>";
    },
    unique: function (r) {
      return '<span class="clamp" title="' + esc(r.unique) + '">' + esc(r.unique) + "</span>";
    },
    buzz: function (r) {
      return '<span class="clamp" title="' + esc(r.buzz) + '">' + esc(r.buzz) + "</span>";
    },
    rating: function (r) { return ratingCell(r.rating); }
  };

  function rowHTML(r) {
    var starOn = STARS[r.id] ? " on" : "";
    var html = '<tr class="row" id="' + esc(r.id) + '" data-id="' + esc(r.id) + '">' +
      '<td class="cell-star" data-label=""><button class="star' + starOn + '" aria-label="Save to shortlist" ' +
      'data-star="' + esc(r.id) + '">&#9733;</button></td>' +
      COLS.map(function (c) {
        var cls = CLS[c.k];
        if (c.k === "cost_num" && r.cost_num === 0) cls = "cost free";
        else if (c.k === "cost_num") cls = "cost";
        return td(c.label, CELL[c.k](r), cls, c.k);
      }).join("") + "</tr>";

    html += '<tr class="detail" data-detail="' + esc(r.id) + '"><td colspan="' + (COLS.length + 1) + '">' +
      '<div class="detail-inner">' +
      "<div><h4>Why it's on the list</h4><p>" + esc(r.unique) + "</p></div>" +
      "<div><h4>Word of mouth</h4><p>" + esc(r.buzz) + "</p></div>" +
      '<div><h4>The practical bit</h4><p class="detail-meta">' +
      "<span><b>Where</b> " + esc(r.city) + ", " + esc(r.county_full) + "</span>" +
      (r.drive_min != null ? "<span><b>Drive</b> " + esc(fmtDrive(r.drive_min)) + " from Fort Mill</span>" : "") +
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
      "Loosen the drive time, the budget or the search.</td></tr>";
    $("#counter").textContent = "Showing " + list.length + " of " + rows.length + " adventures";
    var label = (COLS.filter(function (c) { return c.k === st.key; })[0] || { label: "Overall" }).label;
    $("#sortedBy").textContent = "Sorted by " + label + (st.dir === -1 ? ", high \u2192 low" : ", low \u2192 high");
    $$("#head th").forEach(function (th) {
      th.classList.toggle("sorted", th.dataset.k === st.key);
      var a = th.querySelector(".arw");
      if (a) a.textContent = th.dataset.k === st.key ? (st.dir === -1 ? "\u25BC" : "\u25B2") : "\u2195";
    });
  }

  function onSort(e) {
    var th = e.currentTarget, k = th.dataset.k;
    if (k === "star") {
      st.key = "star"; st.dir = -1; st.secondary = null;
    } else if (e.shiftKey) {
      st.secondary = { key: k, dir: st.key === k ? -st.dir : -1 };
      st.key = k; st.dir = -1;
    } else if (st.key === k) {
      st.dir = -st.dir;
    } else {
      st.key = k;
      st.dir = k === "name" || k === "county" || k === "cats" || k === "company" ||
        k === "customer" || k === "party" || k === "dates" ? 1 : -1;
    }
    render();
  }

  function buildHead() {
    $("#cols").innerHTML = '<col style="width:22px">' + COLS.map(function (c) {
      return '<col style="width:' + c.w + '">';
    }).join("");
    $("#head").innerHTML = '<tr><th data-k="star" title="Your shortlist">&#9733;</th>' +
      COLS.map(function (c) {
        return '<th data-k="' + c.k + '">' + esc(c.label) + '<span class="arw">\u2195</span></th>';
      }).join("") + "</tr>";
    $$("#head th").forEach(function (th) { th.addEventListener("click", onSort); });
  }
  buildHead();

  /* filters */
  if (REGION) {
    var stateSel = $("#fState");
    (D.states || []).forEach(function (s) {
      var o = document.createElement("option");
      o.value = s.name;
      o.textContent = s.name + " (" + s.count + ")";
      stateSel.appendChild(o);
    });
    stateSel.addEventListener("change", function () { st.state = this.value; render(); });
    $$(".drive-chip").forEach(function (c) {
      c.addEventListener("click", function () {
        var v = +c.dataset.drive;
        st.drive = st.drive === v ? 0 : v;
        $$(".drive-chip").forEach(function (x) {
          x.classList.toggle("on", st.drive !== 0 && +x.dataset.drive === st.drive);
        });
        render();
      });
    });
  } else {
    $("#fCounty").addEventListener("change", function () {
      st.county = this.value; syncCountyChips(); render();
    });
    $$(".county-chip").forEach(function (c) {
      c.addEventListener("click", function () {
        st.county = st.county === c.dataset.county ? "" : c.dataset.county;
        syncCountyChips(); render();
      });
    });
    syncCountyChips();
  }

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
    st.state = ""; st.drive = 0;
    st.starOnly = false; st.key = "rating"; st.dir = -1; st.secondary = null;
    $("#q").value = ""; $("#fDur").value = ""; $("#fCost").value = ""; $("#fParty").value = "";
    $("#fStar").classList.remove("on");
    $$(".chip[data-cat]").forEach(function (c) { c.classList.remove("on"); });
    if (REGION) {
      $("#fState").value = "";
      $$(".drive-chip").forEach(function (x) { x.classList.remove("on"); });
    } else {
      $("#fCounty").value = ""; syncCountyChips();
    }
    render();
  });

  function syncCountyChips() {
    if (REGION) return;
    $$(".county-chip").forEach(function (c) {
      c.classList.toggle("on", c.dataset.county === st.county);
    });
    $("#fCounty").value = st.county;
  }

  $$(".chip[data-cat]").forEach(function (c) {
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
    var head = ["Adventure", "City", "County", "State"].concat(
      REGION ? ["Drive from Fort Mill (min)"] : []).concat(
      ["Category", "Cost", "Duration", "Party Size", "Season / Dates", "Established",
        "Company / Access", "Typical Customer", "Uniqueness", "Reviews", "Overall Rating", "Shortlist"]);
    var q = function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; };
    var lines = [head.map(q).join(",")];
    list.forEach(function (r) {
      lines.push([r.name, r.city, r.county, r.state].concat(
        REGION ? [r.drive_min == null ? "" : r.drive_min] : []).concat(
        [(r.cats || []).join(" / "), r.cost, r.dur, r.party, r.dates, r.start, r.company,
          r.customer, r.unique, r.buzz, r.rating, STARS[r.id] ? "yes" : ""]).map(q).join(","));
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
