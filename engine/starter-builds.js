/* Builds for this deck. One Deck.build per exhibit named in a data-build attribute.
   render(el, k, anim, ctx) draws the COMPLETE picture for step k from scratch.
   Draw in a fixed viewBox, take every colour from ctx, and animate only what step k adds. */
Deck.build("starter-bars", 2, function (el, k, anim, ctx) {
  var rows = [["Group A", 0.62], ["Group B", 0.41], ["Group C", 0.18]];
  var svg = Deck.svg(el, 1680, 600, "Three bars: 62, 41 and 18 percent",
    "Group A 62 percent, group B 41 percent, group C 18 percent. Group C is the one the claim is about.");
  var x = d3.scaleLinear().domain([0, 1]).range([0, 1240]);
  rows.forEach(function (r, i) {
    var y = 60 + i * 170, hot = i === 2 && k >= 2, g = svg.append("g");
    Deck.text(g, 0, y + 58, r[0], { size: 40, weight: hot ? 700 : 400, fill: ctx.c.ink });
    g.append("rect").attr("x", 320).attr("y", y).attr("width", 1240).attr("height", 88).attr("fill", ctx.c.surface);
    if (k < 1) return;
    var bar = g.append("rect").attr("x", 320).attr("y", y).attr("height", 88).attr("width", x(r[1]))
      .attr("fill", hot ? ctx.c.deco : ctx.c.ink);
    var num = Deck.text(g, 340 + x(r[1]), y + 58, Math.round(r[1] * 100) + "%",
      { size: 40, weight: hot ? 700 : 400, family: ctx.f.mono, fill: hot ? ctx.c.accent : ctx.c.ink });
    if (Deck.isNew(anim, k, 1)) {
      bar.attr("width", 0).transition().delay(i * 180).duration(650).ease(d3.easeCubicOut).attr("width", x(r[1]));
      Deck.fadeIn(num, 650 + i * 180, 300);
    }
    if (hot) {
      var note = Deck.text(g, 480 + x(r[1]), y + 58, "the one the claim is about", { size: 32, fill: ctx.c.accent });
      if (Deck.isNew(anim, k, 2)) Deck.fadeIn(note, 150, 400);
    }
  });
});
