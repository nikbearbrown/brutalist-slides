# AGENTS.md: brutalist-slides

For Codex and other coding agents. This folder is a set of skills and a small engine for HTML slide decks.

When asked for slides, a deck, a talk, a lecture, a deck review or a new style: read `SKILL.md` in this folder and follow it. It points to `skills/make-deck/SKILL.md`, `skills/animate/SKILL.md`, `skills/review-deck/SKILL.md` and `skills/make-style/SKILL.md`. The file format is `docs/deck-format.md` and the reasons are `docs/evidence.md`. `CLAUDE.md` lists the five things that matter most; they apply to every agent.

Commands: `./bs help`. Python 3.9 or newer, standard library only. `audit`, `shots` and `pdf` need Playwright; if it is not installed, open the deck in a browser with `?audit` on the address and read the panel, or read `window.bsAudit`.

Do not read or edit the engine blocks inside a deck file (`bs-engine`, `bs-style`, `bs-engine-js`, the fonts and D3 blocks). You write the slides, the `bs-deck` style block and the `bs-deck-js` script.
