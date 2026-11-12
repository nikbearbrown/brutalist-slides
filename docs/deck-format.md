# The deck format

A deck is one HTML file. This page is the contract: what an agent writes, what the engine does with it, and what later converters (Google Slides, PowerPoint, PDF) can rely on.

## The file

```
<html data-style="northeastern" data-purpose="projection">
  <!-- bs:fonts --> ... <!-- /bs:fonts -->     written by ./bs, never by hand
  <style id="bs-engine">  ... </style>         written by ./bs, never by hand
  <style id="bs-style">   ... </style>         written by ./bs, never by hand
  <style id="bs-deck">    ... </style>         yours: CSS for this deck only
  <main id="stage"><div id="deck">
      <section class="slide" ...> ... </section>     yours: the slides
  </div></main>
  <!-- bs:d3 --> ... <!-- /bs:d3 -->           written by ./bs
  <script id="bs-engine-js"> ... </script>     written by ./bs, never by hand
  <script id="bs-deck-js">   ... </script>     yours: builds for this deck
</html>
```

You write three places: the slides, `bs-deck` and `bs-deck-js`. Do not read or edit the engine blocks: they are long, and `./bs sync` overwrites them. To find your part, search for `id="deck"` and `id="bs-deck-js"` and read from those lines.

`data-purpose` is `projection` (shown behind a speaker) or `reading` (read alone). See Part 1 of `docs/evidence.md`. This engine and its floors are built for projection.

## The canvas

Every slide is 1920 x 1080 and is scaled to fit the window. Sizes are stage pixels. Two floors hold everywhere and the audit measures them as drawn, including text inside an SVG that has been scaled:

| What | Floor |
|---|---|
| Body text (`p`, `li`, `td`, `blockquote`) | 40 px |
| Labels (chart and diagram text, sources, eyebrows, table heads, code) | 32 px |
| Contrast of any text against what is behind it | 4.5:1 |

## A slide

```html
<section class="slide" data-layout="claim" data-tone="light">
  <p class="eyebrow">Short locator</p>
  <h2 class="claim">A full sentence that states the slide's claim.</h2>
  <p class="status">Observed data</p>
  <div class="evidence"> ...the exhibit... </div>
  <p class="source">Source: author, venue, year</p>
  <aside class="notes"><p>What you will say.</p></aside>
</section>
```

| `data-layout` | Use | Holds |
|---|---|---|
| `title` | First slide, once | `.eyebrow`, `h1.title`, `.subtitle`, optional `.logo` |
| `claim` | The workhorse | `.eyebrow` (optional), `h2.claim`, then `.evidence`, or `.split` with `.evidence` and `.points` |
| `evidence` | A dense exhibit you stop and walk the room through | smaller `h2.claim`, a large `.evidence`. The notes must say to pause |
| `statement` | One sentence the talk turns on | `.eyebrow`, `h2.statement` |
| `section` | A section start, and nothing else | `.eyebrow`, `h2.title`, `.subtitle` |
| `closing` | Last slide, once | `.eyebrow`, `h2.title`, `.subtitle`, optional `.logo` |

`data-tone` is `light` (default), `dark` or `accent`. Tone changes mean something: `accent` is for section dividers only. A style may fix the tone of the title and closing slides.

### Classes

| Class | What it is |
|---|---|
| `.claim` | The sentence headline. Two lines at most |
| `.eyebrow` | A short locator above the headline (a few words) |
| `.evidence` | The exhibit: an inline SVG, an image, a table, code, or a build |
| `.split` | Two columns: `.evidence` on the left (wide), `.points` on the right. `.split.even` for equal columns |
| `.points` | A short list of parallel items: four at most, two lines each |
| `.status` | What kind of thing is shown: Observed data, Computed, Illustrative data, Conceptual illustration, Simulation (seeded) |
| `.source` | The source line, at the bottom |
| `.label` | Label-sized text |
| `.accent` / `.context` | The one "look here" colour / de-emphasised context |
| `.num` | Numbers in the monospaced face |
| `.quote` | A quotation, followed by a `.label` naming who said it |
| `pre.code`, `table.data` | Code and tables, sized for the back row |
| `.logo` with `data-logo="mark"` or `"lockup"` | The style's logo. Title and closing slides only |
| `.notes` | Speaker notes. Never shown on the slide |

