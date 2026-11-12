---
name: review-deck
description: Reviews, critiques or audits a slide deck against the evidence-based rubric. Use when the user asks to review, critique, grade, audit or improve a deck: a brutalist-slides HTML deck, any other HTML deck, or a PowerPoint, Google Slides, Keynote or PDF deck supplied as a file or as images. Produces findings per slide, each tied to a rule and its evidence tier, with a fix. Does not rewrite the deck unless asked.
---

# Review a deck

People are bad at seeing what is wrong with slides, and often cannot say why when they do (Kosslyn et al. 2012, in `../../docs/evidence.md`). So a review here is explicit: a rubric, measurements where a tool can take them, and a reason for every finding. The rubric is Part 13 of `../../docs/evidence.md`. Read it before reviewing.

## What you are given decides what you can measure

| The deck is | Do |
|---|---|
| A brutalist-slides HTML deck | `./bs ghost`, `./bs check`, `./bs audit`, `./bs shots`. Everything is measured |
| Another HTML deck | Open it in a browser and screenshot every slide. Run the console snippets in Part 12 of the evidence document (ghost-deck audit, contrast function). Sizes are judged relative to slide height |
| PowerPoint, Keynote, Google Slides | Get images of every slide (an export to PDF or PNG, or ask the user for one). Read the text from the file if you can. Type size is the point size on a 7.5 inch slide: 20 pt is the floor |
| Images or a PDF only | Review from the images. Say that nothing was measured from source |

Review rendered slides, never only the source. Review every slide, not a sample.

## The passes

**1. Purpose (Part 1).** What is this deck for: projection or reading? If you cannot tell, that is the first finding. A deck trying to be both is the most common failure and explains many of the others. Judge the rest against the purpose: a reading document is allowed more text.

**2. The ghost deck (Part 2).** List every headline in order. Mark each one: a claim, or a topic label. Read the list alone and write, in two sentences, the argument it makes. If you cannot, say so. This list goes at the top of the review.

**3. Each slide, against the rubric.** For every slide write one line of verdict, even when it is "fine". A slide with no line was not reviewed. Check:

- Headline: a full-sentence claim, two lines or fewer.
- Evidence: does the body support the headline, or only sit near it? Visual where the content allows?
- Redundancy (Part 4): are there sentences the speaker will read aloud? Are terms, numbers and equations on screen?
- Coherence (Part 3): does every image, icon and animation serve the claim?
- Working memory (Part 7): more than about four groups? Lists over four items or two lines? A dense diagram shown all at once?
- Attention (Part 6): is the most salient thing the most important? Is the accent colour used for one meaning?
- Labelling (Part 5): legends, labels far from what they name.
- Legibility (Part 8): text under 3.7% of slide height (40 px at 1080, 20 pt in PowerPoint), contrast under 4.5:1, all-caps or all-italic running text, meaning carried by hue alone.
- Chart form (Part 10): the form matches what the claim is about.

**4. The deck as a whole (Part 9).** Does every change in look correspond to a change in meaning? Are section starts and the ending marked? Is each thing called by one name throughout? Are terms defined before they are needed?

**5. The cold read, if you can start a second agent.** Give it only the slide images and one line about the audience. Ask for the deck's main message and, for each point, the slide that shows it. Compare with what the deck seems to intend. A gap between the two is a finding. (From the `decision/reviewer` skill; see `../../docs/prior-art.md`.)

## Weigh findings by the evidence

Every finding names its rule and the tier that rule stands on. The tier decides how hard to press.

| Tier | Rules | How to state it |
|---|---|---|
| A, replicated experiments | Cutting extraneous material, labels beside what they name, signalling, staging complex exhibits, spoken explanation with on-screen graphics | "The evidence is strong that this costs the audience." |
| B, one research group | Sentence-claim headlines | "Promising evidence, from the lab that proposed the method." |
| C, derived from cognition and perception | Size and contrast floors, four-item lists, consistency, chart form | "A sound derived rule, not a tested threshold." |
| D, practitioner habit | Glance test, one idea per slide | "A useful habit. Not evidence." |

Do not present a Tier C or D rule as a law. Do not use folklore as a finding (Part 11): never cite 6 x 6, 10/20/30, a ten-minute attention span or retention percentages, and say so if the deck's author relied on them. Allow for the audience: denser slides for experts are defensible (Part 7).

Measurements are facts and are stated as facts: "the axis labels are 18 px; the floor is 32 px".

## The report

Lead with the answer.

1. **Summary.** Three or four sentences: what the deck is for, whether it does that job, and the two or three changes that would help most.
2. **The ghost deck.** The headline list, each marked claim or label, and the argument it makes when read alone.
3. **Findings**, most serious first. Each one: slide number, what is wrong, the rule and its tier, the fix. Group repeats ("slides 4, 7 and 9: legends") instead of listing them three times.
4. **Per-slide verdicts.** One line each.
5. **What was measured and what was not.** Tools used, and what needs a human or the real room.
6. **What works.** Say what should be kept. A review that lists only faults invites changes that break the good parts.

Do not rewrite the deck unless the user asks. If they do, follow `../make-deck/SKILL.md`: fix the ghost deck first, then the slides.

## For students

When the review is teaching feedback, quote the rule in plain words and show the fix on one of their own slides. A claim headline can be checked, which is the point: ask the student what evidence would make the headline false.
