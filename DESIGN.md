# DESIGN.md — "The Shop Drawing"

Status: **Approved. Type Option A (Editorial). Built in `src/`.**
Dials: DESIGN_VARIANCE 7 · MOTION_INTENSITY 4 · VISUAL_DENSITY 3.

The site reads like a well-kept shop drawing: a white sheet, hairline rules that structure everything, dimensioned photography, a title block, drawing numbers for wayfinding. Colour comes from the logo: blue, black and beige, with warmth from timber and stone in the photographs.

---

## 1. Colour (closed palette, nothing else)

Taken from the Top Draw logo (blue #31378F measured from the original logo file; black #222222 and beige #B2A696 from the supplied logo image, within a few units of the original).

| Token | Hex | Role |
|---|---|---|
| `paper` | `#FFFFFF` | Main background |
| `mist` | `#F5F2ED` | Secondary surface, alternating sections, image placeholders. A light tint of the logo beige |
| `rule` | `#D2C9BC` | Hairlines, borders, dimension lines, muted UI. Also secondary text on the dark section. **Never text on light.** |
| `steel` | `#31378F` | The logo's blue, measured from the original logo file (was #4A7FB0 until 13 October 2026). CTAs, active states, dimension arrowheads, focus. Sparingly: max one steel object per viewport besides focus rings. |
| `ink` | `#222222` | Logo black. All text, headings, dark contact/footer surface |
| `beige` | `#B2A696` | Logo beige. Reserved for accents on the dark sections; currently unused. Never text on light |

No tints, no opacity variants of colours used as new colours, no gradients, no shadows (one exception: the A-04 gallery photos, see section 6).
Exception: `ink` at reduced opacity is not allowed for text either; secondary text is still `ink`, distinguished by size and the mono face.

### Measured contrast (WCAG 2.x)
| Pair | Ratio | Rule |
|---|---|---|
| ink / paper | 15.91 | All text |
| ink / mist | 14.25 | All text |
| rule / ink | 9.71 | Secondary text and rules on the dark section |
| paper / steel | 10.13 | Button text at any size |
| steel / paper | 10.13 | Steel text at any size |
| steel / mist | 9.07 | Steel text and UI on mist |
| **ink / steel** | **1.57** | **Fails. Never put ink text on a steel button, or steel text on ink** |
| steel / ink | 1.57 | Never on the dark section: the primary button there is paper with ink text |
| beige / ink | 6.66 | Beige text or borders on the dark section |
| beige / paper | 2.39 | **Fails for text.** Never use beige on light backgrounds |
| rule / paper | 1.64 | Decorative/structural only. Form field borders use `ink` at 1px to meet 3:1 for UI components |

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
| `display-m` | clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem) / 1.32 | Display 400 | Service titles, h3 |
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
- **Leader note**: used on the Trevor figure and one gallery image.
- **Leader note**: short angled line from a point on an image to a mono note (`Oak veneer / 18 mm`). Max 1 per image.
- **Title block**: footer echoes a drawing's title block: a ruled table with Drawn by / Project / Sheet / Contact cells.
- **Buttons**: rectangular, no radius. Primary: steel fill, paper text 19px bold, 1px steel border (paper fill with ink text on the dark section, where blue would be only 1.57:1). Secondary: paper fill, ink 1px border, ink text. WhatsApp is secondary, with a small mono `↗` not a logo blob.
- **Blueprint grid**: allowed on the **Process** section only, 24px `rule` grid at very low visual weight (lines drawn in mist on paper).
- **Images**: hard edges, 1px rule frame, mist while loading. Responsive WebP in `public/images` (800/1600 widths). No photos of Trevor (his wish); the Trevor section uses the steel-frame bench photo.

## 6. Motion (Krehel primary, Kowalski secondary)
Quiet, precise, purposeful. Motion explains structure; it never decorates.

**Curves and durations**
- `ease-out-quint`: `cubic-bezier(0.22, 1, 0.36, 1)` for entrances.
- `ease-in-out`: `cubic-bezier(0.65, 0, 0.35, 1)` for on-screen movement (line draw).
- UI feedback (hover, press, focus): 150–200 ms. Reveals: 500–700 ms. Nothing over 900 ms except scroll-scrubbed lines.
- No bounce, no overshoot springs, no stagger above 60 ms, no more than 4 staggered items.

