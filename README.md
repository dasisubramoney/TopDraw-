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

- `[INSTAGRAM URL]`, `[FACEBOOK URL]`
- `[SUBURB]` for each project caption
- Confirm the WhatsApp number: it is set to the same number as the phone (082 332 1112)

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

### Update: hero intro video (6 October 2026)

**Prepared for:** Dasendhran Subramoney

- Replaced the hero photograph with a full-viewport intro video (`public/video`): desktop WebM/MP4, square MP4 under 768 px. No poster or still images. The hero ground is #E9EEF3 so there is no black flash.
- The video plays on every page load (changed later the same day from once per session), then holds on its last frame (the empty room). A 1.2 s GSAP reveal follows: white overlay at 55%, headline revealed line by line, then the supporting line and both CTAs.
- "Skip intro", scroll, touch and nav clicks skip to the last frame. Scroll is locked during the intro.
- Fallbacks: reduced motion skips playback; autoplay blocked, video errors or nothing played after 2.5 s jump to the end; if the video can't load the copy still shows. A parse-time fallback shows the copy on slow connections without waiting for JavaScript.
- Renamed `public/Video` to `public/video` (Netlify paths are case-sensitive).
- Header is transparent over the top of the hero; its CTA appears after the intro. Fixed header wrapping at 1024 px.
- Tests: 20 intro checks (normal play, skip, wheel and touch skip, replay on refresh, reduced motion, autoplay blocked on mobile emulation, slow 3G, video failing to load) and the 30 existing site checks all pass.
- Lighthouse reports 99 mobile / 100 desktop, but it stops measuring before the reveal. Real first-visit LCP is likely to be the headline at about 7 s.

### Update: hero measurement lines removed (12 October 2026)

**Prepared for:** Dasendhran Subramoney

- Removed the dimension lines drawn onto the empty room at the end of the intro. The reveal is now: white overlay, headline line by line, supporting line, then both CTAs.

### Update: no portrait of Trevor (12 October 2026)

- Trevor doesn't want his photo on the site. Removed the portrait placeholder from the Trevor section; the steel-frame bench photo now sits beside his story instead. Figures renumbered (Fig. 01 Trevor section, Fig. 02 trade section).

### Fix: intro plays on every refresh (12 October 2026)

- After a nav click the address ended in `#section`, and refreshing that address skipped the intro. Every load now clears the `#section` and plays the intro from the top. Reduced motion is the only exception.

### Redesign: A-03 Trevor "Section drawing" (12 October 2026)

**Prepared for:** Dasendhran Subramoney

- Trevor's career is now told through one technical cross-section that changes on scroll: stainless steel box section (45° hatch, weld beads), balustrade (handrail on post, base plate, fixings), timber door edge (rebate, edge banding, hinge cup, grain with a knot). Chapter copy unchanged.
- Desktop pins the section for 250vh with a scrubbed GSAP timeline; under 1024px each drawing draws in once; reduced motion and no-JS show all finished drawings.
- New full-width closing statement, "The material changed. The standard didn’t.", revealed word by word.
- The steel-frame bench photo moved to Selected work as W-06 Furniture, "Steel frame, timber top".
- Inactive chapters sit at 35% opacity as specified, which is about 2:1 contrast while inactive (below WCAG AA). Reduced-motion and mobile users always see full contrast.

### Update: Trevor's bio (12 October 2026)

- Rewrote the Trevor section from the overview Trevor supplied: the three chapters (stainless steel, balustrading, timber), plus two closing paragraphs on what he does today and how he works. Edited to the site's voice; two earlier lines that were not from Trevor were removed.

### Update: contact details (12 October 2026)

- Phone 082 332 1112, email topdraw19@gmail.com, service area Greater Johannesburg and site visit R795 added to the contact section, footer, trade section, structured data and no-JavaScript fallback. WhatsApp links use the same number.
- Consultation form: "Phone" relabelled "Contact number"; new required "Industry sector" choice (Residential or Commercial), also added to the Netlify form definition.

### Update: footer contact labels (12 October 2026)

- Footer contact details now carry small labels (Phone, Email, WhatsApp) above each value; the WhatsApp link reads "Message Trevor".

### Update: hours (12 October 2026)

- Footer and structured data: Monday to Friday 08:00 to 17:00, closed on weekends.

### Fix: hero headline overlapping the nav on short windows (12 October 2026)

- On wide but short desktop windows (for example 1833 x 900) the five-line headline grew taller than the hero and pushed the "Interiors / Johannesburg" label up under the logo and nav. On large screens the headline size is now also capped by window height (6.2% of the height, never below 34 px or above the existing size), so it only shrinks when the window is short. Tall screens, tablets and phones are unchanged.
- Checked at 1366 x 650 and 1833 x 900: the copy now clears the header with room to spare.

### Pending: Process section content (12 October 2026)

- A five-stage process (Enquire, Site visit and quote, Agree and refine, Manufacture, Install and handover) with the R795 consultation fee, the 30% / 50% / 20% payment schedule, 7-10 working days to source materials and a 4-6 week project timeline has been drafted and sent to Trevor to confirm as a PDF. It is not on the site yet; the current Process copy in `src/content.js` stays until he replies.

### Session summary (12 October 2026)

**Prepared for:** Dasendhran Subramoney

Removed the hero measurement lines; fixed the hero headline overlapping the nav on short windows; drafted the new Process copy for Trevor to confirm (not live yet); made the intro play on every refresh; removed the portrait of Trevor at his request; rebuilt the Trevor section as a scroll-driven technical "section drawing" (steel, balustrading, timber); rewrote his bio from his own overview; moved the steel-frame bench photo to Selected work; added his real phone, email, service area, site visit fee and hours; added an Industry sector choice (Residential or Commercial) to the consultation form; labelled the footer contact details. Still to supply: Instagram and Facebook links, project suburbs, and confirmation that WhatsApp uses 082 332 1112.
