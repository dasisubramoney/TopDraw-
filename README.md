# Top Draw

Marketing site for Top Draw, bespoke cabinetry and interiors in Johannesburg.
Vite + React 18, Tailwind CSS 4, GSAP ScrollTrigger, Lenis, Framer Motion (AnimatePresence only).

- `PRODUCT.md`: brief, audiences, voice, content rules
- `DESIGN.md`: the "Shop Drawing" system: tokens, type, grid, motion

## Run

```bash
npm install          # add --legacy-peer-deps if peer conflicts appear
npm run dev          # http://localhost:5173
npm run build        # client build, SSR build, then prerenders dist/index.html
npm run preview
```

## Deploy (Netlify)

`netlify.toml` sets the build command and publish folder (`dist`). The consultation form uses
Netlify Forms (the hidden `consultation` form in `index.html` lets Netlify detect it at build time).
Turn on form notifications in the Netlify dashboard so submissions reach Trevor by email.

Set `VITE_SITE_URL` in `.env` (or Netlify environment variables) to the live domain before launch.
It feeds the canonical URL, Open Graph tags and LocalBusiness schema.

## Content still needed before launch

All copy and contact details are in `src/content.js`. Search the project for `[` to find placeholders.

- `[PHONE]`, `[EMAIL]`, `[WHATSAPP NUMBER]` (international format, digits only, e.g. 27821234567)
- `[AREA]` service area, `[HOURS]`, `[SITE VISIT: FREE OR FEE]`
- `[INSTAGRAM URL]`, `[FACEBOOK URL]`
- `[SUBURB]` for each project caption
- Trevor's portrait (Trevor section)
- Schema placeholders in `index.html` (`telephone`, `email`, `areaServed`)
- Values marked `CONFIRM` in `src/content.js`: the 900 mm worktop height and "Stone top" note on the hero photo

## Images

Project photos come from Trevor's shared album. They are resized to WebP at 800 and 1600 px wide
and stored in `public/images`. To add a project, export the same two widths and add an entry to
`img` in `src/content.js`.

## Project log

**Prepared for:** Dasendhran Subramoney
**Date:** 6 October 2026

### Summary of work

**Planning**
- Wrote `PRODUCT.md` (brief, audiences, voice, content rules, above-the-fold contract) and `DESIGN.md` (the "Shop Drawing" system: palette, type, spacing, grid, components, motion rules, anti-slop checklist).
- Published a visual direction board for approval. Type Option A (Newsreader, Schibsted Grotesk, IBM Plex Mono) was chosen.
- Checked the palette's contrast. Ink text on the steel blue fails at 2.90:1, so buttons use white text at 19px bold (4.24:1, which passes as large text).

**Photography**
- Reviewed all 87 photos in Trevor's shared album and selected the 13 strongest.
- Trimmed letterboxing and phone watermarks, exported responsive WebP at 800 and 1600 px, and made a 1200×630 Open Graph image.

**Build** (Vite, React 18, Tailwind CSS 4, GSAP ScrollTrigger, Lenis, Framer Motion)
- Single page with anchored navigation: hero, Services (01 to 05), Process, Trevor ("From steel to timber"), Selected work, For designers and architects, Contact, and a title-block footer.
- Hero meets the above-the-fold contract (what, who, why, both CTAs) at 375×667, 375×812, 768×1024 and 1440×900.
- Drawing-sheet system: hairline rules instead of cards, sheet numbers (A-01 to A-07), dimension lines and leader notes on photographs, blueprint grid on the Process section only.
- Services list is keyboard operable (arrow keys, Home, End), opens on hover, click or tap, and shows a photo per row.
- Process line scrubs with scroll; gallery images reveal with a clip wipe; motion limited to the inventory in `DESIGN.md`.
- Consultation form with South African phone validation, inline errors, focus management, success and failure states, and Netlify Forms with a honeypot.
- LocalBusiness schema, meta and Open Graph tags, skip link, visible focus states, reduced-motion support (Lenis and scroll animations off).

**Review and fixes**
- Screenshots at 375, 768 and 1440 px; fixed the mobile fold, an off-image annotation, a gallery image that failed to reveal, and caption wrapping.
- Functional test suite (30 checks): navigation, mobile menu, form validation, WhatsApp links, keyboard and touch on the services list, reduced motion. All pass.
- Fixed a hover bug where a resting mouse cursor reopened the wrong service row after a tap.
- `impeccable detect`: 27 findings reduced to zero (uppercase captions, button contrast, 11px text, tight heading leading, button padding, heading rhythm).
- Design critique and technical audit: rewrote generic headings, deferred mobile service images until opened, enlarged footer tap targets, added a site-visit row and an email line for drawings, replaced a hard-coded colour with a token.
- Performance: prerendered HTML at build time, loaded GSAP and Lenis after hydration, used LazyMotion for Framer Motion, and subset the fonts from 356 KB to 112 KB. Lighthouse mobile performance went from 60 to 86–93; desktop 100; accessibility 100; SEO 100.

**Not done**
- No Figma reference was supplied, so no comparison was made.
- The impeccable and motion skills were not installed in the editor, so their critique, audit and polish steps were followed by hand.
- The site is not yet deployed. See "Content still needed before launch" above.
