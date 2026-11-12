# brutalist-slides: notes for Claude

This folder is a set of skills and a small engine for HTML slide decks. When someone here asks for slides, a deck, a talk, a lecture, a review of a deck or a new style, read `SKILL.md` and follow it. It routes to `skills/make-deck`, `skills/animate`, `skills/review-deck` and `skills/make-style`.

What matters most:

1. **Headlines first.** Settle what the deck is for, then write the ghost deck (the headlines alone) and get the person's agreement before building slides.
2. **Measure, then look.** No deck is handed over before `./bs check`, `./bs audit` and `./bs shots` have run and you have looked at every screenshot. If Playwright is missing, open the deck with `?audit` in a browser.
3. **Tokens, not colours.** Never write a hex value in a slide or a build.
4. **Nothing invented.** No made-up numbers, quotes, citations, screenshots or logos. Illustrative data is labelled on the slide.
5. **Say how strong the evidence is.** Each rule has a tier in `docs/evidence.md`. Do not present a derived heuristic as a law, and do not repeat folklore.

Words to understand:

- `help`: run `./bs help` and say what to do next.
- `ghost`: show the headlines of the deck in hand, in order.
- `audit`: run the checks on the deck in hand and report FAIL and WARN.
- `restyle <style>`: move the deck in hand to another style and run the checks again.

When working on this repository itself (the engine, the styles, the skills):

- A deck embeds a copy of `engine/deck.css`, `engine/deck.js` and its style. After changing those, `./bs sync` the example decks and run `python3 -m unittest discover tests`.
- The engine holds no brand colour and no typeface. Those belong in `styles/<id>/style.css`.
- A new audit rule needs a slide in `tests/fixtures/flawed-slides.html` that breaks it, a test, and a line in the README's list of what is measured.
- Logos never go into git (`.gitignore` covers `styles/*/logos/*`).
- Decks are written to wherever the person asks, not into this folder, unless they are examples.
