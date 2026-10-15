# Top Draw

Marketing site for Top Draw, bespoke cabinetry and interiors in Johannesburg.
Vite + React 18, Tailwind CSS 4, GSAP ScrollTrigger, Lenis, Framer Motion (AnimatePresence, plus drag in the Projects gallery).

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
- Single page with anchored navigation: hero, Services (01 to 05), Process, Trevor ("The Artisan"), Selected work, For designers and architects, Contact, and a title-block footer.
- Hero meets the above-the-fold contract (what, who, why, both CTAs) at 375×667, 375×812, 768×1024 and 1440×900.
- Drawing-sheet system: hairline rules instead of cards, sheet numbers (A-01 to A-07), dimension lines and leader notes on photographs, blueprint grid on the Process section only.
- Services: a sticky scroll reveal on desktop (photo pinned beside the services in view) and a stacked list with a photo per service on small screens.
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

### Update: brand colours from the logo (13 October 2026)

**Prepared for:** Dasendhran Subramoney

- Re-themed the site from the old cool blue-grey to the Top Draw logo colours, measured from the logo file: blue #31378F, black #222222, beige #B2A696. Done on the `feature/brand-colours` branch.
- Token changes in `src/index.css` (names unchanged): `steel` #4A7FB0 to #31378F (CTAs, active states, focus, process nodes); `ink` #2B3642 to #222222 (text, dark contact/footer); `mist` #E9EEF3 to #F5F2ED (alternating sections); `rule` #B7C6D6 to #D2C9BC (hairlines, secondary text on dark). New `beige` #B2A696, used only for the primary button border on the dark section.
- Blue on near-black is only 1.57:1, so on the dark contact section the primary button is white with dark text (resolved when this branch was merged with the logo-hero work, which made the same call; the beige-border idea was dropped). The beige token is reserved for dark-section accents and currently unused.
- Also updated the hard-coded colours in `SectionDrawings.jsx`, the Process blueprint grid (an encoded colour inside `index.css`) and `public/favicon.svg`. `DESIGN.md` has the new palette and a re-measured contrast table. Text contrast is better everywhere (ink on paper 15.91:1; white on blue 9.67:1, so the old 19px-bold rule for button text no longer limits it).
- Colour only: no layout, copy, type or motion changes. The logo artwork and the "Top Draw" wordmark in the header are unchanged. The hero video, photographs and the `og.jpg` social image are not recoloured.

### Update: Services sticky scroll reveal (13 October 2026)

- Replaced the Services accordion with a sticky scroll reveal adapted from a 21st.dev component. On desktop the five services scroll past on the left while one photo stays pinned on the right and swaps to match the service in view; the others dim to 35% and the active title turns blue. Under 1024 px each service is a plain stack with its own photo.
- Adapted rather than pasted: the original scrolls inside its own 30rem box and is TypeScript, shadcn and Tailwind-colour based. This version scrolls with the page, is plain JSX, and uses the site palette and existing photos; no new dependency (it uses `framer-motion`, already installed). Active service is tracked with an IntersectionObserver.
- Reduced motion and no-JavaScript show every service at full contrast. Inactive services at 35% are below AA contrast while inactive (same trade-off as the Trevor chapters).
- The accordion's arrow-key navigation and hover-to-open are gone with it: the list is now plain content. Checked at 1440 and 390 px wide; the active service and photo stay in step as you scroll.

### Update: Work section portal intro (13 October 2026)

- Added a scroll-driven intro to Selected work, adapted from the MIT-licensed Glyph Portal (21st.dev, Christian Katzmann; licence notice kept at the top of `src/components/GlyphPortal.jsx`). The word PROJECTS (with "Top Draw" above it, like the logo) is set huge in blue, with a project photo showing through the letters; scrolling zooms into a letter until the blue fills the screen, then the six projects scroll over it. Pinned for 1.5 screens. Branch: `feature/work-glyph-portal`.
- Ported to JavaScript for this project (the original is TypeScript): the `inert` attribute is set the React 18 way, the root is a plain div, the default green background and no-JS poster are removed. No new packages; font is the existing self-hosted Schibsted Grotesk at weight 800; colours are the existing palette tokens (blue, black, white); the photo is one of the existing project photos.
- Loads on demand: the portal is a separate 5.5 KB (gzip) chunk that only loads when the section is within a screen of the viewport and the font has loaded (1.5 s limit). Until then, with reduced motion, or without JavaScript, the section is the same plain project list as before, and that list is what the prerendered HTML contains. Checked: raw HTML contains the heading, captions and images; no external hosts are requested; desktop and 390 px behave; reduced motion stays static.
- Lighthouse mobile, before and after this change: performance 98 to 99, LCP 2.3 s to 1.8 s, TBT 40 ms to 0 ms (within normal run-to-run noise). Lighthouse does not scroll, so it does not exercise the portal itself.
- **TODO:** swap Schibsted Grotesk for the typeface in the final logo once chosen; replace the kitchen photo behind the letters with the chosen hero project photo; confirm the line "Measured on site. Built in our workshop. Professionally installed." with Trevor; project suburbs are still [SUBURB].