**Allowed moments (the whole inventory)**
1. **Hero intro** (every page load, refreshes included): a 6.7 s video builds a kitchen, removes it and holds on the empty room, which stays as the hero background. Nav and logo are visible throughout; the header CTA and the copy wait. Two captions are timed to the video's own clock (paper panel, steel left edge, wipe in from the left and out to the right): "Bespoke design" while the kitchen is complete (2.9 to 5.0 s, with a 1.5 s reading pause at 4.3 s) and "White boxing" once the room is empty (from 6.2 s). The video ends on the empty room and holds for 3 s with the white-boxing caption; the finished kitchen (the 4.3 s frame, captured from the video as it plays) then fades back in over 0.9 s and stays as the permanent hero background; then a ~1.2 s GSAP timeline (power3.out): flat paper overlay to 55% behind the copy, headline reveals line by line behind a mask (SplitText), then the what/who/why line, then both CTAs. "Skip intro", a scroll, a touch or a nav click jumps to the last frame and runs the same reveal. Scroll is locked until the reveal.
   - Reduced motion: no playback; last frame and copy shown at once.
   - Autoplay blocked, a video error, or nothing played after 2.5 s: last frame and reveal. If the video can't load, the #F5F2ED hero ground stays and the copy shows.
   - The mode is set on `<html data-intro>` by an inline script before first paint, and a parse-time fallback beside the `<video>` shows the copy without waiting for JavaScript on slow connections.
2. **Rules draw**: section header rule scales X from 0→1 from the left, 600 ms, once, when it enters. This is the only scroll-triggered reveal on text sections.
3. **Services, sticky scroll reveal** (adapted from 21st.dev): on desktop (≥1024 px) the five services scroll past in the left column while one photo stays pinned in the right column. The service crossing the middle of the viewport is active: its title turns steel, the others drop to 35% opacity (300 ms), and the photo crossfades 180 ms (AnimatePresence). Tracked with an IntersectionObserver, no nested scroll box. Under 1024 px every service is a plain stack with its own photo. Reduced motion: no dimming and an instant photo swap. Inactive services at 35% opacity are below AA contrast while inactive, the same trade-off as the Trevor chapters.
4. **Process line**: single continuous SVG path scrubbed to scroll (GSAP ScrollTrigger, scrub 0.6). Stage nodes switch from rule to steel as the line passes them.
5. **Gallery images**: clip-path inset reveal from the top edge, 700 ms, once. No parallax beyond 6% translate on the hero image only.
6. **Press**: buttons `scale(0.98)` on active, 120 ms. No hover-scale on images or cards.

7. **A-03 Trevor, "Section drawing"** (desktop, motion allowed): the stage pins for 250vh and a scrubbed timeline (scrub 0.6) moves one cross-section through three stages: stainless box section (45° hatch), balustrade (wider hatch), timber door edge (diagonals bend into grain with MorphSVG, one knot). Outlines undraw in 0.6 s and draw in over 0.8 s (power2.inOut), the next starting 0.2 s before the last has gone; hatch sweeps left to right; dimension lines grow from their centre, labels 0.1 s apart. The active chapter is ink and opens; the others fold to number and label at 35% opacity. A steel progress line fills down the chapter list. The sequence ends on chapter 04 (Today): the timber section holds and the drawing's title block completes the sheet (rule draws, notes fade, "The material changed. The standard didn't." rises word by word behind a mask). Pin length 300vh.
   - Under 1024px: no pinning; each chapter's drawing (and chapter 04's title block) draws in once at 40% in view.
