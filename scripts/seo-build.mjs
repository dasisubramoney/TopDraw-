// Runs at the end of `npm run build`, after prerender. Writes the crawler files into dist/ from
// the site URL and the site's own content (nothing here is hand-typed into a deployed file), and
// stops the build if anything still carries the %VITE_SITE_URL% placeholder.
//
//   dist/robots.txt          rules for search and AI crawlers + the sitemap address
//   dist/sitemap.xml         the page(s), from the site URL
//   dist/llms.txt            plain-language description for AI assistants
//   dist/build-commit.txt    `git rev-parse HEAD` at build time (checked by scripts/verify.mjs)
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const dist = resolve('dist')
const fail = (msg) => {
  console.error(`\nSEO build step FAILED: ${msg}\n`)
  process.exit(1)
}

// 1. Site URL: required. Read from .env or the host's environment variables (Netlify).
const env = loadEnv('production', process.cwd(), 'VITE_')
const raw = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || '').trim()
if (!raw) fail('VITE_SITE_URL is not set. Set it in .env or in the Netlify environment variables (it is required).')
if (!/^https?:\/\/[^\s/]+$/.test(raw.replace(/\/+$/, ''))) fail(`VITE_SITE_URL must look like https://example.co.za (got "${raw}").`)
const site = raw.replace(/\/+$/, '')

// 2. Site content (single source of truth for facts).
const { contact, services, trevor, nav, whatsappHref } = await import(pathToFileURL(resolve('src/content.js')).href)
const today = new Date().toISOString().slice(0, 10)
const phoneIntl = '+27 ' + contact.phoneDisplay.replace(/^0/, '') // e.g. +27 82 332 1112

// 3. robots.txt: allow the search and AI crawlers by name, point at the sitemap.
const bots = ['ClaudeBot', 'GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot']
const robots = [
  ...bots.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${site}/sitemap.xml`,
  '',
].join('\n')
writeFileSync(join(dist, 'robots.txt'), robots)

// 4. sitemap.xml: a single-page site, so one URL.
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>\n`,
)

// 5. llms.txt: only facts that are on the site. Pricing is deliberately not stated (TODO with the client).
// Confirmed with the client: Monday to Friday, 08:00 to 17:00, closed Saturday and Sunday.
const hours = `${contact.hours[0].days}, ${contact.hours[0].time}. Closed Saturday and Sunday.`
const sections = nav.map((n) => `- [${n.label}](${site}/#${n.id})`).join('\n')
const llms = `# Top Draw Projects

> Bespoke cabinetry, kitchens, bathrooms and interiors in Gauteng, South Africa. Designed, built and installed by one team, led by craftsman Trevor.

## About
Top Draw Projects designs, manufactures and installs bespoke cabinetry, furniture and interiors for residential and commercial projects. The work includes kitchens, bathrooms, dressing rooms and built-in cupboards, and full turnkey projects. Trevor, who leads the business, started as a boilermaker and sheet metal worker in stainless steel fabrication, moved into architectural metalwork and bespoke balustrading, and then into high-end furniture, cabinetry and interior design.

## Services
${services.map((s) => `- ${s.title}: ${s.text}`).join('\n')}

## Where it works
${contact.area}, South Africa. No street address is published; Trevor visits the site to measure up.

## How to reach it
- Phone: ${phoneIntl}
- WhatsApp: ${whatsappHref()}
- Email: ${contact.email}
- Enquiry form: ${site}/#contact
- Opening hours: ${hours}

## Site sections
This is a single-page website.
${sections}
`
writeFileSync(join(dist, 'llms.txt'), llms)

// 6. build-commit.txt: the git commit this build was made from.
let commit = 'unknown'
try {
  commit = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
} catch {
  console.warn('Warning: could not read git HEAD; build-commit.txt will say "unknown" and verify.mjs will fail loudly.')
}
writeFileSync(join(dist, 'build-commit.txt'), commit + '\n')

// 7. No placeholder (%VITE_SITE_URL%, %CONTACT_EMAIL%) may survive anywhere in dist/.
const textExt = new Set(['.html', '.txt', '.xml', '.js', '.mjs', '.css', '.json', '.svg', '.webmanifest'])
const hits = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (textExt.has(extname(name)) && /%(VITE_SITE_URL|CONTACT_EMAIL)%/.test(readFileSync(p, 'utf8'))) hits.push(p.replace(dist, 'dist'))
  }
}
walk(dist)
if (hits.length) fail(`a placeholder (%VITE_SITE_URL% or %CONTACT_EMAIL%) is still present in: ${hits.join(', ')}`)

// 8. The canonical link must point at the site URL.
const html = readFileSync(join(dist, 'index.html'), 'utf8')
if (!html.includes(`<link rel="canonical" href="${site}/"`)) fail(`dist/index.html canonical link does not match ${site}/`)

console.log(`SEO files written for ${site}: robots.txt, sitemap.xml, llms.txt, build-commit.txt (${commit.slice(0, 7)}). No %VITE_SITE_URL% left in dist/.`)
