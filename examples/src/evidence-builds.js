/* Builds for the sample deck. Every number is from docs/evidence.md.
   Each render draws the complete picture for step k and animates only what k adds. */

/* Slide 2: one effect size and its interval against zero. */
Deck.build("neutral", 1, function (el, k, anim, ctx) {
  var W = 1680, H = 520, c = ctx.c;
  var svg = Deck.svg(el, W, H, "Pooled effect of slides on learning: g = 0.067, 95% interval from -0.10 to 0.24",
    "An effect-size axis from -0.4 to 0.8. Zero means no difference. The pooled estimate from 48 studies is 0.067 and its 95 percent interval, -0.10 to 0.24, includes zero.");
  var x = d3.scaleLinear().domain([-0.4, 0.8]).range([80, W - 80]), y = 300;
  svg.append("line").attr("x1", x(-0.4)).attr("x2", x(0.8)).attr("y1", y).attr("y2", y).attr("stroke", c.ink).attr("stroke-width", 2);
  [-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8].forEach(function (t) {
    svg.append("line").attr("x1", x(t)).attr("x2", x(t)).attr("y1", y).attr("y2", y + 14).attr("stroke", c.ink).attr("stroke-width", 2);
    Deck.text(svg, x(t), y + 60, t === 0 ? "0" : t.toFixed(1), { size: 32, anchor: "middle", family: ctx.f.mono, fill: c.soft });
  });
  svg.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 110).attr("y2", y).attr("stroke", c.soft).attr("stroke-width", 2).attr("stroke-dasharray", "4 8");
  Deck.text(svg, x(0) - 24, 136, "no difference", { size: 32, anchor: "end", fill: c.soft });
  Deck.text(svg, x(0.8), y + 120, "slides better →", { size: 32, anchor: "end", fill: c.soft });
  Deck.text(svg, x(-0.4), y + 120, "← slides worse", { size: 32, fill: c.soft });
  Deck.text(svg, x(-0.4), y + 172, "effect size (Hedges' g)", { size: 32, fill: c.soft });
  if (k < 1) return;
  var g = svg.append("g");
  var ci = g.append("line").attr("x1", x(-0.10)).attr("x2", x(0.24)).attr("y1", y - 60).attr("y2", y - 60).attr("stroke", c.deco).attr("stroke-width", 10);
  var dot = g.append("circle").attr("cx", x(0.067)).attr("cy", y - 60).attr("r", 20).attr("fill", c.deco).attr("stroke", c.ground).attr("stroke-width", 4);
  var l1 = Deck.text(g, x(0.24) + 36, y - 76, "g = 0.067", { size: 56, weight: 700, family: ctx.f.mono, fill: c.accent });
  var l2 = Deck.text(g, x(0.24) + 36, y - 24, "95% interval −0.10 to 0.24: it includes zero", { size: 32, fill: c.accent });
  if (Deck.isNew(anim, k, 1)) {
    ci.attr("x1", x(0.067)).attr("x2", x(0.067)).transition().duration(700).ease(d3.easeCubicOut).attr("x1", x(-0.10)).attr("x2", x(0.24));
    Deck.fadeIn(dot, 0, 300); Deck.fadeIn(l1, 600, 400); Deck.fadeIn(l2, 800, 400);
  }
});

/* Slide 3: how common each flaw was. Bars from zero, labelled where they are. */
Deck.build("flaws", 2, function (el, k, anim, ctx) {
  var W = 1680, H = 520, c = ctx.c;
  var rows = [["More than four bullets in a list", 91], ["Bullets longer than two lines", 91],
              ["All-caps, all-italic or all-bold text", 81], ["Changes in look that mean nothing", 72], ["Text under 20 points", 66]];
  var svg = Deck.svg(el, W, H, "Share of 140 decks with each flaw",
    rows.map(function (r) { return r[0] + ": " + r[1] + " percent"; }).join(". ") + ".");
  var x0 = 760, x = d3.scaleLinear().domain([0, 100]).range([0, 700]);
  rows.forEach(function (r, i) {
    var y = 8 + i * 84, g = svg.append("g");
    Deck.text(g, x0 - 28, y + 44, r[0], { size: 36, anchor: "end", fill: c.ink });
    g.append("rect").attr("x", x0).attr("y", y).attr("width", x(100)).attr("height", 60).attr("fill", c.surface);
    if (k < 1) return;
    var bar = g.append("rect").attr("x", x0).attr("y", y).attr("height", 60).attr("width", x(r[1])).attr("fill", c.ink);
    var num = Deck.text(g, x0 + x(r[1]) + 18, y + 44, r[1] + "%", { size: 36, family: ctx.f.mono, fill: c.ink });
    if (Deck.isNew(anim, k, 1)) {
      bar.attr("width", 0).transition().delay(i * 160).duration(600).ease(d3.easeCubicOut).attr("width", x(r[1]));
      Deck.fadeIn(num, 600 + i * 160, 300);
    }
  });
  if (k >= 2) {
    var note = Deck.text(svg, x0, 480, "One flawed slide flags the whole deck, so these shares run high.", { size: 32, fill: c.accent });
    if (Deck.isNew(anim, k, 2)) Deck.fadeIn(note, 100, 400);
  }
});