### Update: infinite drag gallery after the Projects zoom (13 October 2026)

- After the zoom into PROJECTS, the first thing you land on is now an infinite drag gallery of all twelve project photos on the blue; (that captioned list has since been removed from the zoomed view, see the next entry). Adapted from the 21st.dev `infinite-drag-scroll` component (masonry variant): `src/components/InfiniteGallery.jsx`. No new packages.
- Behaviour: scrolling the page moves the grid while the gallery is pinned (about 1.2 screens), and on a mouse you can also drag it in any direction with momentum; the photos repeat forever. On touch, dragging is sideways only so a vertical swipe still scrolls the page. The photos scale in with a short stagger the first time it comes on screen.
- Adapted rather than pasted: the original turns every mouse wheel tick anywhere on the page into grid movement (a scroll trap on a normal page), uses `motion/react`, `class-variance-authority` and Tailwind colour classes, and is TypeScript. This version uses `framer-motion` (already installed), plain classes, the site's own photos, and sizes tiles in vw so the wrap never shows a gap.
- Loading: drag support (`domMax`) is in the gallery's own lazy chunk (about 15 KB gzipped) and only downloads with the portal. The main bundle grew by about 1.7 KB gzipped for this whole branch. Raw HTML, reduced motion and no-JavaScript are unchanged: the plain captioned list, no gallery.
- Checked in dev and the production build at 1440 and 390 px: no blank space while scrolling or dragging, drag and scroll both move the grid, no console errors, only local requests. The gallery is aria-hidden (decorative, repeats photos shown elsewhere).

### Update: old project list removed from the Projects zoom (13 October 2026)

- After the zoom into PROJECTS you now land in the infinite drag gallery and nothing else: the captioned project list (the six large photos with captions under the "A-04 / Selected work, Built and installed" heading) is gone from that view, and the Trade section follows the gallery directly.
- The plain list is kept for visitors without JavaScript, with reduced motion, or before the portal loads, so the prerendered HTML still has the Selected work heading, captions and photos. Inside the portal, a screen-reader-only heading and caption list (no images) keeps the section labelled and readable for assistive tech.

### Fix: gallery first view and photo pop (13 October 2026)

- First view after the zoom: the grid was already moving while the gallery was still sliding up into view, so it landed on a random position with photos cut off. It now only moves with the page once it is pinned, and it starts below the header, so the opening view is a clean grid. The staggered rows are also less offset on desktop so more of each photo shows.
- Photos now stand out: each sits on a flat blue backdrop (the white frames were later replaced by a soft shadow), instead of sitting on the faint kitchen photo.
- The entrance animation previously played before the gallery had faded in, so it was finished before anyone saw it. It now starts once the zoom completes (the photos scale and fade in with a short stagger) and replays if you scroll back out and in again.

### Update: gallery shadows and clean exit (13 October 2026)

- Replaced the white frames around the gallery photos with a soft black drop shadow, so they lift off the blue. This is the one shadow on the site (the design notes otherwise rule them out); noted as an exception in `DESIGN.md`.
- Clean first and last view: an infinite grid always has photos running off some edge, which looked like a mistake when the gallery opened and when it handed over to the next section (the bottom edge of the panel sliced the photos). At both moments the grid now eases into an aligned resting position where every photo on screen is whole, with blue margin above and below. Photos are sized from the screen height as well as its width, and the row gap grows to match, so this works on any window (checked at 1900x832, 1852x703, 1440x900, 1920x1080, 390x844 and 375x667: no cut photos at the first or last view). The panel then scrolls away with blue along its bottom edge. Earlier attempts (a fade-out, and the next section sliding over it like a curtain) were dropped.

### Session summary (12 October 2026)

**Prepared for:** Dasendhran Subramoney

