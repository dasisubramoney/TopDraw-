# DESIGN.md — "The Shop Drawing"

Status: **Approved. Type Option A (Editorial). Built in `src/`.**
Dials: DESIGN_VARIANCE 7 · MOTION_INTENSITY 4 · VISUAL_DENSITY 3.

The site reads like a well-kept shop drawing: a white sheet, hairline rules that structure everything, dimensioned photography, a title block, drawing numbers for wayfinding. Warmth comes only from timber and stone in the photographs.

---

## 1. Colour (closed palette, nothing else)

| Token | Hex | Role |
|---|---|---|
| `paper` | `#FFFFFF` | Main background |
| `mist` | `#E9EEF3` | Secondary surface, alternating sections, image placeholders |
| `rule` | `#B7C6D6` | Hairlines, borders, dimension lines, muted UI. **Never text on light.** |
| `steel` | `#4A7FB0` | CTAs, active states, dimension arrowheads, focus. Sparingly: max one steel object per viewport besides focus rings. |
| `ink` | `#2B3642` | All text, headings, dark contact/footer surface |

No tints, no opacity variants of colours used as new colours, no gradients, no shadows.
Exception: `ink` at reduced opacity is not allowed for text either; secondary text is still `ink`, distinguished by size and the mono face.

### Measured contrast (WCAG 2.x)
| Pair | Ratio | Rule |
|---|---|---|
| ink / paper | 12.29 | All text |
| ink / mist | 10.53 | All text |
| rule / ink | 7.06 | Secondary text and rules on the dark section |
| paper / steel | **4.24** | Button text only at ≥19px **bold (700)**: WCAG large text is ≥18.67px bold, so 18px semibold does not qualify |
| steel / paper | 4.24 | Steel text only at ≥18px bold or ≥24px regular |
| steel / mist | 3.63 | Large text / non-text UI only |
| **ink / steel** | **2.90** | **Fails. Never put ink text on a steel button** (the brief suggested this as a fallback; it does not pass) |
| steel / ink | 2.90 | Steel is non-text only on the dark section (e.g. the button fill, with paper text 18px bold) |
| rule / paper | 1.74 | Decorative/structural only. Form field borders use `ink` at 1px to meet 3:1 for UI components |

Dimension-line labels are set in `ink` mono. Steel is used for the line and arrowheads only.

## 2. Typography

Two options. Both pair a display serif, a grotesk, and a mono for annotations.

**Option A — "Editorial" (chosen)**
- Display: **Newsreader** (opsz axis, 300–500). Calm, bookish, high-end without fashion-magazine theatrics. Large sizes use opsz 72 for finer contrast.
- Body: **Schibsted Grotesk** 400/500. Firm, slightly engineered, good at 15–17px.
- Annotation: **IBM Plex Mono** 400/500. The drawing's own voice.

**Option B — "Engineered"**
- Display: **Bodoni Moda** (opsz, 400–500). Hairline serifs echo the 1px rule system; sharper, colder, more luxury-coded.
- Body: **Hanken Grotesk** 400/500.
- Annotation: **IBM Plex Mono** 400/500.

### Scale (fluid, clamp between 375 and 1440)
| Token | Size | Face | Use |
|---|---|---|---|
| `display-xl` | clamp(2.25rem, 1.4rem + 3.6vw, 4.75rem) / 1.02, -0.02em | Display 400 | h1 only |
| `display-l` | clamp(1.875rem, 1.3rem + 2.4vw, 3.5rem) / 1.05 | Display 400 | Section h2 |
| `display-m` | clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem) / 1.32 | Display 400 | Service row titles, h3 |
| `body-l` | clamp(1.0625rem, 1rem + 0.3vw, 1.25rem) / 1.5 | Body 400 | Lead paragraphs |
| `body` | 1rem / 1.6 | Body 400 | Running text, max 62ch |
| `ui` | 1.1875rem / 1.2 | Body 700 | Buttons (19px bold = large text) |
| `label` | 0.75rem / 1.4, +0.08em, uppercase | Mono 500 | Section markers, eyebrows. Short strings only (under ~25 characters) |
| `anno` | 0.75rem / 1.45, +0.01em, sentence case | Mono 400 | Dimension labels, captions, notes (`tabular-nums`). Never uppercase: long uppercase runs hurt reading |

Headings: `text-wrap: balance`. Body: `text-wrap: pretty`. No italics (the italic face was cut to save 147 KB).

Fonts are self-hosted from `public/fonts`, Latin-subset with fonttools: Newsreader pinned to weight 400 with the `opsz` axis kept (50 KB), Schibsted Grotesk variable weight (38 KB), IBM Plex Mono 400/500 (12 KB each). Only Newsreader is preloaded.

## 3. Spacing (4px base)
`1`=4 · `2`=8 · `3`=12 · `4`=16 · `6`=24 · `8`=32 · `12`=48 · `16`=64 · `24`=96 · `36`=144
- Section padding-block: 96 (mobile) → 144 (desktop).
- Rule-to-content gap: 16 mobile, 24 desktop. Text never touches a rule.
- Visual density 3: one idea per viewport row; whitespace is the default, content the exception.

