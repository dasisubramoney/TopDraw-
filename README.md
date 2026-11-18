# TopDraw Projects

Marketing site for TopDraw Projects, bespoke cabinetry and interiors in Gauteng. A single page
(React 18 + Vite 8, Tailwind CSS 4, GSAP, Lenis, Framer Motion) that is prerendered to static HTML at
build time and hosted on Netlify at https://topdrawprojects.co.za.

You need Node 20.19 or newer (Netlify builds with Node 22) and npm.

## Quick start

```bash
npm install                 # or `npm ci` for an exact install from package-lock.json
npm run dev                 # dev server, http://localhost:5173
npm run build               # production build into dist/ (see "Build" below)
npm run preview             # serve dist/ locally, http://localhost:4173
npm run test:notify         # unit tests for the contact-form email function
npm run verify -- <url>     # checks a running copy of the site (see "Verify")
npm run deploy              # publish dist/ to Netlify. BUILD FIRST (see "Deploy")
```

### Build

`npm run build` runs four steps in order: the client build, the server-render build, the prerender
(`scripts/prerender.mjs` writes the page's HTML into `dist/index.html`; it is plain server-side rendering,
no browser is launched), then `scripts/seo-build.mjs`, which writes `robots.txt`, `sitemap.xml`,
`llms.txt` and `build-commit.txt` into `dist/` and fails the build if a placeholder such as
`%VITE_SITE_URL%` is left anywhere.

**`VITE_SITE_URL` is required** and is already set in `.env` to the live domain. It feeds the canonical link,
social tags, structured data, sitemap, `robots.txt` and `llms.txt`. The build stops if it is missing or points
at a `netlify.app` address. `.env` is tracked and the repository is public: it must only ever hold public
values. Never put a key, token or password in it.

### Test

```bash
npm run test:notify
```

Runs `scripts/test-submission-created.mjs` (Node's built-in test runner, no network): tests of the
form-notification function with a mocked Resend API.

### Verify

`scripts/verify.mjs` checks a deployed or locally served copy of the site: that it was built from the current
git commit, that real content is in the raw HTML, the crawler files, that no `noindex` is sent, the structured
data, that no hidden term appears (see "Rules"), and a mobile Lighthouse run.

```bash
npm run verify -- https://topdrawprojects.co.za/            # the live site
npm run verify -- http://localhost:4173 --local --skip-lighthouse   # a local `npm run preview`
```

After any commit, verifying the live site reports STALE until the next deploy. That is expected.
`npm run verify:ssl -- topdrawprojects.co.za` and `npm run verify:domain -- https://topdrawprojects.co.za`
check the certificate, redirects and domain switch once the domain is live.

### Deploy

Deploys are manual: pushing to git does not publish the site.

```bash
npm run build
npm run deploy                                    # netlify deploy --prod, with the site ID in package.json
npm run verify -- https://topdrawprojects.co.za/
```

Always build first: `deploy` publishes whatever is in `dist/`. It needs the Netlify CLI, logged in, or a
`NETLIFY_AUTH_TOKEN` set as an environment variable on your machine (never in a file in this repository).
Netlify's own settings for this site: build command and publish folder come from `netlify.toml`, Node 22,
Forms detection on, and the **Prerender extension off** (the site is already prerendered).

## Contact form and email notifications

The enquiry form (`src/components/Contact.jsx`) posts to **Netlify Forms** as the form `consultation`. A hidden
copy of the form in `index.html` lets Netlify detect it at build time, with `company` as the spam honeypot.
Netlify stores every submission.

Each submission also triggers the function **`netlify/functions/submission-created.mjs`**, which emails the
enquiry through the [Resend](https://resend.com) API. It is configured only through three environment
variables, set in Netlify (Site configuration, Environment variables) and **never in this repository**:

| Name | What it holds |
|---|---|
| `RESEND_API_KEY` | the Resend API key |
| `NOTIFY_TO` | the one address that receives enquiries |
| `NOTIFY_FROM` | the From address, on a domain verified in Resend |

If any of the three is missing the function logs which name is missing (never a value), sends nothing and
still lets the submission through. The function never logs customer details. Run `npm run test:notify` after
changing it.

## Where things are

| Path | What it is |
|---|---|
| `src/content.js` | **All copy and facts**: contact details, services, process, FAQ, image list. Edit here, not in components. `index.html`, the structured data, `llms.txt` and the no-JavaScript text read the contact details from it. |
| `src/components/` | One file per section (`Hero`, `Services`, `Process`, `Trevor`, `Work`, `Faq`, `Contact`, `Footer`, `Gallery`) plus `Header` and UI parts in `ui/` |
| `src/index.css` | Design tokens (colours, type, spacing) and shared styles. See `DESIGN.md`. |
| `src/lib/motion.js` | Loads GSAP and Lenis after first paint; honours reduced motion |
| `src/assets/bespoke/` | Photos for the "Bespoke" gallery: drop files in, see the README in that folder |
| `public/images/` | Project photos as WebP (see "Images"), logos, hero poster, social image |
| `public/404.html`, `public/privacy.html`, `public/static-page.css` | Two plain static pages (see below) |
| `netlify.toml` | Build settings, cache and security headers, the `netlify.app` to custom-domain redirect |
| `scripts/` | Build, verify and one-off image tools |
| `PRODUCT.md`, `DESIGN.md` | The brief and the design system |

**Static pages.** `public/404.html` (Netlify serves it, with a 404 status, for any unknown address; it is
`noindex`) and `public/privacy.html` (served at `/privacy`) are plain HTML files copied as they are, styled by
`public/static-page.css`, which mirrors the site's tokens by hand. Because they are not built by Vite, the
domain, email address and WhatsApp number in them are typed by hand: if those change in `src/content.js`,
change them in both pages too. There is no catch-all redirect, so unknown paths really return 404.

## Images

Project photos are exported as WebP at the widths listed for each entry in `img` in `src/content.js`
(usually 800 and 1600 px wide) and stored in `public/images` as `<name>-<width>.webp`. To add a project,
export the widths, add an entry to `img`, and add its key to `galleryOrder` in `src/components/Gallery.jsx`.
Images are cached for 30 days under their file name, so a changed photo needs a new file name.
Strip location and camera metadata before adding a photo, and avoid people, faces, number plates and
house numbers in shots.

Scripts: `scripts/build-hero-poster.mjs` re-exports the hero poster if the intro video is replaced (needs
Chrome); `scripts/build-gauteng-outline.mjs` rebuilds the contact-section outline map from public-domain
Natural Earth data.

## Rules for working on this repository

- Never commit a token, key or password, and never put one in `.env` (it is tracked and the repository is
  public). Secrets live in Netlify's environment variables or in environment variables on your machine.
- The workshop's suburb, street and postal code must never appear in any tracked file, comment or commit
  message. The words to avoid are listed in `.hidden-terms`, a local file that git ignores; `npm run verify`
  checks the built site against it. Create that file yourself if you do not have it.
- The hero video and intro animation are left alone unless a task says otherwise.
- Do not add a `noindex` header or tag to the site. (`public/404.html` is the one page that carries one.)
- Performance comparisons: build, `npm run preview`, then Lighthouse (mobile) five times on each side and
  compare medians, never single runs.
- Commit messages are one line describing the change.

## History

Earlier project notes were removed from this file when it was rewritten for developers. The full history of
changes is in the git log.