Removed the hero measurement lines; fixed the hero headline overlapping the nav on short windows; drafted the new Process copy for Trevor to confirm (not live yet); made the intro play on every refresh; removed the portrait of Trevor at his request; rebuilt the Trevor section as a scroll-driven technical "section drawing" (steel, balustrading, timber); rewrote his bio from his own overview; moved the steel-frame bench photo to Selected work; added his real phone, email, service area, site visit fee and hours; added an Industry sector choice (Residential or Commercial) to the consultation form; labelled the footer contact details. Still to supply: Instagram and Facebook links, project suburbs, and confirmation that WhatsApp uses 082 332 1112.

### Update: Trevor section ending (13 October 2026)

**Prepared for:** Dasendhran Subramoney

- The closing statement no longer sits as a separate block after the animation. It is now the drawing's title block, revealed as the last step of the same scroll sequence, alongside a new chapter 04 "Today" (from Trevor's bio).
- While pinned on desktop, inactive chapters fold to their number and label and the active chapter opens, so all four fit on a laptop screen. Mobile and reduced-motion layouts show every chapter in full, with the title block in chapter 04's drawing slot.

### Update: intro captions (13 October 2026)

**Prepared for:** Dasendhran Subramoney

- Two captions now run over the intro video, timed to what is on screen: "Bespoke design: We design, build and install bespoke kitchens, bathrooms and interiors." while the finished kitchen is showing, and "White boxing: We also do white boxing, taking a bare room to a finished shell ready for fit-out." once the room is empty.
- The video pauses for 1.5 s on the finished kitchen so the first caption can be read, and holds on the empty room for 3 s with the white-boxing caption before the hero copy reveals, so the intro runs about 11 s. Skip intro, scroll or touch still skip straight to the copy. Wording and timings are in `intro.captions` in `src/content.js`.

### Update: logo (13 October 2026)

- Supersedes the 12 October headline-size fix: the hero no longer shows the headline text.

**Prepared for:** Dasendhran Subramoney

- The Top Draw Projects logo now replaces the hero text: after the intro, the logo wipes in from the left, followed by the two buttons. The headline sentence stays in the page heading for screen readers and search engines, but is no longer shown.
- The TD mark sits beside "Top Draw" in the navigation bar.
- The supplied JPEG was cropped and its white background removed (`public/images/logo-top-draw.webp`, `logo-top-draw-sm.webp`, `logo-mark.webp`). The original is kept in `design/logo/`.

### Update: hero polish (13 October 2026)

