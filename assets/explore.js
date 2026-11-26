/* Waypoint: start from any county, filter by a drive time you set. */
(function () {
  "use strict";

  var D = window.EXPLORE || { entries: [], counties: [] };
  var entries = D.entries || [];
  var counties = D.counties || [];

  var $ = function (s) { return document.querySelector(s); };
  var stateSel = $("#fState"), countySel = $("#fCounty"), citySel = $("#fCity");
  var hoursIn = $("#fHours"), minsIn = $("#fMins");
  var catSel = $("#fCat"), costSel = $("#fCost");
  var tb = $("#tb"), counter = $("#counter"), readout = $("#readout");

  var byState = {};
  counties.forEach(function (c) {
    (byState[c.state] = byState[c.state] || []).push(c);
  });
  Object.keys(byState).forEach(function (s) {
    byState[s].sort(function (a, b) { return a.county.localeCompare(b.county); });
  });

  var sort = "drive";
  var STORE = "waypoint:origin";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function fmtDrive(m) {
    if (m < 60) return m + " min";
    var h = Math.floor(m / 60), r = m % 60;
    return r ? h + "h " + r + "m" : h + " hr";
  }

  function miles(a, b) {
    var R = 3958.8;
    var p1 = a.lat * Math.PI / 180, p2 = b.lat * Math.PI / 180;
    var dp = p2 - p1, dl = (b.lon - a.lon) * Math.PI / 180;
    var h = Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  // Calibrated against the routed Fort Mill and Clemson pages: minutes = 16 + 1.16 * miles.
  function estimate(a, b) {
    if (a.name === b.city && a.state === b.state) return 10;
    var m = miles(a, b);
    return Math.max(5, Math.round(16 + 1.16 * m));
  }

  function fillStates(selected) {
    var names = Object.keys(byState).sort();
    stateSel.innerHTML = names.map(function (n) {
      return '<option value="' + esc(n) + '">' + esc(n) + "</option>";
    }).join("");
    stateSel.value = selected && byState[selected] ? selected : names[0];
  }

  function fillCounties(selected) {
    var list = byState[stateSel.value] || [];
    countySel.innerHTML = list.map(function (c) {
      return '<option value="' + esc(c.county) + '">' + esc(c.county_full || c.county) + "</option>";
    }).join("");
    var pick = selected && list.some(function (c) { return c.county === selected; })
      ? selected : (list[0] && list[0].county);
    countySel.value = pick || "";
    fillCities();
  }

  function currentCounty() {
    return (byState[stateSel.value] || []).filter(function (c) {
      return c.county === countySel.value;
    })[0];
  }

  function fillCities(selected) {
    var c = currentCounty();
    var list = (c && c.cities) || [];
    citySel.innerHTML = list.map(function (x) {
      return '<option value="' + esc(x.name) + '">' + esc(x.name) +
        (x.n > 1 ? " (" + x.n + ")" : "") + "</option>";
    }).join("");
    var pick = selected && list.some(function (x) { return x.name === selected; })
      ? selected : (list[0] && list[0].name);
    citySel.value = pick || "";
  }

  function origin() {
    var c = currentCounty();
    if (!c) return null;
    var city = (c.cities || []).filter(function (x) { return x.name === citySel.value; })[0];
    if (!city || city.lat == null) return null;
    return { name: city.name, state: c.state, county: c.county, county_full: c.county_full, lat: city.lat, lon: city.lon };
  }

  function totalMinutes() {
    var h = Math.max(0, Math.min(12, parseInt(hoursIn.value, 10) || 0));
    var m = Math.max(0, Math.min(55, parseInt(minsIn.value, 10) || 0));
    return h * 60 + m;
  }

  function setMinutes(total) {
    hoursIn.value = Math.floor(total / 60);
    minsIn.value = total % 60;
    document.querySelectorAll("#quickRow button").forEach(function (b) {
      b.classList.toggle("on", +b.dataset.min === total);
    });
  }

  function render() {
    var o = origin();
    var limit = totalMinutes();
    var cat = catSel.value;
    var maxCost = costSel.value;

    if (!o) {
      tb.innerHTML = '<tr><td colspan="8" class="empty-row">Pick a county with a mapped city to start.</td></tr>';
      readout.innerHTML = "";
      counter.textContent = "";
      return;
    }

    var rows = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.lat == null || e.lon == null) continue;
      var mins = estimate(o, e);
      if (mins > limit) continue;
      if (cat && (e.cats || []).indexOf(cat) === -1) continue;
      if (maxCost !== "" && e.cost_num > +maxCost) continue;
      rows.push({ e: e, mins: mins });
    }

    rows.sort(function (a, b) {
      if (sort === "rating") return b.e.rating - a.e.rating || a.mins - b.mins;
      if (sort === "cost") return a.e.cost_num - b.e.cost_num || a.mins - b.mins;
      return a.mins - b.mins || b.e.rating - a.e.rating;
    });

    var shown = rows.slice(0, 400);
    tb.innerHTML = shown.map(function (r) {
      var e = r.e;
      return '<tr class="row">' +
        '<td class="cell-name"><a href="states/' + slug(e.state) + '.html#' + esc(e.id) + '"><strong>' + esc(e.name) + "</strong></a>" +
        '<span class="city">' + esc(e.city) + ", " + esc(e.st) + "</span></td>" +
        '<td data-label="Where">' + esc(e.county_full || e.county) + "</td>" +
        '<td data-label="Drive"><b>' + fmtDrive(r.mins) + "</b></td>" +
        '<td data-label="Cost">' + esc(e.cost) + "</td>" +
        '<td data-label="Duration">' + esc(e.dur) + "</td>" +
        '<td data-label="Category">' + esc((e.cats || []).join(" / ")) + "</td>" +
        '<td data-label="Party">' + esc(e.party || "NA") + "</td>" +
        '<td data-label="Rating"><b>' + e.rating + "</b></td>" +
        "</tr>";
    }).join("");

    if (!rows.length) {
      tb.innerHTML = '<tr><td colspan="8" class="empty-row">Nothing in the atlas within ' +
        fmtDrive(limit) + ". Widen the clock or clear a filter.</td></tr>";
    }

    var withinHour = rows.filter(function (r) { return r.mins <= 60; }).length;
    var free = rows.filter(function (r) { return r.e.cost_num === 0; }).length;
    var top = rows.reduce(function (m, r) { return Math.max(m, r.e.rating); }, 0);
    readout.innerHTML =
      '<span class="readout-num">' + rows.length + "</span>" +
      "<span class=\"readout-say\">adventures within <b>" + fmtDrive(limit) + "</b> of " +
      esc(o.name) + ", " + esc(o.county_full || o.county) + ", " + esc(o.state) + "." +
      '<span class="readout-sub">' + withinHour + " within an hour &middot; " + free +
      " free &middot; top rating " + top + " &middot; times estimated</span></span>";

    counter.textContent = "Showing " + shown.length + " of " + rows.length +
      (rows.length > shown.length ? " (closest 400)" : "");
  }

  function syncHash() {
    var o = origin();
    if (!o) return;
    var p = "s=" + encodeURIComponent(o.state) + "&c=" + encodeURIComponent(o.county) +
      "&ci=" + encodeURIComponent(o.name) + "&t=" + totalMinutes() + "&sort=" + sort;
    try { history.replaceState(null, "", "#" + p); } catch (err) { /* file:// is fine */ }
    try {
      localStorage.setItem(STORE, JSON.stringify({ state: o.state, county: o.county, city: o.name, mins: totalMinutes() }));
    } catch (err) { /* private mode */ }
  }

  function update() {
    render();
    syncHash();
  }

  function readHash() {
    var h = location.hash.replace(/^#/, "");
    if (!h) return null;
    var out = {};
    h.split("&").forEach(function (kv) {
      var p = kv.split("=");
      if (p[0]) out[p[0]] = decodeURIComponent(p[1] || "");
    });
    return out;
  }

  function init() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE) || "null"); } catch (err) { saved = null; }
    var h = readHash();
    if (h && h.t) setMinutes(Math.max(0, parseInt(h.t, 10) || 0));

    var startState = (h && h.s) || (saved && saved.state) || "South Carolina";
    fillStates(startState);
    fillCounties((h && h.c) || (saved && saved.county) || "York");
    fillCities((h && h.ci) || (saved && saved.city));
    if (h && h.sort) {
      sort = h.sort;
      document.querySelectorAll("#sortSeg button").forEach(function (b) {
        b.classList.toggle("on", b.dataset.sort === sort);
      });
    }

    var cats = {};
    entries.forEach(function (e) { (e.cats || []).forEach(function (c) { cats[c] = (cats[c] || 0) + 1; }); });
    catSel.innerHTML = '<option value="">All categories</option>' +
      Object.keys(cats).sort().map(function (c) {
        return '<option value="' + esc(c) + '">' + esc(c) + " (" + cats[c] + ")</option>";
      }).join("");

    stateSel.addEventListener("change", function () { fillCounties(); update(); });
    countySel.addEventListener("change", function () { fillCities(); update(); });
    citySel.addEventListener("change", update);
    hoursIn.addEventListener("input", update);
    minsIn.addEventListener("input", update);
    catSel.addEventListener("change", update);
    costSel.addEventListener("change", update);

    document.querySelectorAll("#quickRow button").forEach(function (b) {
      b.addEventListener("click", function () { setMinutes(+b.dataset.min); update(); });
    });
    document.querySelectorAll("#sortSeg button").forEach(function (b) {
      b.addEventListener("click", function () {
        sort = b.dataset.sort;
        document.querySelectorAll("#sortSeg button").forEach(function (x) { x.classList.toggle("on", x === b); });
        update();
      });
    });

    update();
  }

  init();
})();