/* Slide 6: 22 tests, all the same way. */
Deck.build("contiguity", 1, function (el, k, anim, ctx) {
  var W = 1680, H = 520, c = ctx.c, s = 76, gap = 20;
  var svg = Deck.svg(el, W, H, "22 of 22 tests favoured words placed beside their graphics; median effect size 1.10",
    "A grid of 22 squares, one per controlled test. All 22 favoured placing words next to the graphics they describe. The median effect size was d = 1.10.");
  for (var i = 0; i < 22; i++) {
    var col = i % 11, row = Math.floor(i / 11), X = col * (s + gap), Y = 60 + row * (s + gap);
    svg.append("rect").attr("x", X + 1).attr("y", Y + 1).attr("width", s - 2).attr("height", s - 2).attr("fill", c.surface).attr("stroke", c.hair).attr("stroke-width", 2);
    if (k >= 1) {
      var f = svg.append("rect").attr("x", X).attr("y", Y).attr("width", s).attr("height", s).attr("fill", c.ink);
      if (Deck.isNew(anim, k, 1)) Deck.fadeIn(f, i * 45, 200);
    }
  }
  Deck.text(svg, 0, 32, "one square is one controlled test", { size: 32, fill: c.soft });
  if (k < 1) return;
  var a = Deck.text(svg, 0, 340, "22 of 22", { size: 96, weight: 700, family: ctx.f.mono, fill: c.accent });
  var b = Deck.text(svg, 0, 400, "favoured words placed beside the graphic", { size: 36, fill: c.ink });
  var d = Deck.text(svg, 0, 480, "median effect size d = 1.10", { size: 36, family: ctx.f.mono, fill: c.ink });
  if (Deck.isNew(anim, k, 1)) { Deck.fadeIn(a, 22 * 45 + 100, 400); Deck.fadeIn(b, 22 * 45 + 300, 400); Deck.fadeIn(d, 22 * 45 + 500, 400); }
});

/* Slide 7: the same principle in two tallies. */
Deck.build("redundancy", 2, function (el, k, anim, ctx) {
  var W = 1680, H = 520, c = ctx.c;
  var rows = [["2017 review", 0.87, "median d = 0.87"], ["2021 tally", 0.10, "median d = 0.10, with 8 of 12 tests positive"]];
  var svg = Deck.svg(el, W, H, "Redundancy principle: median effect 0.87 in the 2017 review and 0.10 in the 2021 tally",
    "Two bars from zero on the same effect-size scale. The 2017 review reported a median d of 0.87. The 2021 tally reported a median d of about 0.10, with 8 of 12 tests positive.");
  var x0 = 330, x = d3.scaleLinear().domain([0, 1]).range([0, 1000]);
  svg.append("line").attr("x1", x0).attr("x2", x0).attr("y1", 40).attr("y2", 400).attr("stroke", c.ink).attr("stroke-width", 2);
  Deck.text(svg, x0, 456, "0", { size: 32, anchor: "middle", family: ctx.f.mono, fill: c.soft });
  Deck.text(svg, x0 + 40, 456, "median effect size (d) of removing redundant on-screen text", { size: 32, fill: c.soft });
  rows.forEach(function (r, i) {
    var n = i + 1, y = 70 + i * 170, hot = i === 1, g = svg.append("g");
    Deck.text(g, x0 - 28, y + 58, r[0], { size: 40, anchor: "end", weight: hot ? 700 : 400, fill: c.ink });
    if (k < n) return;
    var bar = g.append("rect").attr("x", x0).attr("y", y).attr("height", 92).attr("width", x(r[1])).attr("fill", hot ? c.deco : c.ink);
    var lab = Deck.text(g, x0 + x(r[1]) + 24, y + 58, r[2], { size: 36, weight: hot ? 700 : 400, fill: hot ? c.accent : c.ink });
    if (Deck.isNew(anim, k, n)) {
      bar.attr("width", 0).transition().duration(650).ease(d3.easeCubicOut).attr("width", x(r[1]));
      Deck.fadeIn(lab, 600, 400);
    }
  });
});
