/* brutalist-slides engine 0.1.0
   One controller for every deck: scaling, navigation, steps, speaker notes, overview,
   print, a ghost-deck view (?ghost) and a rendered audit (?audit).
   A deck file holds only <section class="slide"> elements. This script builds the chrome.

   Builds (optional, for D3 or any drawn exhibit):
     Deck.build("name", steps, function render(el, k, anim, ctx) { ... });
   render draws the COMPLETE state for step k from scratch (k = 0 is the base state,
   k = steps is the final state, which thumbnails, print and the audit show).
   Animate only what step k adds: if (Deck.isNew(anim, k, n)) { ...transition... }.
   ctx.c holds the slide's colours (ground, surface, ink, soft, hair, accent, deco, tint),
   ctx.f its faces (head, body, label, mono), ctx.data the five series colours (the first is
   the one the claim is about), ctx.seq a five-step lightness ramp for ordered quantities,
   ctx.width and ctx.height the exhibit's box in stage pixels.
   Never hard-code a brand colour in a build: a restyled deck must redraw in the new style. */
(function () {
  "use strict";

  var W = 1920, H = 1080;
  var stage = document.getElementById("stage");
  var deck = document.getElementById("deck");
  if (!stage || !deck) return;
  var slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
  var total = slides.length;
  var BUILDS = {};
  var current = -1, step = 0, scale = 1, lastFocus = null;
  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var params = new URLSearchParams(location.search);
  var ui = {};

  /* ------------------------------------------------------------------ helpers */
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }
  function tokens(node) {
    var s = node.closest ? (node.closest(".slide") || node) : node, cs = getComputedStyle(s);
    function v(n) { return cs.getPropertyValue(n).trim(); }
    return {
      c: { ground: v("--ground"), surface: v("--surface"), ink: v("--ink"), soft: v("--soft"),
           hair: v("--hair"), accent: v("--accent"), deco: v("--deco"), tint: v("--tint") },
      f: { head: v("--bs-font-head"), body: v("--bs-font-body"), label: v("--bs-font-label"), mono: v("--bs-font-mono") },
      data: [1, 2, 3, 4, 5].map(function (i) { return v("--bs-data-" + i); }),
      seq: [1, 2, 3, 4, 5].map(function (i) { return v("--bs-seq-" + i); })
    };
  }
  function hasD3() { return typeof window.d3 !== "undefined"; }

  var Deck = window.Deck = {
    version: "0.1.0",
    build: function (name, steps, render) { BUILDS[name] = { steps: steps, render: render }; },
    isNew: function (anim, k, n) { return !!anim && k === n; },
    tokens: tokens,
    /* D3 helpers that the course decks proved out. All need d3 on the page. */
    svg: function (node, w, h, title, desc) {
      node.innerHTML = "";
      var svg = d3.select(node).append("svg").attr("viewBox", "0 0 " + w + " " + h)
        .attr("preserveAspectRatio", "xMidYMid meet").attr("role", "img").attr("aria-label", title);
      svg.append("title").text(title);
      if (desc) svg.append("desc").text(desc);
      return svg;
    },
    text: function (g, x, y, s, o) {
      o = o || {};
      var t = g.append("text").attr("x", x).attr("y", y).attr("font-size", o.size || 32)
        .attr("font-weight", o.weight || 400).attr("fill", o.fill || "currentColor");
      if (o.family) t.attr("font-family", o.family);
      if (o.anchor) t.attr("text-anchor", o.anchor);
      if (o.ls) t.attr("letter-spacing", o.ls);
      return t.text(s);
    },
    fadeIn: function (sel, delay, dur) {
      sel.attr("opacity", 0).transition().delay(delay || 0).duration(dur || 400).ease(d3.easeCubicOut).attr("opacity", 1);
      return sel;
    },
    drawIn: function (path, delay, dur) {
      var L = path.node().getTotalLength();
      if (!(L > 0)) return path;
      path.attr("stroke-dasharray", L + " " + L).attr("stroke-dashoffset", L)
        .transition().delay(delay || 0).duration(dur || 600).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0)
        .on("end", function () { d3.select(this).attr("stroke-dasharray", null).attr("stroke-dashoffset", null); });
      return path;
    },
    rng: function (seed) {
      var s = seed >>> 0;
      return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    }
  };

  /* ------------------------------------------------------------------ chrome */
  function icon(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; }
  function buildChrome() {
    stage.setAttribute("aria-roledescription", "slide deck");
    var c = el("nav", { id: "controls", "aria-label": "Slide controls" });
    c.innerHTML =
      '<button type="button" id="btn-prev" aria-label="Previous">' + icon('<path d="M15 5l-7 7 7 7"/>') + "</button>" +
      '<span id="counter" aria-hidden="true"></span><span id="pips" aria-hidden="true"></span>' +
      '<button type="button" id="btn-next" aria-label="Next">' + icon('<path d="M9 5l7 7-7 7"/>') + "</button>" +
      '<span class="sep" aria-hidden="true"></span>' +
      '<button type="button" id="btn-thumbs" aria-label="All slides (G)">' + icon('<rect x="4" y="5" width="7" height="5"/><rect x="13" y="5" width="7" height="5"/><rect x="4" y="14" width="7" height="5"/><rect x="13" y="14" width="7" height="5"/>') + "</button>" +
      '<button type="button" id="btn-notes" aria-label="Speaker notes (N)" aria-pressed="false">' + icon('<path d="M5 6h14M5 11h14M5 16h9"/>') + "</button>" +
      '<button type="button" id="btn-fs" aria-label="Fullscreen (F)">' + icon('<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>') + "</button>";
    stage.appendChild(c);
    var t = el("div", { id: "thumbs", role: "dialog", "aria-modal": "true", "aria-label": "All slides" });
    t.innerHTML = '<div class="bar"><h2>All slides</h2><button type="button" class="close" aria-label="Close">' +
      icon('<path d="M6 6l12 12M18 6L6 18"/>') + '</button></div><div class="grid"></div>';
    stage.appendChild(t);
    stage.appendChild(el("p", { id: "live", "class": "sr-only", "aria-live": "polite" }));
    var n = el("aside", { id: "notes", "aria-label": "Speaker notes" }, '<h2 id="notes-head">Speaker notes</h2><div id="notes-body"></div>');
    document.body.appendChild(n);
    ["counter", "pips", "live", "thumbs", "notes-head", "notes-body", "btn-prev", "btn-next", "btn-thumbs", "btn-notes", "btn-fs"]
      .forEach(function (id) { ui[id] = document.getElementById(id); });
    ui.grid = t.querySelector(".grid");
    ui.close = t.querySelector(".close");
    slides.forEach(function (s, i) {
      s.setAttribute("aria-roledescription", "slide");
      if (!s.getAttribute("aria-label")) s.setAttribute("aria-label", "Slide " + (i + 1) + ": " + titleOf(s));
    });
  }

  function fit() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    scale = Math.min(w / W, h / H);
    deck.style.transform = "translate(" + (w - W * scale) / 2 + "px," + (h - H * scale) / 2 + "px) scale(" + scale + ")";
  }

  /* ------------------------------------------------------------------ steps and builds */
  function headOf(s) { return s.querySelector(".claim, .title, .statement, .quote"); }
  function titleOf(s) { var h = headOf(s); return s.getAttribute("data-title") || (h ? h.textContent.trim() : ""); }
  function buildEls(s) { return Array.prototype.slice.call(s.querySelectorAll("[data-build]")); }
  function stepsOf(s) {
    var n = 0;
    s.querySelectorAll("[data-step]").forEach(function (e) { n = Math.max(n, parseInt(e.getAttribute("data-step"), 10) || 0); });
    buildEls(s).forEach(function (e) { var b = BUILDS[e.getAttribute("data-build")]; if (b) n = Math.max(n, b.steps); });
    return n;
  }
  function stopBuilds(s) { if (hasD3() && s) buildEls(s).forEach(function (e) { d3.select(e).selectAll("*").interrupt(); }); }
  function renderBuild(node, k, animate) {
    var b = BUILDS[node.getAttribute("data-build")];
    if (!b) { node.innerHTML = '<p class="label">No build is registered under "' + node.getAttribute("data-build") + '".</p>'; return; }
    if (hasD3()) d3.select(node).selectAll("*").interrupt();
    var t = tokens(node), r = node.getBoundingClientRect();
    try {
      b.render(node, Math.max(0, Math.min(b.steps, k)), !!animate && !reduceMQ.matches,
        { c: t.c, f: t.f, data: t.data, seq: t.seq, width: r.width / scale, height: r.height / scale });
    } catch (err) {
      node.innerHTML = '<p class="label">This exhibit could not be drawn: ' + String(err && err.message || err) + "</p>";
      if (window.console) console.error(err);
    }
  }
  function applyStep(s, k, animate) {
    s.querySelectorAll("[data-step]").forEach(function (e) {
      var on = (parseInt(e.getAttribute("data-step"), 10) || 0) <= k, was = e.classList.contains("is-on");
      e.classList.toggle("is-on", on);
      e.classList.toggle("is-new", on && !was && !!animate);
    });
    buildEls(s).forEach(function (e) { renderBuild(e, k, animate); });
  }

  /* ------------------------------------------------------------------ navigation */
  function go(i, atEnd, animate) {
    i = Math.max(0, Math.min(total - 1, i));
    var prev = slides[current];
    if (prev && i !== current) { stopBuilds(prev); prev.classList.remove("is-active"); }
    current = i;
    var s = slides[i];
    step = atEnd ? stepsOf(s) : 0;
    s.classList.add("is-active");
    applyStep(s, step, animate);
    updateUI(true);
  }
  function setStep(k, animate) { step = k; applyStep(slides[current], step, animate); updateUI(false); }
  function next() {
    if (step < stepsOf(slides[current])) setStep(step + 1, true);
    else if (current < total - 1) go(current + 1, false, true);
  }
  function prev() {
    if (step > 0) setStep(step - 1, false);
    else if (current > 0) go(current - 1, true, false);
  }
  function updateUI(newSlide) {
    var s = slides[current], n = stepsOf(s);
    ui.counter.textContent = (current + 1) + " / " + total;
    ui.pips.innerHTML = "";
    for (var j = 1; j <= n; j++) ui.pips.appendChild(el("span", { "class": "pip" + (j <= step ? " on" : "") }));
    ui["btn-prev"].disabled = current === 0 && step === 0;
    ui["btn-next"].disabled = current === total - 1 && step === n;
    ui.live.textContent = newSlide
      ? "Slide " + (current + 1) + " of " + total + ": " + titleOf(s) + (n ? ", step " + step + " of " + n : "")
      : "Step " + step + " of " + n;
    if (newSlide) {
      var notes = s.querySelector(".notes");
      ui["notes-head"].textContent = "Speaker notes, slide " + (current + 1);
      ui["notes-body"].innerHTML = notes ? notes.innerHTML : "<p>No notes for this slide.</p>";
    }
    try { history.replaceState(null, "", "#" + (current + 1) + (step ? "." + step : "")); } catch (e) {}
  }
  function fromHash() {
    var m = /^#(\d+)(?:\.(\d+))?$/.exec(location.hash);
    if (!m) return false;
    go(parseInt(m[1], 10) - 1, false, false);
    if (m[2]) setStep(Math.min(stepsOf(slides[current]), parseInt(m[2], 10)), false);
    return true;
  }

  /* ------------------------------------------------------------------ overview, notes, fullscreen */
  function openThumbs() {
    lastFocus = document.activeElement;
    ui.grid.innerHTML = "";
    slides.forEach(function (s, i) {
      var b = el("button", { type: "button", "class": "thumb" + (i === current ? " current" : ""), "aria-label": "Slide " + (i + 1) + ": " + titleOf(s) });
      var inner = el("div", { "class": "thumb-inner" });
      var clone = s.cloneNode(true);
      clone.classList.remove("is-active");
      clone.removeAttribute("aria-label");
      inner.appendChild(clone);
      b.appendChild(inner);
      b.appendChild(el("span", { "class": "thumb-num" }, String(i + 1)));
      b.addEventListener("click", function () { closeThumbs(); go(i, false, true); });
      ui.grid.appendChild(b);
      inner.style.transform = "scale(" + b.clientWidth / W + ")";
      var k = stepsOf(s);
      buildEls(clone).forEach(function (e) { renderBuild(e, k, false); });
    });
    ui.thumbs.classList.add("open");
    var cur = ui.grid.querySelector(".current");
    if (cur) cur.focus();
  }
  function closeThumbs() { ui.thumbs.classList.remove("open"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function toggleNotes() {
    var on = document.body.classList.toggle("notes-open");
    ui["btn-notes"].setAttribute("aria-pressed", on ? "true" : "false");
    fit();
  }
  function toggleFs() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  }

  function wire() {
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(stage);
    window.addEventListener("resize", fit);
    ui["btn-prev"].addEventListener("click", prev);
    ui["btn-next"].addEventListener("click", next);
    ui["btn-thumbs"].addEventListener("click", openThumbs);
    ui["btn-notes"].addEventListener("click", toggleNotes);
    ui["btn-fs"].addEventListener("click", toggleFs);
    ui.close.addEventListener("click", closeThumbs);
    deck.addEventListener("click", function (e) {
      if (e.target.closest("a, button, input, textarea, select, [data-noadvance]")) return;
      if (String(window.getSelection && window.getSelection()) !== "") return;
      next();
    });
    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.getElementById("bs-panel")) { if (e.key === "Escape") closePanel(); return; }
      if (ui.thumbs.classList.contains("open")) { if (e.key === "Escape" || e.key === "g" || e.key === "G") { e.preventDefault(); closeThumbs(); } return; }
      var k = e.key;
      if (k === "ArrowRight" || k === "PageDown" || k === " " || k === "Enter") { e.preventDefault(); next(); }
      else if (k === "ArrowLeft" || k === "PageUp" || k === "Backspace") { e.preventDefault(); prev(); }
      else if (k === "Home") { e.preventDefault(); go(0, false, true); }
      else if (k === "End") { e.preventDefault(); go(total - 1, false, true); }
      else if (k === "g" || k === "G") openThumbs();
      else if (k === "n" || k === "N") toggleNotes();
      else if (k === "f" || k === "F") toggleFs();
    });
    var x0 = null;
    stage.addEventListener("touchstart", function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
    }, { passive: true });
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("beforeprint", function () {
      slides.forEach(function (s) { var k = stepsOf(s); buildEls(s).forEach(function (e) { renderBuild(e, k, false); }); });
    });
    window.addEventListener("afterprint", function () { applyStep(slides[current], step, false); });
  }

  /* ------------------------------------------------------------------ ghost deck */
  /* The headlines alone, in order. Read them as the argument. */
  function ghost() {
    return slides.map(function (s, i) {
      var layout = s.getAttribute("data-layout") || "", h = headOf(s), text = h ? h.textContent.replace(/\s+/g, " ").trim() : "";
      var flags = [];
      if ((layout === "claim" || layout === "evidence")) {
        if (!s.querySelector(".claim")) flags.push("no headline");
        else {
          if (text.split(/\s+/).length < 5) flags.push("topic label, not a claim?");
          if (!/[.?!]$/.test(text)) flags.push("not a full sentence?");
        }
      }
      return { n: i + 1, layout: layout, headline: text, flags: flags };
    });
  }

  /* ------------------------------------------------------------------ audit */
  function parseColor(str) {
    if (!str) return null;
    var m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(str);
    if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : (/%$/.test(m[4]) ? parseFloat(m[4]) / 100 : +m[4]) };
    m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(str);
    if (m) return { r: m[1] * 255, g: m[2] * 255, b: m[3] * 255, a: m[4] == null ? 1 : +m[4] };
    return null;
  }
  function lum(c) {
    function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function over(fg, bg, alpha) {
    return { r: fg.r * alpha + bg.r * (1 - alpha), g: fg.g * alpha + bg.g * (1 - alpha), b: fg.b * alpha + bg.b * (1 - alpha), a: 1 };
  }
  function hex(c) { return "#" + [c.r, c.g, c.b].map(function (v) { return ("0" + Math.round(v).toString(16)).slice(-2); }).join("").toUpperCase(); }
  function isSvg(n) { return typeof SVGElement !== "undefined" && n instanceof SVGElement; }
  function effPx(node) {
    var fs = parseFloat(getComputedStyle(node).fontSize) || 0;
    if (isSvg(node) && node.getScreenCTM) {
      var m = node.getScreenCTM();
      if (m) return fs * Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) / scale;
    }
    return fs;
  }
  function opacityTo(node, stop) {
    var a = 1;
    for (var n = node; n && n !== stop.parentNode; n = n.parentElement) a *= parseFloat(getComputedStyle(n).opacity || 1);
    return a;
  }
  function bgBehind(node, slide) {
    var r = node.getBoundingClientRect();
    var stack = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    for (var i = 0; i < stack.length; i++) {
      var e = stack[i];
      if (e === node || node.contains(e) || !slide.contains(e)) continue;
      var cs = getComputedStyle(e);
      if (isSvg(e) && e.tagName.toLowerCase() !== "svg") {
        if (/^(rect|circle|ellipse|path|polygon)$/i.test(e.tagName)) {
          var f = parseColor(cs.fill);
          if (f && f.a * parseFloat(cs.fillOpacity || 1) * parseFloat(cs.opacity || 1) >= 0.6) return f;
        }
        continue;
      }
      if (cs.backgroundImage && cs.backgroundImage !== "none" && e !== slide && !e.classList.contains("logo")) return null;
      var b = parseColor(cs.backgroundColor);
      if (b && b.a >= 0.6) return b;
    }
    return parseColor(getComputedStyle(slide).backgroundColor);
  }
  function textEls(slide) {
    var out = [], seen = new Set(), w = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      var e = n.parentElement;
      if (!e || seen.has(e) || e.closest(".notes, title, desc, script, style")) continue;
      seen.add(e);
      var cs = getComputedStyle(e), r = e.getBoundingClientRect();
      if (cs.display === "none" || cs.visibility === "hidden" || !r.width || !r.height) continue;
      out.push(e);
    }
    return out;
  }
  function ownText(e) { return e.textContent.replace(/\s+/g, " ").trim(); }
  function clip(s, n) { n = n || 60; return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function norm(s) { return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim(); }

  function auditSlide(s, i, add) {
    var layout = s.getAttribute("data-layout") || "";
    var cs0 = getComputedStyle(document.documentElement);
    var floorBody = parseFloat(cs0.getPropertyValue("--bs-floor-body")) || 40;
    var floorLabel = parseFloat(cs0.getPropertyValue("--bs-floor-label")) || 32;
    var minC = parseFloat(cs0.getPropertyValue("--bs-min-contrast")) || 4.5;
    var sr = s.getBoundingClientRect(), tol = 1.5 * scale;
    var content = layout === "claim" || layout === "evidence";
    var notesEl = s.querySelector(".notes"), notes = notesEl ? norm(notesEl.textContent) : "";
    var accent = parseColor(tokens(s).c.accent ? (function () { var p = el("span"); p.style.color = tokens(s).c.accent; s.appendChild(p); var c = getComputedStyle(p).color; s.removeChild(p); return c; })() : "");
    var words = 0, accentChars = 0, chars = 0, boxes = [];

    /* Part 2: headline is a claim */
    var claim = s.querySelector(".claim");
    if (content && !claim) add("FAIL", "headline", "Content slide has no .claim headline. State the slide's point as a full sentence.");
    if (claim) {
      var ccs = getComputedStyle(claim), lh = parseFloat(ccs.lineHeight) || parseFloat(ccs.fontSize) * 1.2;
      var lines = Math.round(claim.offsetHeight / lh), ct = ownText(claim);
      if (lines > 2) add("FAIL", "headline", "Headline runs " + lines + " lines; the limit is two. \"" + clip(ct) + "\"");
      if (ct.split(/\s+/).length < 5) add("WARN", "headline", "Headline is under five words: a topic label, not a claim? \"" + ct + "\"");
      else if (!/[.?!]$/.test(ct)) add("WARN", "headline", "Headline does not end as a sentence. \"" + clip(ct) + "\"");
    }

    /* Parts 7, 8: every piece of visible text */
    textEls(s).forEach(function (e) {
      var t = ownText(e), cs = getComputedStyle(e), r = e.getBoundingClientRect();
      var svg = isSvg(e), px = effPx(e);
      /* the tight boxes of the text itself, line by line: a block's own box can sit inside the
         slide while its text runs out of it */
      try {
        var rg = document.createRange(); rg.selectNodeContents(e);
        var lines = Array.prototype.filter.call(rg.getClientRects(), function (q) { return q.width > 0 && q.height > 0; }).slice(0, 12);
        if (lines.length) {
          boxes.push({ e: e, t: t, rects: lines });
          r = { left: Math.min.apply(null, lines.map(function (q) { return q.left; })), right: Math.max.apply(null, lines.map(function (q) { return q.right; })),
                top: Math.min.apply(null, lines.map(function (q) { return q.top; })), bottom: Math.max.apply(null, lines.map(function (q) { return q.bottom; })) };
        }
      } catch (err) {}
      var body = !svg && e.closest("p, li, td, blockquote") && !e.closest(".label, .source, .status, .eyebrow, figcaption, th, pre");
      var floor = body ? floorBody : floorLabel;
      if (!e.closest(".source, .status, .eyebrow")) words += t.split(/\s+/).length;
      chars += t.length;
      if (px + 0.25 < floor) add("FAIL", "type-size", "\"" + clip(t, 44) + "\" is " + (Math.round(px * 10) / 10) + " px; the floor for " + (body ? "body text" : "labels") + " is " + floor + " px.");
      if (r.left < sr.left - tol || r.right > sr.right + tol || r.top < sr.top - tol || r.bottom > sr.bottom + tol)
        add("FAIL", "overflow", "\"" + clip(t, 44) + "\" runs off the slide.");
      else {
        for (var p = e.parentElement; p && p !== s; p = p.parentElement) {
          if (isSvg(p)) continue;
          var o = getComputedStyle(p).overflow;
          if (o === "visible") continue;
          var pr = p.getBoundingClientRect();
          if (r.bottom > pr.bottom + tol || r.right > pr.right + tol || r.top < pr.top - tol || r.left < pr.left - tol) { add("FAIL", "overflow", "\"" + clip(t, 44) + "\" is cut off by its container."); break; }
        }
      }
      var fg = parseColor(svg ? cs.fill : cs.color), bg = bgBehind(e, s);
      if (fg && bg) {
        var a = fg.a * opacityTo(e, s), seen = a < 0.999 ? over(fg, bg, a) : fg, cr = ratio(seen, bg);
        if (cr + 0.005 < minC) add("FAIL", "contrast", "\"" + clip(t, 44) + "\" is " + hex(seen) + " on " + hex(bg) + ": " + cr.toFixed(2) + ":1; the floor is " + minC + ":1.");
        if (accent && Math.abs(fg.r - accent.r) + Math.abs(fg.g - accent.g) + Math.abs(fg.b - accent.b) < 6) accentChars += t.length;
      } else if (fg && !bg) add("WARN", "contrast", "\"" + clip(t, 44) + "\" sits on an image or gradient; contrast was not measured.");
      var letters = t.replace(/[^A-Za-z]/g, "");
      if (t.length > 40 && (cs.textTransform === "uppercase" || (letters.length > 30 && letters === letters.toUpperCase())))
        add("FAIL", "all-caps", "All-caps running text: \"" + clip(t, 44) + "\"");
      if (t.length > 90 && cs.fontStyle === "italic") add("WARN", "all-italic", "A long run of italic text: \"" + clip(t, 44) + "\"");
      /* Part 4: on screen and in the speaker's mouth */
      var nt = norm(t);
      if (notes && nt.split(" ").length >= 8 && notes.indexOf(nt) !== -1)
        add("WARN", "redundancy", "This sentence is on the slide and word for word in the notes. Say it or show it, not both: \"" + clip(t, 50) + "\"");
    });

    /* text drawn on top of other text */
    for (var a1 = 0; a1 < boxes.length; a1++) for (var b1 = a1 + 1; b1 < boxes.length; b1++) {
      var A = boxes[a1], B = boxes[b1], hit = false;
      if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
      A.rects.forEach(function (ra) { B.rects.forEach(function (rb) {
        var w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (w > 6 * scale && h > 0.3 * Math.min(ra.height, rb.height)) hit = true;
      }); });
      if (hit) add("FAIL", "overlap", "\"" + clip(A.t, 30) + "\" and \"" + clip(B.t, 30) + "\" are drawn on top of each other.");
    }
    if (s.scrollHeight > H + 2) add("FAIL", "overflow", "Content is " + (s.scrollHeight - H) + " px taller than the slide.");
    s.querySelectorAll("ul, ol").forEach(function (list) {
      if (list.closest(".notes")) return;
      var items = Array.prototype.filter.call(list.children, function (c) { return c.tagName === "LI"; });
      if (items.length > 4) add("WARN", "working-memory", "A list of " + items.length + " items. Past four, group them or split the slide.");
      if (items.length && items.length <= 4 && items.every(function (li) { return li.hasAttribute("data-step"); }))
        add("WARN", "steps", "A short list is revealed one item at a time. Show short lists whole; build diagrams and processes.");
      items.forEach(function (li) {
        var lcs = getComputedStyle(li), llh = parseFloat(lcs.lineHeight) || parseFloat(lcs.fontSize) * 1.3;
        if (Math.round(li.offsetHeight / llh) > 2) add("WARN", "working-memory", "A list item runs past two lines: \"" + clip(ownText(li), 44) + "\"");
      });
    });
    if (layout !== "evidence" && words > 60) add("WARN", "density", words + " words on screen. Is this slide a document? Move detail to the handout or the notes.");
    if (content && chars && accentChars / chars > 0.4) add("WARN", "salience", "Over 40% of the text is in the accent colour. The accent means look here; it cannot mean that everywhere.");
    if (content && s.querySelector(".logo")) add("WARN", "coherence", "A logo on a content slide. Keep logos to the title and closing slides.");
    if (s.querySelector(".legend")) add("WARN", "labeling", "A legend. Label the lines, bars or regions directly and delete it.");
    if (layout !== "section" && !notes) add("WARN", "notes", "No speaker notes. The explanation belongs in the notes, in your voice.");
    if (layout === "evidence" && notes && !/pause|stop|walk/.test(notes)) add("WARN", "notes", "A dense evidence slide: the notes should say to stop talking and walk the room through it.");
    s.querySelectorAll("img").forEach(function (im) { if (!im.getAttribute("alt") && !im.hasAttribute("alt")) add("WARN", "alt-text", "An image has no alt attribute."); });
    s.querySelectorAll("svg").forEach(function (v) { if (!v.closest(".logo") && !v.getAttribute("aria-label") && !v.querySelector("title") && v.getAttribute("aria-hidden") !== "true") add("WARN", "alt-text", "An SVG exhibit has no title or aria-label."); });
  }

  function audit() {
    var keep = { i: current, k: step }, findings = [];
    slides.forEach(function (s, i) {
      go(i, true, false);
      auditSlide(s, i, function (level, rule, msg) { findings.push({ slide: i + 1, layout: s.getAttribute("data-layout") || "", level: level, rule: rule, msg: msg }); });
    });
    function deckAdd(level, rule, msg) { findings.push({ slide: 0, layout: "deck", level: level, rule: rule, msg: msg }); }
    if (total && slides[0].getAttribute("data-layout") !== "title") deckAdd("WARN", "structure", "The first slide is not a title slide.");
    if (total && slides[total - 1].getAttribute("data-layout") !== "closing") deckAdd("WARN", "structure", "The deck has no closing slide. End the talk on purpose.");
    var seenHead = {};
    ghost().forEach(function (g) {
      if (!g.headline || (g.layout !== "claim" && g.layout !== "evidence")) return;
      var k = norm(g.headline);
      if (seenHead[k]) deckAdd("WARN", "structure", "Slides " + seenHead[k] + " and " + g.n + " have the same headline.");
      else seenHead[k] = g.n;
    });
    go(keep.i < 0 ? 0 : keep.i, false, false);
    if (keep.k) setStep(keep.k, false);
    var fails = findings.filter(function (f) { return f.level === "FAIL"; }).length;
    var res = {
      engine: Deck.version, title: document.title, style: document.documentElement.getAttribute("data-style") || "",
      slides: total, fail: fails, warn: findings.length - fails, findings: findings, ghost: ghost(),
      note: "Not measured here: whether the evidence supports each claim, whether meaning rests on hue alone, whether terms stay the same across slides, and whether each animation teaches something a still frame would not. Those need a reader."
    };
    window.bsAudit = res;
    return res;
  }

  function auditText(res) {
    var out = ["brutalist-slides audit", res.title + "  ·  style: " + (res.style || "none") + "  ·  " + res.slides + " slides",
      "FAIL " + res.fail + "   WARN " + res.warn, ""];
    res.findings.forEach(function (f) {
      out.push((f.slide ? ("slide " + f.slide + " ").slice(0, 9) : "deck     ") + " " + f.level + "  " + (f.rule + "               ").slice(0, 15) + " " + f.msg);
    });
    if (!res.findings.length) out.push("Nothing measurable is wrong.");
    out.push("", res.note);
    return out.join("\n");
  }
  function ghostText() {
    return ghost().map(function (g) {
      return (("  " + g.n).slice(-3)) + "  " + ((g.layout || "-") + "          ").slice(0, 10) + (g.headline || "(no headline)") + (g.flags.length ? "   <-- " + g.flags.join("; ") : "");
    }).join("\n");
  }
  function showPanel(title, text) {
    closePanel();
    var p = el("div", { id: "bs-panel", role: "dialog", "aria-label": title });
    p.appendChild(el("h2", {}, title + "  (Esc to close)"));
    p.appendChild(document.createTextNode(text));
    stage.appendChild(p);
  }
  function closePanel() { var p = document.getElementById("bs-panel"); if (p) p.parentNode.removeChild(p); }

  Deck.go = function (n, k) { go(n - 1, false, false); if (k) setStep(Math.min(stepsOf(slides[current]), k), false); };
  Deck.next = next; Deck.prev = prev; Deck.ghost = ghost; Deck.audit = audit;
  Deck.auditText = function () { return auditText(audit()); };
  Deck.count = function () { return total; };
  /* every slide drawn in its final state, for print and PDF */
  Deck.printReady = function () {
    slides.forEach(function (s) { var k = stepsOf(s); s.querySelectorAll("[data-step]").forEach(function (e) { e.classList.add("is-on"); e.classList.remove("is-new"); }); buildEls(s).forEach(function (e) { renderBuild(e, k, false); }); });
  };
  Deck.steps = function (n) { return stepsOf(slides[n - 1]); };

  /* ------------------------------------------------------------------ start */
  function start() {
    buildChrome();
    wire();
    fit();
    if (!fromHash()) go(0, false, true);
    var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    Deck.ready = fontsReady.then(function () {
      fit();
      applyStep(slides[current], step, false);
      if (params.has("ghost")) showPanel("Ghost deck: the headlines alone", ghostText());
      if (params.has("audit")) { var res = audit(); showPanel("Audit", auditText(res)); }
      document.documentElement.setAttribute("data-bs-ready", "1");
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
