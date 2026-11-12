# Prior art: what other slide skills say

**In short.** On 2026-11-12 we read the slide and presentation skills in a corpus of about 9,600 openly licensed agent skills collected from GitHub. 109 skill entries in 60 repositories are about making or reviewing decks; 51 of the 61 available skill files were read. About ten carry real, non-obvious rules. This page records what was taken from them, with credit, what was left, and why. Nothing was copied: the ideas below were rewritten and tested against `evidence.md`.

Each skill is cited by repository, path, licence and the commit that was read. Only the `SKILL.md` of each was available, so reference files and scripts those skills point to were not checked.

## What was taken

| Idea | Where it is used here | From |
|---|---|---|
| Write every headline first and read the list as a deliverable of its own | `skills/make-deck` step 2, `./bs ghost` | `make-a-deck`, manalkaff/opendesign, `skills/make-a-deck/SKILL.md`, MIT, cecd9bb. Also `decision/reviewer` (below) |
| The reorder test: if two slides can swap with no loss, one carries no weight | `skills/make-deck` step 2 | `design-deks-presentations`, eigen-cl/deks-plugin, `skills/design-deks-presentations/SKILL.md`, Apache-2.0, 5ed54ca |
| Motion rules: a quantity may count up but an identifier must not; two strings never cross-fade in one place; never animate re-layout; stagger by visual row | `skills/animate` | Same skill |
| Review rendered images, never the source, and every slide, not a sample | `skills/review-deck`, `./bs shots` | `decision/reviewer`, kostachernyshov/skills, `skills/decision/reviewer/SKILL.md`, MIT, c144175; `revealjs`, ryanbbrown/revealjs-skill, `skills/revealjs/SKILL.md`, MIT, d0ccd34 |
| The cold read: a fresh agent sees only the images and one line about the audience, and its stated main message is compared with the intended one | `skills/make-deck` step 4, `skills/review-deck` pass 5 | `decision/reviewer` (above) |
| One written line of verdict per slide; a slide with no line was not checked | `skills/make-deck` step 4, `skills/review-deck` | `slide-maker`, addsumtech/slides_maker, `skills/slide-maker/SKILL.md`, MIT, 53fa726 |
| When the checker passes and the pixels look wrong, the pixels win; the checker says what it did not check | The audit's closing note; `SKILL.md` | Same skill; `deks-presentations`, eigen-cl/deks-plugin |
| Prove the three hardest slides first | `skills/make-deck` step 3 | `slide-maker`, addsumtech/slides_maker |
| Never shrink text to fit: split the slide | `skills/make-deck` step 3 | `slide-design`, proyecto26/slides-ai-plugin, `skills/slide-design/SKILL.md`, MIT, 1f8505f; `deck`, octavehq/lfgtm, `skills/deck/SKILL.md`, MIT, b8214e5 |
| Empty space under a clear exhibit is correct composition; do not fill it | `skills/make-deck` step 3 | `make-a-deck` (above); `slide-maker`, addsumtech |
| Number hygiene: unit, sample size, date and source beside a number | `skills/make-deck` step 3 | `deck`, leewayworks/guochuang-gps, `skills/deck/SKILL.md`, MIT, 07892d1 |
| The deck adds no result the source does not have | `skills/make-deck` step 1 | `decision/designer`, kostachernyshov/skills, MIT, c144175 |
| Read the whole source before outlining | `skills/make-deck` step 1 | `md-to-scrolldeck`, dEitY719/visuals-skills, MIT, db9e303 |
| Distributions, not bars of means; bars start at zero | `skills/animate` | `slide-maker`, addsumtech |

Two things here were arrived at separately and also appear in the corpus, which is some comfort: a fixed 1920 x 1080 stage scaled as a whole (`make-a-deck`; `deck`, octavehq/lfgtm), and two tokens per accent, a bright one for fills and a darker one that is safe for text (`slide-maker`, addsumtech).

## What was left, and why