## 4. Grid
- 12 columns, max content width 1360px, outer margin `clamp(20px, 5vw, 80px)`, gutter 24 (mobile 16).
- Asymmetric by default: text rarely spans more than 5 columns; images take 7–8 and break to the margin on one side.
- Every section opens with a **section header row**: a full-width 1px `rule`, below it the drawing number left (`A-01`), title, and a right-aligned mono note (scale or sheet info).
- Columns on desktop are optionally marked by a single vertical hairline at the 5/12 split, not a visible full column grid.
- Mobile: single column, rules remain full-bleed within margins, images go edge to edge.

## 5. The drawing system (components)
- **Hairline**: `1px solid rule`. Divides lists, frames images, aligns content. Replaces cards entirely. No border-radius anywhere (`border-radius: 0` globally).
- **Section marker**: `A-01 / Services` in `label` mono, ink.
- **Dimension line**: HTML/CSS, 1px line with 8px clip-path arrowheads and extension ticks, label in `anno` mono ink on a paper knockout. Steel off-photo; **paper (white) when drawn over a photograph** so it reads against dark cabinetry. Positions are percentages of an uncropped photo. Used on the hero only; leader notes on the hero, Trevor figure and one gallery image.
- **Leader note**: short angled line from a point on an image to a mono note (`Oak veneer / 18 mm`). Max 1 per image.
- **Title block**: footer echoes a drawing's title block: a ruled table with Drawn by / Project / Sheet / Contact cells.
- **Buttons**: rectangular, no radius. Primary: steel fill, paper text 18px semibold, 1px steel border. Secondary: paper fill, ink 1px border, ink text. WhatsApp is secondary, with a small mono `↗` not a logo blob.
- **Blueprint grid**: allowed on the **Process** section only, 24px `rule` grid at very low visual weight (lines drawn in mist on paper).
- **Images**: hard edges, 1px rule frame, mist while loading. Responsive WebP in `public/images` (800/1600 widths). The portrait placeholder is a mist field with a drawn X (the drawing convention for an opening still to be filled).

## 6. Motion (Krehel primary, Kowalski secondary)
Quiet, precise, purposeful. Motion explains structure; it never decorates.

**Curves and durations**
- `ease-out-quint`: `cubic-bezier(0.22, 1, 0.36, 1)` for entrances.
- `ease-in-out`: `cubic-bezier(0.65, 0, 0.35, 1)` for on-screen movement (row expand, line draw).
- UI feedback (hover, press, focus): 150–200 ms. Reveals: 500–700 ms. Nothing over 900 ms except scroll-scrubbed lines.
- No bounce, no overshoot springs, no stagger above 60 ms, no more than 4 staggered items.

**Allowed moments (the whole inventory)**
1. **Hero load**: dimension lines draw (stroke-dashoffset) once, 700 ms, after the image is visible; labels fade in 200 ms after. Headline renders at rest (no animated text).
2. **Rules draw**: section header rule scales X from 0→1 from the left, 600 ms, once, when it enters. This is the only scroll-triggered reveal on text sections.
3. **Service rows**: real mouse movement, click, tap or arrow keys open a row (CSS grid-rows 260 ms; text opacity + 8px Y, 220 ms). Desktop image crossfades 180 ms in a sticky right column (AnimatePresence). `pointerenter` is deliberately not used: it fires when rows shift under a resting cursor and steals a tapped row.
4. **Process line**: single continuous SVG path scrubbed to scroll (GSAP ScrollTrigger, scrub 0.6). Stage nodes switch from rule to steel as the line passes them.
5. **Gallery images**: clip-path inset reveal from the top edge, 700 ms, once. No parallax beyond 6% translate on the hero image only.
6. **Press**: buttons `scale(0.98)` on active, 120 ms. No hover-scale on images or cards.

**Banned**: fade-up on every element, blur transitions, magnetic buttons, cursor followers, marquee, pulsing dots, scroll-jacking, auto-playing carousels.

**Reduced motion**: `prefers-reduced-motion: reduce` disables Lenis, all ScrollTrigger instances and clip reveals; dimension and process lines render fully drawn; transitions become instant but every state change still happens.

**Loading**: the page is prerendered to static HTML at build time (`scripts/prerender.mjs`) and hydrated. GSAP, ScrollTrigger and Lenis load as a separate chunk after hydration (`loadMotion()` in `src/lib/motion.js`), so the page is complete and readable before any motion code arrives. Framer Motion loads through `LazyMotion` with `domAnimation`.

## 7. Accessibility
- Focus: 2px `steel` outline, 3px offset, on light; 2px `paper` outline on the dark section. Never removed.
- Service list: `<ul>` of `<button aria-expanded aria-controls>` rows; arrow keys move between rows, Enter/Space toggles.
- One `h1`. Section `h2`s, row `h3`s.
- Tap targets ≥ 44px.

## 8. Anti-slop checklist (the build must pass)
- [ ] No gradient, glow, shadow, blur, glass
- [ ] No rounded corners, no pills, no badges
- [ ] No identical card grids, no icon-in-square
- [ ] No centred hero; hero is asymmetric (text 5 cols, image 7)
- [ ] Animations limited to the inventory in §6
- [ ] No em dashes or stock phrases in copy
- [ ] Every number on the page is either real or a marked placeholder
- [ ] Steel used for ≤1 object per viewport (plus focus)
