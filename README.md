# brutalist-slides

Skills that tell Claude, Codex or any coding agent how to make slide decks that hold up to the evidence, and a small engine that measures the result.

You download this folder, open it in your agent, and say what the talk is. The agent writes one HTML file: a deck on a 1920 x 1080 canvas, in the Northeastern, SEIS or Brutalist style or one you make. Every content slide is a sentence that makes a claim, with the evidence for it underneath. Type size, contrast, overflow and headline length are measured in a real browser, not judged by eye.

## Why

Slide advice is abundant and mostly unearned. Three things the research says, from [docs/evidence.md](docs/evidence.md):

- Slides themselves are roughly neutral for learning. How they are used is what matters.
- People are bad at seeing what is wrong with a slide, and often cannot say why when they do. Good design has to be made explicit.
- The evidence is narrower than slide-design books imply, and several popular rules (6 x 6, the ten-minute attention span, the learning pyramid) have none.

So the rules here are sorted by how much weight they can bear, each one says which tier it stands on, and the ones that can be measured are.

## Get started

```bash
git clone https://github.com/nikbearbrown/brutalist-slides
cd brutalist-slides
./bs help
```

Then open the folder in Claude Code (or another agent) and ask for a deck:

> Make a 20-minute lecture deck on base rates for first-year graduate students. Projected, Northeastern style. Here is the chapter: ...

The agent reads [SKILL.md](SKILL.md) and works in this order: what the deck is for, then the headlines alone (the "ghost deck") for you to agree, then the slides and speaker notes, then the checks. To use the skill from any project: `./bs install`.

By hand, the same steps:

```bash
./bs new talk.html --title "Base rates" --style northeastern
./bs ghost talk.html      # the headlines alone: do they carry the argument?
./bs check talk.html      # reads the file
./bs audit talk.html      # draws it and measures every slide
./bs shots talk.html      # a PNG of every slide, to look at
```

Open `talk.html` in a browser. Arrows or space to move, N for speaker notes, G for all slides, F for fullscreen.

Needs Python 3.9 or newer, standard library only. `audit`, `shots` and `pdf` use Playwright if it is installed; without it, open the deck with `?audit` on the end of the address and the same audit runs in the page.

## What is in the folder

| Path | What |
|---|---|
| [SKILL.md](SKILL.md) | The entry skill: the twelve rules, the loop, the commands |
| [skills/make-deck](skills/make-deck/SKILL.md) | Purpose, ghost deck, slides, checks, hand-over |
| [skills/animate](skills/animate/SKILL.md) | Charts, diagrams, staged builds; motion that teaches |
| [skills/review-deck](skills/review-deck/SKILL.md) | Review any deck against the rubric, weighted by evidence tier |
| [skills/make-style](skills/make-style/SKILL.md) | Your own colours, type and logo |
| [docs/evidence.md](docs/evidence.md) | The evidence base, with tiers, the folklore audit and the review rubric |
| [docs/deck-format.md](docs/deck-format.md) | The HTML format: layouts, classes, tokens, steps, builds |
| [docs/prior-art.md](docs/prior-art.md) | What other agents' slide skills say, what was borrowed (with credit) and what was not |
| `engine/` | The controller every deck carries: scaling, navigation, steps, notes, print, the audit |
| `styles/` | `northeastern` (default), `seis`, `brutalist`, and `_template` |
| `examples/` | A sample deck in each style |
| `fonts/`, `vendor/` | Open-licensed fonts and D3, for decks that must work offline |

## Styles

| id | Look |
|---|---|
| `northeastern` (default) | White slides, one red rule, black title and statement slides, red section dividers, Lato |
| `seis` | Northeastern's brand worn by Software Engineering and Information Systems: white title slides with the unit's lockup |
| `brutalist` | Cream page, warm ink, EB Garamond for the argument, Lato Bold for labels, one terracotta spark |

`./bs styles northeastern` prints a style in full, with its contrast table and rules. `./bs restyle talk.html brutalist` moves a deck to another style without touching its slides. `./bs new-style mine` starts your own.

Logos are not in the repository. They are trademarks of their owners; each style's `logos/README.md` says which files to put there. Without them the logo slot on the title slide stays empty and nothing else changes.

## What the audit measures, and what it cannot

Measured on every slide in its final state: text under 40 px (body) or 32 px (labels) as drawn, including inside scaled charts; contrast under 4.5:1 against what is actually behind the text; text that runs off the slide or is cut off; headlines over two lines or under five words; lists over four items; all-caps running text; sentences that are both on the slide and in the notes; legends; logos on content slides; missing notes.

Not measured, and left to a reader: whether the evidence supports the claim, whether meaning rests on colour alone, whether a term keeps one name, and whether an animation teaches anything a still frame would not.

## Other formats

HTML is the source. `./bs pdf talk.html` writes one page per slide. Converters to Google Slides and PowerPoint are planned as separate tools; the format in [docs/deck-format.md](docs/deck-format.md) is written so they can read it.

## Credits

The evidence base draws on Mayer's multimedia-learning research, Kosslyn's cognitive communication principles, and Alley and Garner's assertion-evidence work; full references are in [docs/evidence.md](docs/evidence.md). Ideas borrowed from other open-licensed agent skills are credited one by one in [docs/prior-art.md](docs/prior-art.md). Fonts: Lato, EB Garamond and JetBrains Mono, each under the SIL Open Font License (see `fonts/`). D3 is under the ISC licence (see `vendor/`).