- Site accent changed from steel blue (#4A7FB0) to the logo's blue (#31378F) so buttons, active states and drawings match the logo. Button text contrast rises from 4.2:1 to 10.1:1. In the dark contact section the main button is now white with dark text.
- The half-screen white veil is gone. The logo, a one-line descriptor ("Bespoke kitchens, bathrooms and interiors / Greater Johannesburg") and the two buttons now sit in a framed title block, bottom left, so the whole room shows.
- The nav brand stays hidden over the hero and fades in once the hero scrolls away.

### Update: hero ends on the finished kitchen (13 October 2026)

- After the white-boxing caption, the finished kitchen fades back in over the empty room and stays as the hero background behind the title block. It is a frame of the intro video (4.3 s), captured as the video plays, so there is no separate image file and no jump in camera position.
- Skip intro, repeat visits with reduced motion, and slow connections all land on the same kitchen frame. The frame time is `intro.finalFrame` in `src/content.js`.

### Session summary (13 October 2026)

**Prepared for:** Dasendhran Subramoney

Folded the Trevor closing statement into the drawing sequence as chapter 04 "Today" with a title block; added timed intro captions ("Bespoke design" and "White boxing") with reading pauses; replaced the hero text with the Top Draw Projects logo in a framed title block with a one-line descriptor; changed the site accent to the logo's blue; hid the nav brand over the hero; ended the intro on the finished kitchen. Still to supply: Instagram and Facebook links, project suburbs, confirmation that WhatsApp uses 082 332 1112, and whether the business name everywhere should be "Top Draw Projects".

### Update: gallery backdrop black (14 October 2026)

- The panel behind the gallery photos is now solid black (the logo black, `ink` #222222) instead of blue. The blue still shows during the zoom into PROJECTS; the black panel fades in over it as the zoom finishes. The photos' soft shadow is much fainter on black, as expected.

### Update: PROJECTS black, Top Draw blue (14 October 2026)

- Swapped the colours of the Projects intro: the small "Top Draw" line above is now the logo blue and the huge PROJECTS word is black (the letters are windows onto the kitchen photo under a black overlay). The zoom into a letter now ends in black, which flows straight into the black gallery panel instead of crossing from blue to black.

### Fix: bump at the end of the gallery (14 October 2026)

- Scrolling towards the next section, the photos used to "bump" up and then only let the page scroll: at about 78% of the gallery a timed animation snapped the grid into its resting position (it jumped back 159 px against the scroll) and then froze it. Measured, not guessed.
- The grid now glides into its resting position in step with your scroll, starting at the speed it was already moving and easing to a stop, then holds still for a short stretch before the page moves on. No timer, no jump; scrolling back up reverses it smoothly. Measured with no abrupt moves going down or up, and the first and last views still show only whole photos on all six window sizes tested.

### Update: section header labels removed (14 October 2026)

- Removed the small sheet-number label above each section title ("A-01 / Services" through "A-06 / Contact", and "A-04 / Selected work") and the small right-hand note beside it ("Five services, one team", "Same team at every stage", "Owner and lead craftsman", "Fabrication and installation partner", "Service area: ..." and the Work note). The rule and the large title stay, and titles now start at the left margin. In Process and Trade the text that had been lined up under the old title position moves to the left margin with them.
- Not touched: the section numbers in the mobile menu, "Sheet A-07 / End" in the footer, and the "A-03 / General note" inside the Trevor drawing's title block. Say if you want those removed too.

### Update: all small index numbers removed (14 October 2026)

- Removed the small numbering across the site: the "01" to "05" above each service, the numbers in the Services photo captions ("01 / New build..." is now just the caption), "Stage 01" to "Stage 05" in Process, the "01" to "04" beside each Trevor chapter, the "A-03 / General note" and "Sheet 04 of 04" lines in the Trevor drawing's title block, the "W-01" to "W-06" project codes in the plain project list, "Fig. 02 /" in the Trade caption, the "A-01" to "A-06" codes in the mobile menu, and "Sheet A-07 / End" in the footer. Checked in the built page: none of those strings remain.
- Kept on purpose: the real measurements and specs inside the Trevor drawings ("50 x 25 mm", "t = 2.0 mm", "SS 304", "Tolerance +/- 0.5 mm" and so on), times ("08:00 to 17:00") and the R795 fee. The numbers still exist in the data (`content.js`) because the layout uses them as keys; they are just not shown.

### Update: Services heading (14 October 2026)

- The Services section heading "What we take on" is now "Areas of Expertise" (the "Services" link in the navigation is unchanged). It is also centred between the rule above it and the line below it: measured at 58.8 px above (rule to the top of the capitals) and 58.4 px below (baseline to the line) on a 1440 px window, and 36 / 37 px on a phone. This is an option on the section header (`centered`), used only here; the other section headings are unchanged.

### Update: Services photos removed (14 October 2026)

- Removed the photos from the Services section (the pinned photo on desktop and the photo under each service on phones, including their "[SUBURB]" captions). Without photos the sticky scroll reveal had nothing to pin, so the section is now a plain text list on hairlines: each service's title on the left and its description on the right from 1024 px wide (stacked on smaller screens). It no longer has any animation, and the earlier "Services sticky scroll reveal" entry above describes the version it replaced.
- The photo and caption fields for each service are still in `src/content.js` but are no longer used.

### Update: Services Scroll Stack (14 October 2026)

- Services are now a Scroll Stack (from React Bits): five cards in the logo colours (black, blue, beige, black, blue) that pin under the header one after another as you scroll, the next sliding over the last. It scrolls with the page, not inside a box, and the site's existing smooth scroll does the smoothing (the component's own wheel handling and snapping are switched off so the two do not fight). Heading "Areas of Expertise" unchanged. Branch: `feature/services-scroll-stack`.
- Only the JavaScript was supplied, so `src/components/ScrollStack.css` was written for this site from how the component uses each class (sticky slots, card, dim overlay). If it should match the React Bits demo exactly, replace it with the original stylesheet. React Bits has its own licence terms; check them before reusing the component outside this site.
- Fallbacks: the plain two-column list (title left, description right) stays for the prerendered HTML, no JavaScript, reduced motion and until the stack loads (a separate 2.4 KB gzipped chunk). Checked at 1440 and 390 px: cards pin at the right offsets, stack and scroll away, no console errors.
- Replaces the plain text list from the entry above.

### Update: Services heading stays in frame (14 October 2026)

- The "Areas of Expertise" heading now stays pinned under the site header while the cards stack beneath it (on an opaque beige background so cards slide up behind it, not through it), and scrolls away with the section once the stack is done. Measured at 1440 and 390 px: the heading stays at the same position through the whole stack. The cards now pin directly below the heading (measured, so it follows the window size). Without the stack (reduced motion, no JavaScript) the heading is not pinned.

### Update: Trevor heading (14 October 2026)

- The Trevor section heading "From steel to timber" is now "The Artisan" (the "Trevor" nav link is unchanged), and it sits a little lower under its rule (20 px on phones, 32 px on desktop). The sentence below it ("Trevor didn't start in a joinery shop...") and the chapters are unchanged.

### Fix: nav links played every animation on the way (14 October 2026)

- Clicking a nav link (or the hero and Trade enquiry buttons) glided the page down over about a second, scrolling through every section in between, so each pinned or scroll-driven animation (Trevor drawing, Projects zoom, gallery) played in fast-forward before you arrived. Measured: about 60 scroll frames per click; now 1.
- All in-page links now jump straight to the section. Because the Projects portal loads when it is near the screen and makes its section several screens taller, a jump to Trade first landed in the gallery; jumps now re-check their landing spot for 2.5 s and correct it, and any scroll, touch or key press stops the correcting. Checked: Process, Trevor, Work, Trade and the hero button all land with the section top exactly under the header, no console errors.
- Unchanged on purpose: the "See the work" button still glides (that glide is the zoom into the gallery). Lenis's built-in anchor handling was replaced by this in `src/lib/motion.js`.

### Update: footer rebuilt (14 October 2026)

- Rebuilt the footer from a React component pattern (shadcn-based) the client supplied, adapted to this site rather than pasted: no shadcn, Radix or Lucide (none are installed; icons are small inline drawings), no new packages.
- Layout: a pitch ("Let's talk about your project." with "Book a site consultation" and "WhatsApp Trevor"), quick links to every section, contact details (phone, email, area, site visit R795), hours, Instagram and Facebook icons, then the copyright line with "Back to top". Stacks to one column on phones; no horizontal overflow at 1440, 1024 or 390 px.
- Left out on purpose, because there is nothing real behind them: the newsletter sign-up (no mailing list or backend), the dark-mode switch, Twitter and LinkedIn icons, and the Privacy, Terms and Cookie links (no such pages exist; tell me if they are needed and what they should say). The social icons are dashed placeholders until the real Instagram and Facebook links go into `contact.social` in `src/content.js`.


### Update: gallery animation removed (15 October 2026)

- Removed the infinite drag gallery after the PROJECTS zoom (the draggable grid that moved with the scroll, the glide into its resting position, and the photo pop-in). The twelve project photos now sit in a still grid on solid black, four across on desktop and two on phones, with the soft shadow kept. The PROJECTS zoom itself is unchanged, and the page then flows into the Contact section, which is also black.
- Deleted `src/components/InfiniteGallery.jsx` and its styles; the separate drag chunk (about 20 KB gzipped, framer-motion drag) is no longer downloaded. The plain captioned project list for no-JavaScript and reduced motion, and the screen-reader summary inside the portal, are unchanged.
- The earlier README entries about the gallery describe a version that no longer exists.


### Update: twelve photos chosen from the album (15 October 2026)

- Went through all 87 photos in the shared Google Photos album ("Website - Carpentry") and chose twelve for the Projects grid: finished, well-lit, uncluttered work across kitchens, bathrooms, built-in cabinetry, furniture and shopfitting, with no faces and no baked-in black bars. Nine were already on the site (charcoal kitchen island, patterned-tile kitchen, library with ladder, thatched loft interior, vanity with mirror cabinet, floating oak vanity, wardrobe under the eaves, steel-and-oak dining table, charcoal tall unit); three are new: a timber-topped steel-frame bar counter, a supermarket deli island, and a painted cabinet with drawer and panelled doors.
- The grid is now a staggered layout where each photo keeps its own shape (the mix of portrait and landscape shots would have been badly cropped in uniform tiles). New images are in `public/images` at 800 and 1600 px wide (WebP); entries added to `img` in `src/content.js` with descriptive alt text.
- Considered and left out: duplicates of the same kitchens, unfinished handover shots (bare plaster, cables, sticker residue), cluttered lived-in kitchens, workshop and in-progress shots, shots with people, and phone-watermarked photos (the one watermarked photo used, the deli island, is cropped to remove it).
- **To check with Trevor:** the deli island shows a SuperSpar sign in the background and the bar counter shows a computer and a fire alarm; confirm he is happy to show these clients' spaces. The plain captioned list (no JavaScript / reduced motion) still uses the earlier six projects.


### Update: footer colours reversed (15 October 2026)

- The footer is now white with dark text instead of black with white text, so it contrasts with the black Contact section above it. Buttons use their normal light-background styles (blue "Book a site consultation", outlined "WhatsApp Trevor"). Secondary labels use the dark text colour rather than the light beige, which would be hard to read on white. Dividers stay in the light beige hairline colour.


### Update: service area is now Gauteng (15 October 2026)

- "Greater Johannesburg" is now "Gauteng" wherever it appears on the site: the Contact section and footer (Area), the line under the logo in the hero ("Bespoke kitchens, bathrooms and interiors / Gauteng"), the search-engine data (`areaServed`) and the no-JavaScript fallback text. Earlier entries in this log still say "Greater Johannesburg" because they describe what was true at the time. The word "Johannesburg" on its own (header tagline, footer text, page title) is unchanged.


### Update: section headings unified, with eyebrows (15 October 2026)

- Every section heading now has a small label above it with that section's navigation name ("Services" above "Areas of Expertise", "Process" above "Concept to completion", "Trevor" above "The Artisan", "Work" above "Built and installed", "Contact" above "Book a site consultation"). The label comes from the navigation list, so it stays in step if a nav name changes.
- All five headings are now exactly alike: same size (55 px desktop, 30 px phone), same regular weight, same spacing (measured: 49 px from the rule to the label and 12 px from the label to the title on desktop, identical in every section). Trevor's heading used to be larger and Services had its own centred spacing; both variants are gone. The Services heading still stays pinned while its cards stack, and the nav jumps still land with the section top under the header.
- The Work heading is only visible in the plain list (no JavaScript or reduced motion); in the zoom, the "Top Draw / PROJECTS" lockup is that section's heading, unchanged.


### Update: arrows on the section labels (15 October 2026)

- Each small section label now starts with a small right-pointing arrow, drawn as an inline SVG so its left tip sits on the same vertical line as the left edge of the large heading below it; the label text is pushed about 26 px to the right by the arrow. Measured on desktop and phone: the arrow is within 2 px of where each title's first letter starts (the spread is just the letter shapes). The arrow takes the label's colour (blue on light sections, light beige on the dark Contact section).


### Update: Trevor heading stays in frame (15 October 2026)

- On desktop the "The Artisan" heading (rule, "Trevor" label and title) now stays pinned under the site header while the steel, balustrade and timber drawing animates, instead of scrolling away just before the animation starts. The drawing stage pins directly below it. Fitting the heading in meant tightening the pinned stage slightly (less padding, a smaller gap above the chapter list; on windows under 860 px tall the intro sentence steps down a size). Measured at 1440x900, 1366x768, 1920x1080 and 1536x730: the heading stays at the same position through the whole animation and nothing in the stage runs outside its area. Phones and reduced motion are unchanged (no pinning).


### Update: eight more photos in the Projects grid (15 October 2026)

- The grid now has twenty photos. Added eight more from Trevor's album: two already on the site (the charcoal island kitchen with wrapped pendants, and the loft balustrade) and six new (white gloss kitchen with black granite peninsula and glass pendants; laundry in white and charcoal; pale oak tall cabinets around a stainless fridge; long bathroom vanity with two basins; light woodgrain kitchen with black granite and an eye-level oven; floor-to-ceiling white wardrobe wall). New images are in `public/images` at 800 and 1600 px (WebP), with alt text in `src/content.js`.
- Left out: duplicates of kitchens already shown, rooms with clutter or an orange colour cast, an oversized file that would not convert, and anything with people in frame. The pet dogs in one kitchen photo were why that one was skipped.
- **To check with Trevor:** the fridge unit photo shows a visible brand name (Hisense), and these are clients' homes, so confirm he has permission to show them.


### Update: site visit fee removed (15 October 2026)

- Trevor has scrapped the R795 site visit / consultation fee for now. Removed the "Site visit R795" line from the Contact details table and from the footer, and deleted the `siteVisit` value from `src/content.js`. No other page text mentioned the fee. Earlier README entries still mention R795 because they describe what was true then. To bring a fee back, add the line and value again.
- The Process section's text and the Process PDF draft sent to Trevor earlier also described the R795 consultation fee; the live Process copy no longer mentions it, but the old PDF is out of date.

### Session summary: branch `feature/work-glyph-portal` (13 October 2026)

**Prepared for:** Dasendhran Subramoney

This branch has everything below, merged with the logo-hero work from `feature/marketing-site`. The local branches `feature/brand-colours` and `feature/services-sticky-scroll` never had commits of their own (their work is in this branch), so they can be deleted.

- **Colours:** re-themed from blue-grey to the Top Draw logo colours: blue #31378F (measured from the original logo file), black #222222, beige #B2A696, with warm beige tints for sections and hairlines. Contrast re-measured in `DESIGN.md`; text and white-on-blue buttons now pass comfortably.
- **Services:** the accordion became a sticky scroll reveal (adapted from 21st.dev). On desktop a photo stays pinned beside the services and swaps as each one scrolls into view; on phones each service carries its own photo.
- **Projects (was Selected work):** a scroll-driven portal intro. The word PROJECTS, with "Top Draw" above it, is set huge in blue with a project photo showing through the letters; scrolling zooms into a letter until the blue fills the screen. You then land in an infinite drag gallery of all twelve project photos (scrolling moves it, mouse users can drag it in any direction, touch users drag sideways). The first and last views are aligned so no photo is ever cut by an edge, on any window size tested. The photos carry a soft shadow (the one shadow on the site).
- **Fallbacks:** the plain captioned project list stays for visitors without JavaScript, with reduced motion, and in the prerendered HTML; screen readers get a text summary inside the portal. The portal and gallery load only when the section is near the screen (about 5 KB and 20 KB gzipped).
- **Fixes:** hero headline no longer overlaps the nav on short windows; the hero measurement lines were removed.
- **Process section:** a new five-stage process (with the R795 fee, the 30% / 50% / 20% payments, 7-10 working days for materials and a 4-6 week project) was drafted and sent to Trevor as a PDF. It is not on the site yet.
- **Third-party code:** the portal is adapted from Glyph Portal (MIT, Christian Katzmann; licence notice kept in `src/components/GlyphPortal.jsx`); the Services reveal and the drag gallery are adapted from 21st.dev components. No new packages were added.

Still to supply or decide: Instagram and Facebook links, project suburbs, confirmation that WhatsApp uses 082 332 1112, Trevor's reply on the Process wording, and Trevor's OK on the line under PROJECTS ("Measured on site. Built in our workshop. Professionally installed."). Also: swap the kitchen photo behind the PROJECTS letters for the chosen hero project photo, and swap Schibsted Grotesk for the logo's typeface if one is chosen.

### Session summary (14 October 2026)

**Prepared for:** Dasendhran Subramoney

Projects intro: PROJECTS is now black with "Top Draw" in blue above it, the "See the work" button is black, and the gallery sits on a solid black panel. Fixed a bump that happened as the gallery handed over to the next section (the grid now glides to its resting position in step with the scroll). Removed the small section labels ("A-0X / Name" and the right-hand notes) and every small index number on the site (service numbers, Stage 01 to 05, Trevor chapter numbers, W-01 to W-06, Fig. 02, menu codes, the footer sheet line). The Services heading is now "Areas of Expertise", centred between its two lines, and the Services photos and animation were removed in favour of a plain text list. Still to supply or decide: Instagram and Facebook links, project suburbs, confirmation that WhatsApp uses 082 332 1112, Trevor's reply on the Process wording and on the line under PROJECTS, the hero photo behind PROJECTS, and the logo typeface if one is chosen.
### Update: Process redesign (14 October 2026)


- The Process section now follows Trevor's "Topdraw Workflow Process, Rev 1": eight stages, from enquiry to snagging and handover, with his durations (manufacturing 10 to 20 working days, site preparation 7 to 10, installation 5 to 10) and his payment schedule (70% on accepting the quotation, 20% on delivery to site, 10% at handover). Wording lightly edited to the site's voice; no facts or numbers changed.
- Drawn as a project programme: a bar chart against working days, showing that manufacturing and site preparation run side by side, with the payment milestones on the same chart. On desktop the chart pins and a cursor sweeps across it as you scroll, drawing each bar and opening each stage's detail beside it, the same scroll-driven style as the Trevor section. Phones get a stacked stage list with a progress rail; reduced motion shows the finished chart and every stage.
- Below the programme: the payment schedule (a 70 / 20 / 10 split bar and three cells) and Trevor's timeline notes, including that the durations are estimates, not a guaranteed completion date.
- Supersedes the earlier 30 / 50 / 20 payment draft mentioned in the 12 October entry.

### Update: designers and architects section removed (14 October 2026)

- Removed the "For designers and architects" section and its nav link. The consultation form keeps the "Trade project (to spec)" project type, so trade enquiries can still be flagged. The tall charcoal unit photo stays, as the Projects gallery uses it.
- The new Process section follows the no-labels rule from Damian's 14 October changes: no section code or side note, no stage numbers in the chart or detail panel, and plain headings for "Payment schedule" and "Timeline notes".

### Session summary (14 October 2026)

**Prepared for:** Dasendhran Subramoney

Rebuilt the Process section from Trevor's workflow PDF (Rev 1) as a project programme: eight stages, his working-day estimates, and the 70% / 20% / 10% payment schedule, with a scroll-driven cursor on desktop that rests at handover and fades out. Removed the "For designers and architects" section. Merged with Damian's 14 October changes (no section labels or index numbers, plain Services list, Projects colours and gallery fix) and adapted the new Process section to match. Still to supply: Instagram and Facebook links, project suburbs, confirmation that WhatsApp uses 082 332 1112, and Trevor's OK on the line under PROJECTS.

### Merge note: branch `feature/services-scroll-stack` with Das's main (14 October 2026)

- This branch (Services Scroll Stack with a pinned heading, the "The Artisan" heading, instant nav jumps, and the rebuilt footer) was merged with Das's changes on `main` (the Process programme redesign and the removal of the Trade section). There were no text conflicts. Checked after the merge: nothing still points at the removed Trade section (the nav and footer links come from the same list), the nav jumps land correctly on every section including the new pinned Process, the Services stack and the Projects gallery behave as before, the footer has no overflow at 1440, 1024 or 390 px, and the production build passes.

### Update: Process timing block (15 October 2026)

- The four plain "Timeline notes" are now a "How long it takes" block, placed before the payment schedule: manufacturing, site preparation and installation as large working-day figures (10–20, 7–10, 5–10), each with its short explanation, matching the payment cells. The caveat that these are estimates, not a guaranteed completion date, sits in a shaded "Please note" panel. Same facts as Trevor's PDF.

### Update: Process background (15 October 2026)

- Removed the grid background from the Process section. It now sits on plain white inside a drawing-sheet frame: a fine border just inside the section edge, with small blue crop marks at the corners, like a printed technical drawing. It sets the programme apart from the neighbouring sections without adding colour.

### Update: shadcn/TypeScript setup (15 October 2026)

- Project supports shadcn-style structure and TypeScript alongside the existing JavaScript: `@` alias to `src` (vite.config.js, tsconfig.json), `components.json`, `src/lib/utils.ts` (`cn`), `src/components/ui/` with the shadcn Button. Do not run `npx shadcn init` (it rewrites `src/index.css`); add components with `npx shadcn add <name>`.
- The letter-style consultation form and the service-area globe were tried and removed; the contact form is back to its original layout.

### Update: contact section with map and step-by-step form (15 October 2026)

- Contact is now set over a dark street map of Johannesburg's northern suburbs (Rosebank to Sandton), generated from OpenStreetMap data by `scripts/build-map.py` into `public/images/map-johannesburg.svg` (55 KB gzipped, loaded only when Contact is near), with "Map data © OpenStreetMap contributors" credited on the page. A ringed pin marks the service area (Gauteng).
- Layout: a beige accent bar beside "How to reach Trevor / Book a site consultation", the phone, email and area in columns (the site-visit fee was removed by Damian's 15 October change), the WhatsApp button, then "Get in touch".
- The form asks one question at a time (name, contact number, email, suburb, residential or commercial, project type, optional note) with a segmented progress line, the current and next question named under it, a round "Next" button (Enter also works) and Back. Each answer is checked before moving on. Same fields and Netlify submission as before. Without JavaScript all fields show as a plain list.

### Session summary (15 October 2026)

**Prepared for:** Dasendhran Subramoney

Projects: the drag gallery after the PROJECTS zoom was removed and replaced by a still, staggered grid of twenty project photos on black (twelve chosen from Trevor's album, then eight more; nine were already on the site, the rest are new). Footer: reversed to white with dark text. Service area changed from "Greater Johannesburg" to "Gauteng" everywhere. The R795 site visit fee was removed from Contact and the footer (Trevor has scrapped it for now). Section headings: every heading now has a small label with that section's nav name, led by an arrow whose tip lines up with the heading, and all five headings share one size, weight and spacing. The Trevor heading stays pinned while its drawing animates. Still to supply or decide: Instagram and Facebook links, project suburbs, confirmation that WhatsApp uses 082 332 1112, Trevor's OK on the line under PROJECTS and on showing the clients' homes and shops in the photo grid, the hero photo behind PROJECTS, and the logo typeface if one is chosen.
Process: the timeline notes became a "How long it takes" block with large working-day figures and a "Please note" panel, and the grid background was replaced by a drawing-sheet frame. Contact: a letter-style form and a globe were tried and removed; the section is now a dark Johannesburg street map (OpenStreetMap) with a step-by-step form. Added shadcn-style structure and TypeScript support (`@` alias, `components.json`, `src/lib/utils.ts`, `src/components/ui/`).
