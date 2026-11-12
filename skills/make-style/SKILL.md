---
name: make-style
description: Creates a new visual style for brutalist-slides decks from a brand's colours, typefaces and logo. Use when the user wants their own style, a company, lab, university or course look, or asks to change a style's colours or type. A style is a small folder of tokens that must pass the contrast and size floors before any deck uses it.
---

# Make a style

A style sets colour, type and a signature. It does not set layout, and it cannot lower the legibility floors. A deck can be moved between styles with `./bs restyle`, so a style only ever defines tokens and a few lines of signature CSS.

Look at the three that ship: `../../styles/northeastern/` (the default, a strict institutional brand), `../../styles/seis/` (a unit inside that brand: same tokens, its own title slide), `../../styles/brutalist/` (a serif editorial look with a text-safe accent and a paler decorative one).

## 1. Collect the brand, from its source

Ask for, or read from the brand's own guide or website:

| Need | Notes |
|---|---|
| Ground and ink | The page colour and the main text colour |
| One accent | The single "look here" colour. A brand with five colours still gets one accent; the others can be data colours |
| A secondary text colour | For captions and sources |
| Typefaces | Heading, body, label, mono. Must be free to embed (for example SIL OFL fonts) or the user must hold the licence. If the brand face is licensed, use the stand-in the brand itself names and say so |
| Logo files | Official files only, never redrawn. A version for light grounds and one for dark, vector if possible |
| Brand rules | Anything the brand forbids or requires: colour meanings, gradients, logo clear space |

Never guess a brand's hex values, and never copy them from memory. Read them from the source, and record the source and the date in `style.json`. If the user gives only one colour and a mood, propose the rest and show the contrast table before going on.

## 2. Start the folder

```
./bs new-style acme --name "Acme Lab"            # from the template
./bs new-style acme --from brutalist             # or from a style that is close
```

This makes `styles/acme/` with `style.css`, `style.json` and `logos/README.md`.

## 3. Set the tokens in `style.css`

Every token in the `:root` block must be set. The sets, and what each is for:

| Set | Tokens |
|---|---|
| Light slides | `--bs-ground` `--bs-surface` `--bs-ink` `--bs-ink-soft` `--bs-rule` `--bs-accent` `--bs-accent-deco` `--bs-accent-tint` |
| Dark slides | `--bs-dark-ground` `--bs-dark-surface` `--bs-dark-ink` `--bs-dark-ink-soft` `--bs-dark-rule` `--bs-dark-accent` `--bs-dark-accent-deco` |
| Section dividers | `--bs-accent-ground` `--bs-on-accent` |
| Data | `--bs-data-1` (the series the claim is about) to `--bs-data-5`; `--bs-seq-1` to `--bs-seq-5`, a lightness ramp from light to dark |
| Type | `--bs-font-head` `--bs-font-body` `--bs-font-label` `--bs-font-mono` `--bs-head-weight` |
| Sizes | `--bs-title-size` `--bs-section-size` `--bs-statement-size` `--bs-claim-size` `--bs-body-size` `--bs-label-size` |
| Eyebrow | `--bs-eyebrow-case` (`uppercase` or `none`), `--bs-eyebrow-tracking` |

The decisions that matter:

**Two accents, one meaning.** `--bs-accent` colours text and must reach 4.5:1 on the ground. `--bs-accent-deco` colours bars, rules and marks and may be the brighter brand colour. If the brand colour passes as text, both are the same value. If it does not (many oranges, yellows and light blues do not), keep the brand colour as the deco and choose a darker relative for text. Do the same for dark slides: Northeastern's red is 3.6:1 on black, so there the text accent is white and the red is decoration.

**Data colours are not a rainbow.** One accent series and neutrals for the rest keeps the accent meaning "look here". The sequential ramp varies lightness, not hue.

**Sizes.** Body 40 px or more, labels 32 px or more, on the 1080-high canvas. A face that sets small (most old-style serifs) needs larger numbers: the Brutalist style uses 46 and 72 where the sans styles use 40 and 64. Raise sizes for a small face; never go under the floors.

**Faces.** One or two families plus a mono. If two, give each a job (serif for the argument, sans for labels) and keep to it: mixing faces without a rule is a change that means nothing (Part 9).

**Tone balance.** Decide which slides are dark. A style may fix the title and closing slides to light or dark with a few lines of CSS, as `seis` and `brutalist` do.

## 4. The signature, kept small

Below the tokens, a style may add a little CSS that makes it recognisable: Northeastern's red rule across the top, Brutalist's small terracotta square on the title. Rules for it:

- Use the working tokens (`var(--deco)`, `var(--soft)`), not hex values, so it follows the slide's tone.
- Nothing on content slides that is not a thin rule or bar. No background images, textures, watermarks or corner logos: those are the first things coherence cuts (Part 3).
- Do not restyle layouts or shrink type.

## 5. Fill in `style.json`

- `about`: one sentence.
- `sources`: where every value was read, with the date.
- `fonts.google`: one Google Fonts stylesheet address with every face and weight used. `fonts.local`: the same faces as files in `../../fonts/`, for `./bs offline`. Put new font files there with their licence file.
- `logos`: paths under the style's `logos/` folder for `mark`, `mark-on-dark`, `lockup`, `lockup-on-dark`. Leave out any you do not have.
- `rules`: the brand's own rules, in plain sentences. Agents read these before building a deck in the style, so write what a designer new to the brand would get wrong.

Logos stay out of the repository (`.gitignore` covers `styles/*/logos/*`). Write `logos/README.md`: which files go there, where the official ones are downloaded, and who may use them.

## 6. Check it, then look at it

```
./bs styles acme          # the contrast table, the type, the rules, and what fails
./bs style-check acme     # exits non-zero if a floor is missed
./bs new /tmp/acme-test.html --style acme --title "Style test"
./bs audit /tmp/acme-test.html && ./bs shots /tmp/acme-test.html
```

Every pair in the contrast table must reach 4.5:1 except the deco rows, which are marks only. Then look at the seven starter slides in the new style. Check: the accent is the first thing the eye finds on the chart slide and it is the right thing; the dark and divider slides are readable; headlines of real length fit in two lines at the claim size; the logo sits on the title slide without being upscaled.

Show the user the screenshots before any real deck is built in the style.

## Brands with their own restrictions

A university, company or agency brand usually limits who may use its name and marks. A style with their colours does not grant that. Say so in the style's rules and in `logos/README.md`, and never invent or approximate a logo.
