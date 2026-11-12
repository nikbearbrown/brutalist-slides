---
name: animate
description: Charts, diagrams, staged builds and animation for brutalist-slides decks. Use when a slide needs a chart, a diagram, a process shown in steps, or any motion. Covers choosing the chart form, direct labelling, drawing with style tokens in inline SVG or D3, and the rule that motion must teach something a still frame does not.
---

# Exhibits and motion

An exhibit is the evidence for the slide's claim. Motion is a pointer. This page is how to draw both so they survive a restyle, a print and the back row. Format details are in `../../docs/deck-format.md`.

## Plan what the viewer watches before writing any code

Name the structure the claim rests on: a relationship, a mechanism, a comparison, a sequence, a distribution. The exhibit makes that structure visible. Then decide whether it needs steps at all.

## Pick the form that matches the meaning (Part 10, Tier C)

| The claim is about | Draw |
|---|---|
| A trend, or anything along a continuous axis | A line. Crossing lines show an interaction better than grouped bars |
| A few discrete values compared | Bars, starting at zero |
| An ordered quantity across categories or cells | Lightness, from the `--bs-seq-*` ramp. Hue reads as category, not amount |
| Part of a whole, where precise values matter | Bars or a labelled number. Not areas, circles or pies: people underestimate area, more as it grows |
| A sequence or a process | A flow, left to right or top to bottom, built in stages |
| A mechanism | A diagram with the parts labelled where they are |
| Geography or a route | A map |
| A distribution | The distribution (dots, a histogram), not a bar of the mean |
| One number that matters | The number, large, with its unit and what it is compared to |

## Rules for every exhibit

- **Label directly** (Part 5). Put the name at the end of the line, in or beside the bar, on the region. Delete the legend. Put a callout beside the thing it is about.
- **One series is the claim; the rest is context** (Part 6). The claim's series takes `--deco` (fills, bars, marks) with its label in `--accent` (text). Everything else is ink or soft. In a build: `ctx.c.deco` for the mark, `ctx.c.accent` for the words, `ctx.data` for a full series set.
- **Never colour alone** (Part 8). The thing that matters is also bold, or labelled, or first, or marked. Check the slide in grey.
- **Text in an exhibit is 32 px or more as drawn.** Draw in a `viewBox` as wide as the box the exhibit gets (1680 for a full-width exhibit, about 900 to 1000 in a split) so a `font-size="32"` is really 32. The audit measures the drawn size and fails a shrunk exhibit.
- **Sparse axes.** A few ticks, units in the label, thin gridlines in `--hair`, numbers in the mono face. Say when an axis is logarithmic, and remember a log axis has no zero.
- **Real numbers or labelled ones.** Compute values in code from stated inputs, or take them from the source and cite it. Otherwise the slide's `.status` says Illustrative data.
- **Describe it.** Every SVG has an `aria-label` or `<title>` that states the final picture with its numbers.
- **Tokens only.** In inline SVG use the classes `f-ink`, `f-deco`, `s-hair` and so on. In a build use `ctx.c`. No hex values.

## Static first

Most exhibits need no motion. Write inline SVG in the `.evidence` box with the token classes. Add steps only when the next section says they earn their place.

## When to stage, and when not to (Part 6)

Stage an exhibit when it has more parts than a viewer can take in at once, or when it shows a process: show the system, then add the flow, then mark the failure point. That is segmenting (Tier A). Each press of Next is one idea the speaker says one thing about.

Do not stage a short list. Show lists of four or fewer whole. The evidence for revealing bullets one at a time is unsettled, and one study found slightly better memory when a list appeared at once.

For every step and every animation, complete this sentence in the speaker notes or do not animate: *"Watching this change, the viewer learns ___, which the final frame alone does not show."* Accumulation, divergence, a thing being blocked, a transformation, an order of events, a consequence: those are answers. "It looks nice" and "it keeps attention" are not.

## Two ways to step

**Reveal existing elements.** Put `data-step="1"`, `data-step="2"` on elements (HTML or SVG groups). Good for a diagram written as static SVG where parts appear in order.

**A build.** For anything computed or animated, register a render function:

```html
<div class="evidence" data-build="base-rate"></div>
```

```js
Deck.build("base-rate", 2, function (el, k, anim, ctx) {
  var svg = Deck.svg(el, 1680, 600, "1,000 people, 10 with the condition, 99 flagged",
    "Of 1,000 people 10 have the condition. The test flags 99: 9 true and 90 false.");
  // 1. draw everything step k shows, from scratch, with ctx.c colours
  // 2. animate only what step k adds
  if (Deck.isNew(anim, k, 1)) { /* transition the thing step 1 adds */ }
});
```

The contract that keeps Back, thumbnails, print and the audit right:

- `render` draws the **complete** state for step `k` each time it is called. It never assumes the previous step is on screen.
- It animates only when `Deck.isNew(anim, k, n)` is true for the step being added. `anim` is false under reduced motion, in thumbnails, print, screenshots and the audit, so every state must be correct with no transition at all.
- Random layouts use `Deck.rng(seed)` so a replay matches.

## Motion that reads

- **Durations.** 400 to 700 ms for one change, with `d3.easeCubicOut`. Stagger a group by 150 to 250 ms per item, by visual row, not by element count.
- **Draw a line** with `Deck.drawIn(path)`: the eye follows the tip. Grow bars from the baseline. Fade a label in after the mark it names has landed.
- **A quantity may count up. An identifier must not.** A percentage can tick up to its value; a year or a version number just appears.
- **Never cross-fade two pieces of text in the same place.** Finish the outgoing text, then bring in the new.
- **Never animate layout shifting.** Things do not slide sideways to make room.
- **The accent arrives last.** Context first, then the thing the claim is about.
- **No slide transitions.** The engine has none on purpose: a transition between slides carries no meaning (Part 3).

The four motion rules in the middle are adapted from the `design-deks-presentations` skill (see `../../docs/prior-art.md`). They are craft rules, Tier D.

## Check an exhibit

```
./bs shots talk.html --steps    # every step of every slide as a PNG
./bs audit talk.html
```

Look at each step's image, not only the last. Each one should be a correct picture on its own, since that is what the room sees while the speaker talks. Then open the deck and press through it: Back from the next slide should land on the final state, and nothing should flicker.