8. **A-04 Work, glyph portal intro** (adapted from the MIT-licensed Glyph Portal by Christian Katzmann, 21st.dev; `src/components/GlyphPortal.jsx`): a scroll-driven camera through the word PROJECTS (with "Top Draw" in small type above it, echoing the logo lockup), set in Schibsted Grotesk 800. The letters are windows onto a project photo under a flat steel overlay; scrolling zooms through the largest letter counter it finds until the blue field fills the screen, then the content scrolls over it: an infinite drag gallery of all twelve project photos (the captioned project list is not shown here; it stays for the plain version below, and screen readers get a text-only summary inside the portal). Pinned for 1.5 viewport heights, driven by its own rAF loop (no GSAP or Framer Motion). Desktop visitors can hover or arrow-key a letter first; touch visitors get a letter dropdown. It mounts only once the section is within a screen of the viewport and Schibsted Grotesk 800 has loaded (1.5 s limit); until then, with reduced motion, or without JavaScript, the section is the plain list on mist, and that plain list is what the prerendered HTML contains.
   - **Infinite drag gallery** (adapted from the 21st.dev `infinite-drag-scroll` component, masonry variant; `src/components/InfiniteGallery.jsx`): a 2 x 2 block of identical photo tiles in a draggable layer, wrapped on both axes so it repeats forever. It stays pinned for about 220svh of scrolling after the zoom; scrolling the page moves the grid (the page keeps its own scroll, there is no scroll trap), and mouse users can also drag in any direction with momentum. Touch users drag sideways only so a vertical swipe still scrolls the page. The photos sit on a flat steel backdrop with a soft black drop shadow so they lift off it (the one place the site uses a shadow, at the client's request),  and scale in with a short stagger once the zoom has finished (replayed if you scroll back out). The grid only moves with the page once the gallery is pinned. At the two moments it is at rest (when it opens and when it hands over to the next section) the grid is eased to an aligned resting position where every photo on screen is whole, with blue margin above and below and nothing under the header. Photo sizes come from the screen height as well as the width (`.gallery` in `src/index.css`) and the row gap grows to match, so such a position exists on any window; the columns are spaced so one tile is exactly a screen wide. The panel then scrolls away with blue (no photo) along its bottom edge. It is decorative (aria-hidden); a screen-reader-only heading and caption list sits beside it inside the portal. Sized in vw so a tile is always at least a screen wide and tall.
   - Reduced motion or no JavaScript: no pinning or drawing animation; every chapter shows its finished drawing. The prerendered markup is always the finished state.
   - Drawings: `src/components/SectionDrawings.jsx`, stroke-only, 1.5px ink outlines, rule dimension lines with the primary dimension in steel, mono labels with a paper halo.

**Banned**: fade-up on every element, blur transitions, magnetic buttons, cursor followers, marquee, pulsing dots, scroll-jacking, auto-playing carousels.

**Reduced motion**: `prefers-reduced-motion: reduce` disables Lenis, all ScrollTrigger instances and clip reveals; the process line renders fully drawn; transitions become instant but every state change still happens.

**Loading**: the page is prerendered to static HTML at build time (`scripts/prerender.mjs`) and hydrated. GSAP, ScrollTrigger and Lenis load as a separate chunk after hydration (`loadMotion()` in `src/lib/motion.js`), so the page is complete and readable before any motion code arrives. Framer Motion loads through `LazyMotion` with `domAnimation`.

## 7. Accessibility
- Focus: 2px `steel` outline, 3px offset, on light; 2px `paper` outline on the dark section. Never removed.
- Service list: a plain `<ul>` of services; all text is always in the page and readable. The pinned photo is decorative (`aria-hidden`) because each service has its own photo in the markup under 1024 px.
- One `h1`. Section `h2`s, row `h3`s.
- Tap targets ≥ 44px.

## 8. Anti-slop checklist (the build must pass)
- [ ] No gradient, glow, shadow, blur, glass
- [ ] No rounded corners, no pills, no badges
- [ ] No identical card grids, no icon-in-square
- [ ] No centred hero; copy sits in the left half (bottom on mobile), the room fills the rest
- [ ] Animations limited to the inventory in §6
- [ ] No em dashes or stock phrases in copy
- [ ] Every number on the page is either real or a marked placeholder
- [ ] Steel used for ≤1 object per viewport (plus focus)

## Hero (revised 13 October 2026)
After the intro, the hero carries a single title block, bottom left, framed in 1px ink on paper: the Top Draw Projects logo, a mono descriptor line, then the two buttons, each in its own cell divided by ink rules. The rest of the frame is the finished kitchen. The block wipes in from the left, then the logo, then the descriptor and buttons. The nav brand stays hidden until the hero has scrolled away, so the logo never appears twice on one screen.
