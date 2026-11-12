---
name: make-deck
description: Builds an HTML slide deck from a topic, an outline, a chapter, a paper or notes. Use when the user asks for slides, a deck, a lecture, a talk or a presentation. Works headline-first: purpose, then a ghost deck of sentence claims the user agrees to, then slides with evidence and speaker notes, then measured checks. Part of brutalist-slides.
---

# Make a deck

Read `../../SKILL.md` first if you have not: its twelve rules apply here. The file format is `../../docs/deck-format.md`. The reasons are in `../../docs/evidence.md`; this page cites its Parts.

## 1. Settle what the deck is for (Part 1)

Before any slide, know these. Take what the user already said; ask only for what is missing, in one message.

| Question | Why it changes the deck |
|---|---|
| Projected behind a speaker, or read alone? | Opposite requirements. If both, make the deck and say a separate document should carry the detail. Offer to draft it |
| Who is in the room, and what do they already know? | Novices need terms defined first and fewer things per slide. Experts can take denser slides (Part 7, expertise reversal) |
| How long is the talk? | Sets how much argument fits. Do not turn minutes into a slide count: there is no evidence for any slides-per-minute rule |
| What should the room be able to do or decide afterwards? | This becomes the closing slide |
| What is the source? | A chapter, a paper, data, notes. The deck adds no result the source does not have |
| Which style? | Default `northeastern`. `./bs styles` lists them |
| Internet in the room? | If not, or not sure, finish with `./bs offline` |

If the deck must survive without the speaker (posted, sent ahead), it is a document. Say so. Either write the document, or make the deck with `--purpose reading` and tell the user the floors and the sparse layout are built for projection.

Read the whole source before outlining. The ending decides the opening.

## 2. Write the ghost deck (Part 2)

Write only the headlines, as a numbered list, in the conversation. No file yet.

- Each content headline is a **full sentence that makes a claim**: something that could be wrong. "Results" cannot be wrong. "Dropout reduces overfitting only when the training set is small" can.
- Aim for 15 words or fewer. Two lines is the limit on the slide and the audit enforces it.
- Mark each line with its layout: title, section, claim, evidence, statement, closing.
- Beside each claim, note in a few words what the evidence will be: a chart of what, a diagram of what, a table, a screenshot, a quotation, code.

Then test the list:

1. **Read it alone.** Do the headlines, in order, carry the argument with nothing else? If not, fix the list, not the slides.
2. **The reorder test.** If two slides could swap places and nothing is lost, one of them is not carrying weight. Cut or merge it. (From the `design-deks-presentations` skill; see `../../docs/prior-art.md`.)
3. **Terms.** Is every key term defined on an earlier, simpler slide than the one that depends on it (Part 7, pre-training)?
4. **One name per thing.** Pick the word for each concept now and hold it (Part 9).
5. **The end.** The closing headline says what to remember or decide. Not "Thank you", not "Questions?".

**Show the user the ghost deck and get agreement before building slides.** This is the cheapest point to change the argument. If the user said to go ahead without stopping, say which ghost deck you are building and continue.

## 3. Build the slides

```
./bs new talk.html --title "The title" --style northeastern
```

The file starts with seven starter slides, one per layout. Replace them. You write three places only: the slides inside `<div id="deck">`, the `bs-deck` style block, and the `bs-deck-js` script. Never read or edit the engine blocks; find your part by searching for `id="deck"` and `id="bs-deck-js"`. You can also write the slides in a fragment file and assemble with `./bs new talk.html --slides slides.html --builds builds.js`.

On a long deck, build the three hardest slides first: the one the talk turns on, the densest, and the main data exhibit. Run the audit and look at them. Then build the rest. A problem with the approach shows up on those three.

For each content slide:

**The headline** is the claim from the ghost deck, in `h2.claim`.

**The body is the evidence for that claim** (Parts 2, 3). In order of preference: the real figure or data, a chart you compute from stated numbers, a diagram of the mechanism, a real screenshot or photograph, a table, code, a quotation. A short list of parallel points is the last resort, and it sits beside an exhibit, not instead of one. Where the content is not visual (a definition, code, a quotation), the evidence half bends. The claim half does not. For charts, diagrams and anything staged, read `../animate/SKILL.md`.

