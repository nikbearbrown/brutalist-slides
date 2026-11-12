# Effective Slide Design: What the Evidence Supports, and What It Doesn't

*This is the evidence base for brutalist-slides. Every rule in the skills and every check in the audit points back to a Part of this document, and says which evidence tier it stands on.*

## The core problem

Slide design advice is abundant and mostly unearned. The empirical record says three uncomfortable things.

**The medium itself is roughly neutral.** A meta-analysis of 48 studies comparing the same material taught with PowerPoint versus traditional instruction found no average difference in learning (Hedges' g = 0.067, 95% CI −0.10 to 0.24). A benefit appeared for K–12 students but not for college students. The authors' conclusion: stop asking *whether* to use slides and study *how* they are used. An earlier classroom study found large instructor effects and almost no PowerPoint effect.

**People are bad at seeing what's wrong with slides.** Kosslyn et al. (2012) sampled 140 slideshows across research, education, government, and business and scored them against 137 rules derived from perception and memory research. No deck was flawless, the average deck violated about six of the eight principle classes, and academic research decks were no better than business decks. In a separate experiment, observers often failed to pick the flawed version of a slide, and when they picked correctly they often couldn't say why. Good slide design is not intuitive; it has to be made explicit.

**The evidence base is narrower than the confident tone of slide-design books implies.** The strongest experimental program (Mayer's multimedia learning research) mostly tests short, narrated, computer-based lessons on novices with immediate tests, not a 50-minute live lecture. The slide-specific experiments (assertion-evidence) come mostly from the lab that invented the method. Several popular rules have no support at all.

So this document sorts principles by how much weight they can bear.

---

## Evidence tiers

| Tier | What it means | Examples here |
|---|---|---|
| **A** — replicated experiments | Many controlled tests, effect sizes reported, boundary conditions known | Coherence, spatial contiguity, signaling, segmenting, modality, seductive details |
| **B** — a few experiments, one group | Plausible mechanism, promising results, not independently replicated at scale | Assertion-evidence slides |
| **C** — derived from basic cognition/perception | Grounded in established psychology but not tested as slide rules | Kosslyn's eight principles and their corollaries; WCAG contrast thresholds |
| **D** — practitioner heuristics | Useful habits, no validation | Duarte's Glance Test, "one idea per slide" |
| **Folklore** | Traced to misread or fabricated sources | The 10-minute attention span, the "learning pyramid" retention percentages |

**A caveat on Tier A.** The median effect sizes Mayer reports are tallies of experiments run largely by Mayer and colleagues, typically lessons of a few minutes with immediate tests. Expect smaller effects in a real classroom. Mayer acknowledges boundary conditions (several principles are stronger for low-prior-knowledge learners), and critics have argued some landmark results are hard to replicate, which Mayer disputes. One principle, redundancy, has visibly weakened across editions (Part 4).

### The two frameworks this document leans on

**Mayer's multimedia principles** (median effect sizes from Mayer's 2017 review unless noted):

| Principle | Claim | d |
|---|---|---|
| Coherence | Exclude extraneous material | 0.70 |
| Signaling | Highlight the organization of essential material | 0.46 |
| Redundancy | Don't add printed text that duplicates narration over graphics | 0.87 (2017) → 0.10 (2021 tally) |
| Spatial contiguity | Place words next to the graphics they describe | 0.79 |
| Temporal contiguity | Present narration and corresponding graphics at the same time | 1.30 |
| Segmenting | Break a lesson into learner-digestible parts | 0.70 |
| Pre-training | Teach key terms before the complex material | 0.46 |
| Modality | With graphics, spoken words beat printed words | 0.72 |

**Kosslyn's eight Cognitive Communication Principles**, organized by processing stage:

| Stage | Principle | Short version |
|---|---|---|
| Encoding | Discriminability | Differences must be large enough to see |
| Encoding | Perceptual organization | People automatically group elements; make the groups the right ones |
| Encoding | Salience | Attention goes to big differences; make the important thing the most different |
| Working memory | Limited capacity | About four chunks at a time |
| Working memory | Informative change | People assume every visual change means something |
| Long-term memory | Appropriate knowledge | Connect to what the audience already knows |
| Long-term memory | Compatibility | Form should match meaning |
| Long-term memory | Relevance | Neither too much nor too little for the point |

---

## Part 1 — Decide what the artifact is for

Slides projected behind a speaker and documents meant to be read alone are different artifacts with opposing requirements. Most bad decks fail by trying to be both (Garr Reynolds' "slideument").

**The case against slides as documents.** After the Columbia shuttle loss, the Columbia Accident Investigation Board examined a Boeing briefing slide on possible foam damage to the wing. The crucial caveat, that the debris that struck Columbia was hundreds of times larger than anything in the test data, sat in a low-level bullet in small type beneath a reassuring headline. The Board wrote that a senior manager could easily read the slide without realizing it described a life-threatening situation, adopted Tufte's analysis of it, and criticized NASA for substituting briefing slides for technical papers. Amazon reached a similar conclusion from the business side: in June 2004, Bezos ended PowerPoint at senior-team meetings in favor of narrative memos of four to six pages, read silently at the start of each meeting. His reasoning was that bullets are easy for the presenter and hard for the audience, and that narrative forces the writer to work out what matters and how the ideas connect.

**The case for slides as glance media.** Duarte's Glance Test holds that an audience member should grasp a slide's point in about three seconds, then return attention to the speaker. The logic is sound (people can't read dense text and listen at once; see Part 4), but the three-second figure is a practitioner heuristic, not a measured threshold.

**These only look contradictory.** Tufte is right about evidence displays; Duarte is right about live-talk support. The resolution is two artifacts: a sparse deck that supports the spoken argument, and a dense document (handout, memo, chapter, notes) that carries the data tables, derivations, and caveats. When dense evidence must appear in the room, put it up, stop talking, and walk the audience through it. Don't flash it.

**A counterpoint worth keeping.** A communications firm later rebuilt the Columbia slide in PowerPoint itself, and the rebuilt version communicated the risk properly. The failure was writing and hierarchy, not software. Tufte's "the tool corrupts thought" framing is a case-study argument, not an experimental result.

**Implementation notes**

- Decide per deck: projection, reading, or both. If both, make two files.
- Speaker notes are not the document unless you actually distribute them.
- If the deck must survive without you (posted online, sent ahead), that's a document. Design it as one.

---

## Part 2 — Make the headline a claim (assertion-evidence) — Tier B

The assertion-evidence structure replaces topic headlines ("Results") with a full-sentence claim ("Dropout reduces overfitting only when the training set is small"), supported by visual evidence (graph, diagram, photo), with text only as needed.

**What the experiments show**

- Garner & Alley (2013): 110 engineering students. The assertion-evidence group showed better comprehension, fewer misconceptions, lower perceived cognitive load, and stronger recall on a delayed test.
- A geology-course pilot reported 70% vs. 82% test scores, traditional vs. assertion-evidence.
- Building the slides helps the builder: students who made assertion-evidence slides understood their own content better than students who made topic-subtopic slides (Aippersbach, Alley & Garner 2013; Garner & Alley 2016).
- Baseline: a 2009 study found roughly 85% of engineering and science slides opened with a phrase headline that didn't state the slide's message, and nearly half had no visual evidence.

**Skeptic's notes**

- Nearly all of this comes from one research group evaluating its own method.
- When a 2012 study gave both conditions *identical* visual evidence, the advantage shrank to a non-significant trend. The visuals may be doing much of the work credited to the headline.
- In a 2011 study, conventional topic-subtopic slides produced *better* short-term recall of simple statistics; assertion-evidence won on complex concepts and long-term recall of key ideas. It's a tool for explanation and argument, not for reference facts.

**Why it plausibly works anyway.** A sentence headline is signaling (Part 6). Writing one forces the presenter to know what the slide claims. And a claim can be checked: a topic label can't be wrong, an assertion can. For teaching evaluation and critique, that's a feature: every slide becomes a falsifiable statement with its evidence directly beneath it.

**Implementation notes**

- Draft headlines only, first. Read them in order; they should carry the argument by themselves (consultants call this a ghost deck). A headline that makes no claim means the slide has no point or you haven't found it yet.
- Keep headlines to two lines; the Alley/Garner studies capped them there.
- Where content isn't visual (definitions, code, quotations), the "visual evidence" half bends. The claim half shouldn't.

---

## Part 3 — Cut what doesn't serve the claim (coherence) — Tier A

People learn more deeply when extraneous material is excluded. The best-quantified version is the seductive details effect: interesting but irrelevant additions. Sundararajan & Adesope's (2020) meta-analysis (58 studies, 7,500+ students) found a small-to-moderate learning cost (g ≈ −0.33), worse when the detail sat beside a relevant diagram, when it was persistent rather than momentary, when learners couldn't control the pace, and for novices.

**The boundary condition that matters for live teaching:** the effect was significant in lessons under about five minutes and not significant in lessons over about ten. Most included studies used 6–12 minute sessions. The lead author herself called the effect fairly small, and possible emotional benefits (lower anxiety, more engagement) are still being studied.

**What this means in practice**

- Cut: decorative stock photos, a logo on every slide, themed backgrounds, clip art, transitions that carry no meaning.
- Keep: vivid examples and stories that *are* the point rather than sitting beside it.
- Don't overcorrect: a joke at minute 30 of a lecture is not the same as a cat photo next to a diagram in a three-minute module.

---

## Part 4 — Don't make the audience read what you're saying (redundancy, revised) — Tier A, weakening

The classic claim: graphics plus narration beats graphics plus narration plus identical on-screen text, because reading and listening compete for the same verbal processing. Mayer's 2017 review listed d = 0.87. His 2021 tally reported positive results in only 8 of 12 tests, median d ≈ 0.10. That is a principle in retreat, and it's rarely acknowledged in slide-design books.

**What survives**

- **Verbatim text hurts; brief labels don't.** Yue, Bjork & Bjork (2013) found on-screen text identical to narration impaired learning while brief labels did not. Mayer & Johnson (2008) found two-to-three-word key phrases improved retention (though not transfer).
- **Boundary conditions where redundant text is fine:** no graphics on screen, slow or self-paced delivery, technical or unfamiliar terms, short text.
- **Non-native speakers:** mixed. One study found adding captions to a narrated lesson didn't help non-native English speakers, possibly because they had no spare capacity to use them. Technical terms on screen remain a reasonable bet.
- **Audiences hate the alternative.** In Kosslyn's survey, speakers reading word-for-word from slides or notes was among the three most prevalent problems and among the five most annoying.

**The modality principle** (d ≈ 0.72) is the cleaner argument for live talks: words that accompany graphics work better spoken than printed. Put the explanation in your voice and the evidence on the screen.

**Rule:** put on the slide what the audience must *see* (terms, equations, numbers, labels). Say what they must *understand*.

---

## Part 5 — Put words next to what they describe (spatial contiguity) — Tier A

People learn more when corresponding words and pictures are near each other: 22 of 22 tests, median d = 1.10 in the Cambridge Handbook tally (0.79 in the 2017 review). Kosslyn's corollaries say the same from the perception side: labels are first read as belonging to the nearest element, direct labels remove the search a legend requires, and legend order should match the order of the data.

**Implementation notes**

- Direct-label lines and bars; delete the legend.
- Annotate the diagram itself rather than explaining it in a caption below.
- Place callouts beside the region they refer to, connected by proximity rather than by numbered keys.

---

## Part 6 — Direct attention deliberately (signaling and salience) — Tier A / C

Cues that highlight the structure of essential material help (signaling, d roughly 0.4–0.7 depending on the tally). Kosslyn's salience principle explains why: attention goes automatically to large perceptible differences, so the most different element on the slide should be the most important one. In his sample, about a third of decks failed this, and about a quarter used color to make *less* important elements salient.

**Practice**

- One accent color means "look here." Everything else is neutral or deliberately muted.
- Motion is the strongest attention cue there is, which makes animation a pointer. Use it to direct the eye or show a process unfolding, never as decoration.
- Build complex diagrams in stages (segmenting, d ≈ 0.70): show the system, then add the flow, then highlight the failure point.

**Unsettled: building bullet lists one item at a time.** Kosslyn treats this as a rule (96% of decks "violated" it), but a 2009 study he cites found slightly better memory when a list was shown all at once (for only 2 of 9 items). Don't reflexively animate bullets. Build diagrams and processes; show short lists whole.

---

## Part 7 — Respect working memory (limited capacity) — Tier C

Working memory holds roughly four chunks (Cowan 2001), and hierarchical grouping stretches that. Kosslyn's most-violated rules all live here: more than four bullets per list (91% of decks), more than two lines per bullet (91%), no hierarchical organization (86%). Pre-training (d ≈ 0.46) is the underused fix: define key terms on an earlier, simpler slide before the dense one that depends on them.

**Skeptic's notes**

- "Four bullets, two lines" are Kosslyn's derived heuristics (two lines ≈ four concepts), not thresholds anyone tested at the slide level.
- Kosslyn's prevalence figures use a bad-apple rule: one violating slide flags the entire deck. That inflates the percentages. Directionally right, numerically soft.
- **Expertise reversal:** many multimedia principles shrink or reverse for high-knowledge learners. Denser slides for a doctoral seminar than for a first-year course is defensible, not hypocritical.

---

## Part 8 — Make it legible from the back (discriminability) — Tier C

Kosslyn's sample: all-caps, all-italic, or all-bold text in 81% of decks; text under 20 pt in 66%; deep saturated blue text in 55%; adjacent red and blue regions (which visibly shimmer) in 36%.

**Contrast.** WCAG 2.x AA requires 4.5:1 for normal text and 3:1 for large text. Projectors and lit rooms reduce effective contrast, so my recommendation (not WCAG's) is to treat 4.5:1 as the floor for *everything* on a projected slide, headlines included. Don't import WCAG's "large text" size definition (18 pt) to slides; it's calibrated for screens at reading distance.

**Size, translated.** PowerPoint point sizes are relative to a slide 7.5 inches (540 pt) tall. Kosslyn's 20 pt floor is therefore about 3.7% of slide height, or roughly 40 px on a 1080-px-tall canvas. The better test is visual angle: shrink the slide on your monitor until it subtends what the screen subtends from the back row, then try to read it.

**Color.** Never encode meaning in hue alone; pair it with position, direct labels, or lightness so color-vision deficiency doesn't erase it.

---

## Part 9 — Change should mean something (informative change) — Tier C

Audiences assume a change in appearance signals a change in information. In Kosslyn's sample, 72% of decks changed visual characteristics without any change in meaning, 64% had no crisp ending to the talk or its sections, and 37% mixed serif and sans-serif arbitrarily.

- One template, applied consistently.
- A distinct format reserved for section dividers, and only for them.
- Fixed terminology. Don't alternate "model," "network," and "system" for the same thing; the audience will assume three things.
- End sections and the talk explicitly.

---

## Part 10 — Match chart form to meaning (compatibility) — Tier C

- **Line graphs** for trends and continuous x-axes; crossing lines show interactions better than grouped bars.
- **Bar graphs** for discrete values and comparisons between specific points.
- **Lightness or saturation**, not hue, for ordered quantities; hue is read as category, not amount.
- **Avoid area** for precise quantities; people underestimate areas, increasingly so as they grow.
- **Maps** for geography and routes; **flow charts** for sequences and processes.

---

## Part 11 — Folklore audit

| Claim | Status | Do instead |
|---|---|---|
| "Attention drops after 10–15 minutes" | Bradbury (2016) traced the citation chain to a single 1978 paper that barely measured attention; note-taking stays fairly constant and dips near the end | Change activity for pedagogical reasons (retrieval practice, problems), not on a timer |
| "We remember 10% of what we read, 20% of what we hear…" | Fabricated percentages falsely attached to Dale's Cone of Experience, which contained no numbers | Ignore it, and correct it when students cite it |
| 6×6 rule; 10/20/30 rule | Practitioner heuristics with no validation | Use the working-memory and legibility reasoning in Parts 7–8 |
| "Never use bullets" | Overcorrection | Bullets are fine for genuinely parallel items; the problem is bullets as the default container for an argument |
| "A good slide stands on its own" | Confuses slide with document | Two artifacts (Part 1) |
| "Students prefer slides, so they work" | Preference isn't learning; students report liking PowerPoint, yet college outcomes don't differ | Measure learning, not satisfaction |
| "Pick a font that matches your topic's personality" | Kosslyn's compatibility rule, but the least-violated principle and the weakest stakes | Spend the effort on contrast and size first |

---

## Part 12 — Implementation notes for HTML decks

These assume a fixed 1920×1080 slide canvas scaled to fit the viewport.

**Design tokens.** The two non-ink colors below were checked against white: muted ≈ 4.8:1, accent ≈ 5.2:1. Both clear the 4.5:1 floor.

```css
:root {
  --bg: #ffffff;
  --ink: #111827;      /* body text */
  --muted: #6b7280;    /* de-emphasized context (≈4.8:1 on white) */
  --accent: #b45309;   /* the single "look here" color (≈5.2:1 on white) */

  --claim-size: 64px;  /* assertion headline */
  --body-min: 40px;    /* ≈ 20 pt on a 7.5-inch PowerPoint slide */
  --label-min: 32px;   /* chart and diagram labels: never smaller */
}

.slide { background: var(--bg); color: var(--ink); }

.slide h2.claim {
  font-size: var(--claim-size);
  line-height: 1.15;
  max-width: 30ch;          /* keeps the claim to ~2 lines */
  text-transform: none;     /* no all-caps headlines */
}

.slide p, .slide li { font-size: var(--body-min); }
.slide .label      { font-size: var(--label-min); }
.slide .accent     { color: var(--accent); }
.slide .context    { color: var(--muted); }
```

**Contrast check** (WCAG 2.x relative luminance; 6-digit hex only):

```js
function luminance(hex) {
  const [r, g, b] = hex.replace('#', '').match(/../g)
    .map(h => parseInt(h, 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

// contrast('#6b7280', '#ffffff') → ≈ 4.83
```

**Ghost-deck audit.** Run in the browser console on the deck. It prints every headline in order (read them as the argument) and flags headlines over two lines or too short to be a claim. The word-count test is crude; it catches "Results" and "Background," not every non-claim.

```js
document.querySelectorAll('.slide h2').forEach((h, i) => {
  const cs = getComputedStyle(h);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
  const lines = Math.round(h.offsetHeight / lh);   // offsetHeight ignores scale transforms
  const text = h.textContent.trim();
  const words = text.split(/\s+/).length;
  const flags = [
    lines > 2 ? '⚠ >2 lines' : '',
    words < 5 ? '⚠ topic label, not a claim?' : '',
  ].filter(Boolean).join('  ');
  console.log(`${String(i + 1).padStart(2)}. ${text}  ${flags}`);
});
```

**How this repo implements Part 12.** The tokens above became the `--bs-*` tokens each style sets (see `docs/deck-format.md`). The contrast function is in `scripts/bs.py` and in the engine's audit. The ghost-deck audit is `./bs ghost` and `?ghost`. One departure: the claim is not capped at `30ch`. At 64 px that width wraps most full-sentence claims onto three lines, so the claim uses the slide's full text width and the audit fails any headline that renders on more than two lines.

---

## Part 13 — Slide review rubric

A yes/no checklist for reviewing a deck, usable by a human reviewer, by students, or as instructions to an agent auditing a deck.

```text
SLIDE DECK REVIEW RUBRIC

PURPOSE
[ ] Is this deck for projection behind a speaker, or for reading alone? Is it designed for that one job?
[ ] If it must also be read alone, is there a separate document carrying the dense evidence?

HEADLINES
[ ] Does every content slide's headline state a claim in a full sentence?
[ ] Read in order, do the headlines alone carry the argument?
[ ] Is every headline two lines or fewer?

EVIDENCE AND TEXT
[ ] Does the body of each slide support its headline, visually where the content allows?
[ ] Is there any sentence on screen that the speaker will read aloud verbatim? (Remove it.)
[ ] Are technical terms, equations, and key numbers on screen? (Keep them.)
[ ] Are new key terms introduced before the slide that depends on them?

COHERENCE
[ ] Does every image, icon, and animation serve the slide's claim?
[ ] Are decorative backgrounds, repeated logos, and meaningless transitions gone?

WORKING MEMORY
[ ] Does any slide require holding more than about four groups in mind at once?
[ ] Are complex diagrams built up in stages rather than shown all at once?

ATTENTION
[ ] Is the most important element the most visually salient one?
[ ] Is one accent color reserved for emphasis and used for nothing else?
[ ] Does every animation direct attention or show a process?

LABELING
[ ] Are charts directly labeled instead of relying on a legend?
[ ] Are labels physically next to the things they name?

LEGIBILITY
[ ] Is all text at least ~3.7% of slide height (≈40 px on a 1080-px canvas, ≈20 pt in PowerPoint)?
[ ] Does all text meet at least 4.5:1 contrast against its background?
[ ] Is there no all-caps, all-italic, or all-bold running text?
[ ] Is meaning ever carried by hue alone?

CONSISTENCY
[ ] Does every change in visual format correspond to a change in meaning?
[ ] Is terminology identical across slides?
[ ] Are section starts and the ending clearly marked?

CHARTS
[ ] Trends and continuous axes as lines; discrete comparisons as bars?
[ ] Ordered quantities shown with lightness or saturation, not hue?
[ ] No area-based encoding where precise values matter?
```

---

## Reference lineage and further reading

**Whether slides help at all**

- Baker, J. P., Goodboy, A. K., Bowman, N. D., & Wright, A. A. (2018). Does teaching with PowerPoint increase students' learning? A meta-analysis. *Computers & Education, 126*, 376–387.
- Instructor-vs-PowerPoint classroom study, *Teaching of Psychology* (2007). doi:10.1080/00986280709336652

**Cognitive principles applied to slides**

- Kosslyn, S. M., Kievit, R. A., Russell, A. G., & Shephard, J. M. (2012). PowerPoint presentation flaws and failures: A psychological analysis. *Frontiers in Psychology, 3*, 230. https://pmc.ncbi.nlm.nih.gov/articles/PMC3398435/
- Kosslyn, S. M. (2007). *Clear and to the Point: 8 Psychological Principles for Compelling PowerPoint Presentations.* Oxford University Press.
- Cowan, N. (2001). The magical number 4 in short-term memory. *Behavioral and Brain Sciences, 24*, 87–185.

**Multimedia learning**

- Mayer, R. E. (2017). Using multimedia for e-learning. *Journal of Computer Assisted Learning, 33*(5), 403–423.
- Mayer, R. E. (2021). *Multimedia Learning* (3rd ed.). Cambridge University Press.
- Mayer, R. E., & Fiorella, L. (2014). Principles for reducing extraneous processing in multimedia learning. In *The Cambridge Handbook of Multimedia Learning* (2nd ed.). Cambridge University Press.
- Mayer, R. E., & Johnson, C. I. (2008). Revising the redundancy principle in multimedia learning. *Journal of Educational Psychology, 100*(2), 380–386.
- Yue, C. L., Bjork, E. L., & Bjork, R. A. (2013). Reducing verbal redundancy in multimedia learning. *Journal of Educational Psychology, 105*(2), 266–277.
- Sundararajan, N., & Adesope, O. O. (2020). Keep it coherent: A meta-analysis of the seductive details effect. *Educational Psychology Review, 32*, 707–734.
- Rey, G. D. (2012). A review of research and a meta-analysis of the seductive detail effect. *Educational Research Review, 7*(3), 216–237.

**Assertion-evidence**

- Alley, M., & Neeley, K. A. (2005). Rethinking the design of presentation slides: A case for sentence headlines and visual evidence. *Technical Communication, 52*(4), 417–426.
- Garner, J. K., Alley, M., Gaudelli, A., & Zappe, S. (2009). Common use of PowerPoint versus the assertion-evidence structure. *Technical Communication, 56*(4), 331–345.
- Garner, J. K., et al. (2011). Assertion-evidence slides appear to lead to better comprehension and recall of more complex concepts. ASEE Annual Conference.
- Wolfe, K. L., Alley, M., & Garner, J. K. (2012). High-quality visual evidence on presentation slides may offset the negative effects of redundant text and phrase headings. ASEE Annual Conference.
- Garner, J., & Alley, M. (2013). How the design of presentation slides affects audience comprehension. *International Journal of Engineering Education, 29*(6), 1564–1579.
- Garner, J. K., & Alley, M. (2016). Slide structure can influence the presenter's understanding of the presentation's content. *International Journal of Engineering Education, 32*(1), 39–54.
- Penn State research summary: https://writing.engr.psu.edu/research.html

**Critiques of slideware**

- Tufte, E. R. (2003/2006). *The Cognitive Style of PowerPoint.* Graphics Press.
- Columbia Accident Investigation Board (2003). *Report, Volume 1*, Chapter 7 (Boeing slide discussion, p. 191).
- IEEE Professional Communication Society (2019). Engineering by PowerPoint. https://procomm.ieee.org/engineering-by-powerpoint
- Bryar, C., & Carr, B. (2021). *Working Backwards.* St. Martin's Press. (Amazon's narrative-memo practice.)

**Practitioner sources (Tier D)**

- Duarte, N. (2008). *slide:ology.* O'Reilly. Glance Test: https://www.duarte.com/resources/guides-tools/the-glance-test/
- Reynolds, G. (2008). *Presentation Zen.* New Riders.

**Accessibility**

- W3C. WCAG 2.x Success Criterion 1.4.3, Contrast (Minimum). https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum

**Folklore debunking**

- Bradbury, N. A. (2016). Attention span during lectures: 8 seconds, 10 minutes, or more? *Advances in Physiology Education, 40*, 509–513.
- Subramony, D., Molenda, M., Betrus, A., & Thalheimer, W. (2014). The mythical retention chart and the corruption of Dale's Cone of Experience. *Educational Technology, 54*(6).