**Type-size floors.** The corpus disagrees with itself: body floors run from 12 pt to 48 px, and none cites a source. Part of it is a unit problem. On a 10 x 5.625 inch slide, 18 pt is 48 px at 1080 high; one skill instead converts at 1.333 px per point and gets half that. This repo states its convention: sizes are stage pixels on a 1080-high canvas, and Kosslyn's 20 pt on a 7.5 inch slide is 40 px (Part 8).

**Density caps.** Bullet caps of 3, 3 to 5 and 6; word budgets of 20, 40 and 90; "one idea per slide". All unsourced. This repo keeps Kosslyn's four items and two lines, marked as Tier C, and warns instead of failing.

**House numbers that sound like findings.** None has a source in the skills that state them, and none is used here: the 60-30-10 colour split; slides-per-minute tables ("30 minutes is 25 to 35 slides"); a "3-second slide rule" with "maximum 20 words"; "the most important element is three times the size"; "40 to 50% empty space per slide"; "8 to 15 slides for optimal pacing"; "exactly 12 slides" for a pitch; the rule of three.

**The classic folklore is absent.** A search of all 9,588 skill files found no 6 x 6 rule, no 10/20/30, no learning-pyramid percentages. The folklore that agent skills carry is the newer kind above.

**One style of title for the whole deck, noun phrases allowed** (`make-a-deck`). Left: Part 2 supports sentence claims on content slides.

**Green, red and yellow reserved for success, failure and attention.** Left as a default: it rests meaning on hue (Part 8), and Northeastern's rules forbid red meaning bad.

**Viewport-fitted decks** (`100dvh` with `clamp`). Left: type that scales with the window cannot hold a floor measured against slide height.

**Responsive inline editing, presenter windows synced across tabs, pacing clocks.** Useful, not built. Candidates for later.

## Common faults in the corpus

Worth knowing, because a new skill can make the same mistakes.

- **The substance is somewhere else.** Most skills point to reference files and scripts for their real rules. With only `SKILL.md` they cannot be followed. Here each skill file is complete, and the two shared documents are in `docs/`.
- **No look at the output.** Several build a deck and never render it. One 24-item checklist checks that code exists, not that slides look right.
- **Self-contradiction.** "Zero dependencies" with four CDN libraries; a body size under the floor the same plugin calls non-negotiable; a ban on a device the examples then use.
- **Invented statistics in the examples**, inside skills that demand sourced numbers.
- **Generic looks.** Gradient text, glass cards, glowing orbs and purple on black, sometimes in skills that ban them a few lines earlier.
- **Quiet side effects.** Some update themselves, install packages or run unpinned `npx` commands. This repo runs nothing from the network; the audit, screenshots and PDF use Playwright only if it is already installed.

## Converting to other formats

No skill in the corpus writes to Google Slides through its API. The routes that exist, for when converters are built here:

| Route | Used by |
|---|---|
| HTML to PDF with a headless browser, one slide per page | Several; done here by `./bs pdf` |
| HTML to PNG with a headless browser | Several; done here by `./bs shots` |
| HTML to PowerPoint with Playwright and PptxGenJS ("html2pptx") | `creating-presentations`, telagod/code-abyss; `slide-maker`, tuan3w/obsidian-vault-agent |
| Native PowerPoint with python-pptx or PptxGenJS | `slide-maker`, addsumtech; `pptx-slides`, proyecto26; `pptx-generator`, minimax-ai/skills |
| PowerPoint to images with LibreOffice then `pdftoppm` | `decision/reviewer` and others |

Notes kept from them: convert pixels to points at 0.75; rasterise gradients and icons before html2pptx; never paste a screenshot of a slide into a PowerPoint file and call it converted.

## Not read

Skills whose repositories carry no stated open licence were not downloaded: among them `learnprompt/humanize-ppt` and `seacen/deckify`, whose descriptions look relevant. Seven newer slide-related repositories on the audit server (after 2026-10-28) are known by description only; `beautifulai/claude-plugin` is the one most worth reading next. Anthropic's own pptx skill, which several corpus skills borrow from, was not used as a source.
