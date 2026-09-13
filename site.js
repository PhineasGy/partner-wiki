(function () {
  "use strict";

  var TYPES = ["一般","格鬥","飛行","毒","地面","岩石","蟲","幽靈","鋼","火","水","草","電","超能力","冰","龍","惡","妖精"];
  var CHART = [
    "11111h10h111111111",
    "21hh12h021111h212h",
    "12111h21h112h11111",
    "111hhh1h0112111112",
    "110212h1221h211111",
    "1h21h121h211112111",
    "1hhh111hhh1212112h",
    "0111111211111211h1",
    "11111211hhh1h12112",
    "11111h212hh2112h11",
    "1111221112hh111h11",
    "11hh22h1hh2h111h11",
    "11210111112hh11h11",
    "12121111h1111h1101",
    "11212111hhh211h211",
    "11111111h111111210",
    "1h11111211111211hh",
    "121h1111hh11111221"
  ];

  function idx(t) {
    var i;
    for (i = 0; i < TYPES.length; i++) {
      if (TYPES[i] === t) { return i; }
    }
    return -1;
  }

  function typeMult(atk, def) {
    var ai = idx(atk);
    var di = idx(def);
    if (ai < 0 || di < 0) { return 1; }
    var c = CHART[ai].charAt(di);
    if (c === "2") { return 2; }
    if (c === "h" || c === "0") { return 0.5; }
    return 1;
  }

  function hit(atk, defs) {
    var d = 1;
    var i;
    for (i = 0; i < defs.length; i++) {
      d = d * typeMult(atk, defs[i]);
    }
    return d;
  }

  function fmt(n) {
    if (n === 2) { return "2"; }
    if (n === 1) { return "1"; }
    if (n === 0.5) { return "0.5"; }
    if (n === 0.25) { return "0.25"; }
    if (n === 4) { return "4"; }
    return String(n);
  }

  function selected(box) {
    var out = [];
    var boxes = box.querySelectorAll("input[type=checkbox]");
    var i;
    for (i = 0; i < boxes.length; i++) {
      if (boxes[i].checked) { out.push(boxes[i].value); }
    }
    return out;
  }

  function limitPicks(box) {
    var boxes = box.querySelectorAll("input[type=checkbox]");
    var i;
    function sync() {
      var n = selected(box).length;
      for (i = 0; i < boxes.length; i++) {
        boxes[i].parentNode.className = boxes[i].checked ? "on" : "";
        if (!boxes[i].checked && n >= 4) { boxes[i].disabled = true; }
        else { boxes[i].disabled = false; }
      }
      fillMoveSelect(box);
    }
    for (i = 0; i < boxes.length; i++) {
      boxes[i].addEventListener("change", sync);
    }
    sync();
  }

  function fillMoveSelect(box) {
    var sel = box.parentNode.querySelector("select.move");
    if (!sel) { return; }
    var picks = selected(box);
    var cur = sel.value;
    sel.innerHTML = "";
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "隨機（跟直播一樣）";
    sel.appendChild(opt0);
    var i;
    for (i = 0; i < picks.length; i++) {
      var o = document.createElement("option");
      o.value = picks[i];
      o.textContent = picks[i];
      sel.appendChild(o);
    }
    if (cur && picks.indexOf(cur) >= 0) { sel.value = cur; }
  }

  function pickMove(picks, forced) {
    if (forced && picks.indexOf(forced) >= 0) { return forced; }
    if (picks.length < 1) { return ""; }
    return picks[Math.floor(Math.random() * picks.length)];
  }

  function runCalc() {
    var aBox = document.getElementById("sideA");
    var bBox = document.getElementById("sideB");
    var out = document.getElementById("calcOut");
    if (!aBox || !bBox || !out) { return; }
    var a = selected(aBox);
    var b = selected(bBox);
    if (a.length < 1 || b.length < 1) {
      out.innerHTML = "兩邊都先選至少一個屬性（最多四個，跟身上上限一樣）。";
      return;
    }
    var aMove = pickMove(a, document.getElementById("moveA").value);
    var bMove = pickMove(b, document.getElementById("moveB").value);
    var aHit = hit(aMove, b);
    var bHit = hit(bMove, a);
    var text;
    if (aHit > bHit) { text = "左側獲勝"; }
    else if (bHit > aHit) { text = "右側獲勝"; }
    else { text = "平手"; }
    out.innerHTML =
      "<div class=\"big\">" + text + "</div>" +
      "<p>左側出「" + aMove + "」→ 打右側 " + fmt(aHit) + " 倍</p>" +
      "<p>右側出「" + bMove + "」→ 打左側 " + fmt(bHit) + " 倍</p>" +
      "<p>倍數高的贏。抗和免疫在本頻道都是 0.5，沒有 0。</p>";
  }

  function setupCalc() {
    var aBox = document.getElementById("sideA");
    var bBox = document.getElementById("sideB");
    if (!aBox || !bBox) { return; }
    limitPicks(aBox);
    limitPicks(bBox);
    var go = document.getElementById("calcGo");
    if (go) { go.addEventListener("click", runCalc); }
  }

  function setupDexFilter() {
    var q = document.getElementById("dexQ");
    var type = document.getElementById("dexType");
    var cards = document.querySelectorAll(".card-grid .mon");
    if (!q && !type) { return; }
    function apply() {
      var text = q ? q.value.trim() : "";
      var t = type ? type.value : "";
      var i;
      for (i = 0; i < cards.length; i++) {
        var name = cards[i].getAttribute("data-name") || "";
        var types = cards[i].getAttribute("data-types") || "";
        var ok = true;
        if (text && name.indexOf(text) < 0 && (cards[i].getAttribute("data-num") || "").indexOf(text) < 0) {
          ok = false;
        }
        if (t && types.indexOf(t) < 0) { ok = false; }
        cards[i].style.display = ok ? "" : "none";
      }
    }
    if (q) { q.addEventListener("input", apply); }
    if (type) { type.addEventListener("change", apply); }
  }

  function setupGym() {
    var open = document.getElementById("gymOpen");
    var close = document.getElementById("gymClose");
    var all = document.querySelectorAll("details.spoiler");
    if (open) {
      open.addEventListener("click", function () {
        var i;
        for (i = 0; i < all.length; i++) { all[i].open = true; }
      });
    }
    if (close) {
      close.addEventListener("click", function () {
        var i;
        for (i = 0; i < all.length; i++) { all[i].open = false; }
      });
    }
  }

  function setupChart() {
    var table = document.getElementById("typeChart");
    if (!table) { return; }
    var cells = table.querySelectorAll("th, td");
    var i;
    for (i = 0; i < cells.length; i++) {
      cells[i].addEventListener("mouseenter", function (ev) {
        var tr = ev.target.parentNode;
        var tds = table.querySelectorAll(".hi");
        var j;
        for (j = 0; j < tds.length; j++) { tds[j].classList.remove("hi"); }
        if (tr) { tr.querySelector("th").classList.add("hi"); }
        var cell = ev.target;
        var idxCol = -1;
        var kids = tr.children;
        var k;
        for (k = 0; k < kids.length; k++) {
          if (kids[k] === cell) { idxCol = k; }
        }
        if (idxCol >= 0) {
          var rows = table.querySelectorAll("tr");
          for (k = 0; k < rows.length; k++) {
            if (rows[k].children[idxCol]) { rows[k].children[idxCol].classList.add("hi"); }
          }
        }
      });
    }
  }

  setupCalc();
  setupDexFilter();
  setupGym();
  setupChart();
})();