**Cut what does not serve the claim** (Part 3). No decorative images, icons for their own sake, backgrounds or logos on content slides. Keep a vivid example or story when it is the point. Empty space under a clear exhibit is correct. Do not fill it.

**Text on the slide is what the room must see** (Part 4): terms, numbers, equations, labels, the source. Not sentences the speaker will say. Brief labels of two or three words are fine. Technical or unfamiliar terms belong on screen.

**Labels touch what they name** (Part 5). No legend. No caption explaining a diagram from below: annotate the diagram.

**One thing is the most different thing on the slide, and it is the important one** (Part 6). The accent colour marks it. If two things are in the accent colour, decide which one matters.

**Count the things** (Part 7). About four groups at once. Four list items at most, two lines each. If it does not fit, split the slide. Never shrink the type to fit.

**Say what kind of thing is shown.** `<p class="status">` holds one of: Observed data, Computed, Illustrative data, Conceptual illustration, Simulation (seeded). Add a `.source` line for anything that came from somewhere. A number carries its unit, and where it matters its sample size and date.

**Write the speaker notes** in `<aside class="notes">`: what to say, in spoken sentences. This is where the explanation lives. For a staged slide, one paragraph for entering and one per step. For an `evidence` layout slide, the notes say to stop talking and walk the room through the exhibit. Do not copy slide text into the notes or note text onto the slide.

Use the layouts for what they are for (Part 9): `section` slides only at section starts, `statement` for a sentence the talk turns on, `dark` tone as punctuation. Do not vary the look for variety. Do not add a table-of-contents or agenda slide unless the talk is long enough to need a map.

Colours are tokens, never hex values. See the token table in `../../docs/deck-format.md`.

## 4. Check, look, fix

```
./bs ghost talk.html     # the headlines as built: still the argument?
./bs check talk.html     # reads the file
./bs audit talk.html     # draws it and measures
./bs shots talk.html     # a PNG per slide: open and look at every one
```

Work until the audit says FAIL 0. Fix each WARN or be able to say why it stays. Then look at every screenshot, because the pixels win over the checks. For each slide ask: what is the first thing my eye lands on, and is that the point? Is anything crowded, misaligned or cut off? Would the back row read the smallest text? Write one line per slide of what you saw; a slide with no line was not looked at.

Then judge what the tools cannot:

- Does the evidence on each slide support the claim above it, or only sit near it?
- Is any meaning carried by colour alone? Would the slide still work in grey?
- Is each thing called by the same name on every slide?
- For each animation: what does the viewer learn from the change that the final frame does not show? If nothing, remove the motion.

If you can start a second agent, give it only the screenshots and one line about the audience, and ask it to state the deck's main message and name the slide that shows each point. Compare its answer with what you meant. (The cold read, from the `decision/reviewer` skill.)

If the room may have no internet, finish with `./bs offline talk.html`.

## 5. Hand over

Tell the user: the file's path; the purpose and audience you built for; the audit counts and any WARN you left, with the reason; what is illustrative or unverified; what you could not check (the real room, the projector, the operating system's reduce-motion setting). Offer the reading document if the deck needs one. Offer another style: `./bs restyle` keeps the slides and changes the look, and the checks must run again because type changes wrapping.

## What not to do

- Do not start with slides. Start with headlines.
- Do not write topic headlines: Introduction, Background, Results, Conclusion, Overview.
- Do not use bullets as the container for the argument.
- Do not invent numbers, quotes, logos, screenshots or citations. Label illustrative data as illustrative on the slide.
- Do not apply folklore (Part 11): 6 x 6, 10/20/30, an attention-span timer, retention percentages. Do not apply unsourced house numbers either: 60-30-10 colour splits, slides per minute, word caps of exactly 20.
- Do not add an image because a slide looks empty.
- Do not say the deck is done before the audit has run and you have looked at the screenshots.