### Colour: tokens only

Never write a hex colour in a slide, in `bs-deck` or in a build. Use the working tokens, which change with the slide's tone and the deck's style:

| Token | Meaning |
|---|---|
| `--ground` | The slide background |
| `--surface` | Panels one step off the ground |
| `--ink` | Main text and marks |
| `--soft` | Captions, sources, context |
| `--hair` | Hairlines and gridlines |
| `--accent` | The single "look here" colour, safe for text |
| `--deco` | The accent for bars, marks and fills only. In some styles it is too pale for text |
| `--tint` | A pale panel behind the thing that matters |

In inline SVG use the classes: `f-ink f-soft f-accent f-deco f-hair f-surface f-tint f-ground f-none` for fill and `s-ink s-soft s-accent s-deco s-hair` for stroke. SVG text is ink in the label face unless you say otherwise. In a build, use `ctx.c.ink`, `ctx.c.accent` and so on. `./bs check` warns on every hard-coded colour, because a restyled deck would leave it behind.

For data series use `--bs-data-1` to `--bs-data-5` (`ctx.data` in a build): the first is the series the claim is about. For ordered quantities use the lightness ramp `--bs-seq-1` to `--bs-seq-5` (`ctx.seq`), never a set of hues.

## Steps

Each press of Next adds one step, then moves to the next slide.

- **Reveal an element:** `data-step="2"` on any element shows it from the second press on.
- **Draw an exhibit in stages:** a build (below).

Thumbnails, print, PDF, screenshots and the audit all show each slide in its final state. Short lists are shown whole: do not put `data-step` on every item of a list of four or fewer (Part 6).

## Builds

```html
<div class="evidence" data-build="funnel"></div>
```

```js
Deck.build("funnel", 3, function (el, k, anim, ctx) {
  var svg = Deck.svg(el, 1680, 600, "Short title of the final picture", "What it shows, with the numbers.");
  // draw everything that step k shows, from scratch
  // animate only what step k adds:
  if (Deck.isNew(anim, k, 2)) { /* transition for the thing step 2 adds */ }
});
```

- `render(el, k, anim, ctx)` draws the **complete** picture for step `k` every time. `k = 0` is the base state. This is what makes Back, thumbnails and print correct.
- Draw in a fixed `viewBox` (`Deck.svg(el, width, height, title, description)`). Text sizes inside it are in viewBox units; the audit measures them as drawn, so if the exhibit box is 1680 wide, a 1680-wide viewBox keeps sizes true.
- `anim` is false under reduced motion, in thumbnails, in print and in the audit. Then every step draws at once.
- Helpers: `Deck.text(g, x, y, string, {size, weight, fill, family, anchor})`, `Deck.fadeIn(sel, delay, ms)`, `Deck.drawIn(path, delay, ms)`, `Deck.rng(seed)` (seeded, so replays match), `Deck.isNew(anim, k, n)`.
- D3 7.9.0 is on the page. A build does not have to use it.

## Speaker notes

`<aside class="notes">` holds what the speaker says. N shows them under the slide. They are where the explanation lives (Part 4): the slide shows what the room must see, the notes say what it must understand. For a build, write one paragraph for entering the slide and one per step.

## Looking at a deck

| Address | Shows |
|---|---|
| `deck.html` | The deck. Arrows or space to move, N notes, G all slides, F fullscreen |
| `deck.html#7` or `#7.2` | Slide 7, or slide 7 at step 2 |
| `deck.html?ghost` | The headlines alone, in order |
| `deck.html?audit` | The rendered audit. The result is also in `window.bsAudit` |

## For converters

A converter to another format can rely on this: one `section.slide` per slide in document order; `data-layout` names the layout; the headline is the first `.claim`, `.title` or `.statement`; `.notes` is the speaker notes; `.source` and `.status` are text; an `.evidence` is either static markup or a build whose final state is what `./bs shots` captures. Colours and faces are the `--bs-*` tokens in the `bs-style` block.
