---
name: brutalist-slides
description: Makes and reviews HTML slide decks that hold up to the evidence on slide design. Use when the user asks for slides, a slide deck, a lecture deck, a talk, a presentation, a pitch deck, or asks to review, critique, audit, fix or restyle a deck. Produces one self-contained HTML file per deck on a 1920 x 1080 canvas, in the Northeastern (default), SEIS or Brutalist style or a style the user makes. Every content slide is a sentence claim with its evidence; type size, contrast, overflow and headline length are measured, not guessed. Not for PowerPoint or Google Slides files directly.
---

# brutalist-slides

Slide advice is abundant and mostly unearned. This skill makes decks from what the evidence supports, says how strong that evidence is, and measures the result instead of trusting the eye. The evidence base is `docs/evidence.md`. Read it once before your first deck: Parts 1 to 10 are the rules, Part 11 is the folklore to refuse, Part 13 is the review rubric.

## Which skill

| The user wants | Read |
|---|---|
| A new deck, or new slides in a deck | `skills/make-deck/SKILL.md` |
| A chart, a diagram, a staged build or any animation | `skills/animate/SKILL.md` (with make-deck) |
| A review, critique or audit of a deck, theirs or anyone's | `skills/review-deck/SKILL.md` |
| A new style: their own colours, type and logo | `skills/make-style/SKILL.md` |
| The same deck in another style | `./bs restyle deck.html <style>`, then run the checks again |

The file format (layouts, classes, tokens, steps, builds, notes) is `docs/deck-format.md`.

## The rules that do not bend

These hold in every style and every deck. Each names its Part in `docs/evidence.md` and its tier there.

1. **Decide what the deck is for before writing a slide** (Part 1). Projection behind a speaker, or reading alone. If both, two artifacts: a sparse deck and a document. Ask the user if it is not clear. This engine is for projection.
2. **Every content slide's headline is a full-sentence claim, two lines at most** (Part 2, Tier B). Write the headlines first and read them in order. If they do not carry the argument, the deck is not ready for slides.
3. **The body is the evidence for the headline**, visual where the content allows (Part 2). Cut whatever does not serve the claim: decoration, stock photos, a logo on every slide (Part 3, Tier A).
4. **Show what the room must see; say what it must understand** (Part 4). Terms, numbers, equations and labels go on the slide. The explanation goes in the speaker notes. No sentence appears on the slide and word for word in the notes.
5. **Labels sit next to what they name** (Part 5, Tier A). Direct-label bars, lines and regions. No legends.
6. **One accent colour means look here, and nothing else** (Part 6). Animation is a pointer: it directs the eye or shows a process, never decorates. Build diagrams in stages; show short lists whole.
7. **About four things at a time** (Part 7, Tier C). Four list items at most, two lines each. Define a term before the slide that depends on it. Denser slides for an expert audience are defensible; say so when you do it.
8. **Legible from the back row** (Part 8, Tier C). Body text 40 px or more, labels 32 px or more, on the 1080-high canvas. All text 4.5:1 or better against what is behind it. No all-caps, all-italic or all-bold running text. Meaning never rests on hue alone.
9. **A change in look means a change in meaning** (Part 9). One style, applied consistently. The section-divider format is for section starts only. One name per thing. The talk ends on a closing slide.
10. **Chart form matches meaning** (Part 10). Lines for trends, bars for discrete comparisons, lightness for ordered quantities, no area where precise values matter.
11. **Colours come from tokens, never from hex values in a slide.** That is what lets a deck be restyled, and it keeps the accent meaning one thing.
12. **Nothing is invented.** Numbers are real and sourced, or computed in the open, or labelled illustrative on the slide. Named tools are shown as themselves. A source line says where a number came from.

Refuse folklore when a user or a source brings it (Part 11): the 6 x 6 rule, 10/20/30, "attention drops after ten minutes", the learning-pyramid percentages, "never use bullets", "a good slide stands on its own". Say what the evidence supports instead, in a sentence, and carry on.

## The loop

Every deck goes through the same loop. Do not hand over a deck that has not been through all of it.

```
purpose  ->  ghost deck (headlines only)  ->  user agrees the argument
         ->  slides and notes  ->  ./bs check  ->  ./bs audit  ->  ./bs shots, and look
         ->  fix, repeat until FAIL 0 and every WARN is fixed or explained
```

`./bs check` reads the file. `./bs audit` draws it in a browser and measures type size, contrast, overflow and wrapping on every slide in its final state. `./bs shots` writes a PNG of every slide: open them and look, because a deck can pass every measurement and still be crowded or unclear. If Playwright is not installed, open the deck in a browser with `?audit` on the address and read the panel (the same result is in `window.bsAudit`).

The audit cannot judge four things, and you must: whether the evidence supports each claim, whether meaning rests on hue alone, whether terms stay the same across slides, and whether each animation teaches something a still frame would not.

## Commands

`./bs help` lists them. The ones you will use most:

```
./bs new talk.html --title "Title" [--style northeastern|seis|brutalist|yours]
./bs ghost talk.html        ./bs check talk.html        ./bs audit talk.html
./bs shots talk.html        ./bs restyle talk.html seis  ./bs offline talk.html
./bs styles [id]            ./bs new-style <id>
```

Run `./bs offline` last, when the deck is finished: it puts the fonts and D3 inside the file so the deck works with no internet in the room, and it makes the file large.

## Styles

`./bs styles` lists them; `./bs styles <id>` prints one with its contrast table and its rules. Read the rules of the style you are using: they are part of the brief.

- **northeastern** (default): white slides, one red rule, black title and statement slides, red section dividers, Lato.
- **seis**: Northeastern's brand worn by one unit (Software Engineering and Information Systems). White title and closing slides that carry the SEIS lockup.
- **brutalist**: cream page, warm ink, EB Garamond for the argument, Lato Bold for labels, one terracotta spark.

Logos are trademarks and are not in the repository. A style's `logos/README.md` says which files to put in its folder; if they are not there, the logo slot stays empty and nothing else changes.

## What to tell the user when you finish

The file's path. The audit counts (FAIL and WARN), and each WARN you left with its reason. What you could not verify. Anything you assumed about the audience, the room or the data. Do not say a deck is ready if the audit has not run.
