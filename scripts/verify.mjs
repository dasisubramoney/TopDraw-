// Verifies a deployed (or locally served) copy of the site.
//
//   node scripts/verify.mjs <site-url> [--netlify-host=<name>.netlify.app] [--local] [--skip-lighthouse]
//
// Order matters: the build-commit check runs first. If the deployed build is not the one made from
// your current git HEAD, the script stops with a loud failure and reports NOTHING else, because
// every other result would be about an old build.
//
//   1. /build-commit.txt equals local `git rev-parse HEAD`
//   2. real content is in the raw HTML (fetched with no JavaScript)
//   3. /robots.txt, /sitemap.xml, /llms.txt return 200 with the expected content
//   4. X-Robots-Tag: noindex on the *.netlify.app hostname
//   5. Lighthouse (mobile): full SEO audit list and full Performance detail
//
// --local   the address is a local server (e.g. `npm run preview`): skips the netlify.app header
//           check, and does not require the canonical link to match the address.
import { execSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split('=').slice(1).join('=')
const base = (args.find((a) => /^https?:\/\//.test(a)) || '').replace(/\/+$/, '')
if (!base) {
  console.error('Usage: node scripts/verify.mjs <site-url> [--netlify-host=<host>] [--local] [--skip-lighthouse]')
  process.exit(2)
}
const local = flag('local')

const env = loadEnv('production', process.cwd(), 'VITE_')
const expectedSite = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || '').replace(/\/+$/, '')
const { contact, services } = await import(pathToFileURL(resolve('src/content.js')).href)

let failures = 0
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` (${detail})` : ''}`)
}
const get = async (path, host) => {
  const url = host ? `https://${host}${path}` : `${base}${path}`
  const r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'topdraw-verify/1.0', 'Cache-Control': 'no-cache' } })
  return { url, status: r.status, headers: r.headers, text: await r.text() }
}

// ---- 1. Is the deployed build the one from my current commit? ---------------------------------
let localHead = ''
try {
  localHead = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
} catch {}
const dirty = (() => {
  try { return execSync('git status --porcelain', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().length > 0 } catch { return false }
})()
const bc = await get('/build-commit.txt').catch((e) => ({ status: 0, text: String(e) }))
const deployed = bc.status === 200 ? bc.text.trim() : ''
if (!localHead || !deployed || deployed !== localHead) {
  const bar = '#'.repeat(78)
  console.error(`\n${bar}\nSTALE OR UNVERIFIABLE BUILD: stopping. No other result below would describe your current code.\n`)
  console.error(`  local git HEAD : ${localHead || '(could not read)'}`)
  console.error(`  deployed commit: ${deployed || `(none: /build-commit.txt returned ${bc.status})`}  [${base}]`)
  console.error('\n  Rebuild and redeploy from this commit (or commit your changes first), then run this again.')
  console.error(`${bar}\n`)
  process.exit(1)
}
console.log(`PASS  Deployed build is current: ${deployed.slice(0, 7)} matches local HEAD`)
if (dirty) console.warn('NOTE  You have uncommitted changes. The deployed build matches your last commit, not those edits.')

// ---- 2. Real content in the raw HTML (no JavaScript executed) ----------------------------------
const home = await get('/')
const html = home.text
check('Home page returns 200', home.status === 200, `status ${home.status}`)
const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
const h1s = [...html.matchAll(/<h1[\s>]/g)].length
check('Exactly one <h1> in the raw HTML', h1s === 1, `${h1s} found`)
check('<h1> carries the business name "Top Draw Projects"', /top draw projects/i.test(/<h1[\s\S]*?<\/h1>/.exec(html)?.[0] || ''))
check('<title> and og:title use "Top Draw Projects"', /<title>Top Draw Projects/.test(html) && /og:title" content="Top Draw Projects/.test(html) && /og:site_name" content="Top Draw Projects"/.test(html))
check('Hours read Monday to Friday, 08:00 to 17:00 in the page', /Monday to Friday/.test(text) && text.includes('08:00 to 17:00'))
check('Several <h2> section headings in raw HTML', [...html.matchAll(/<h2[\s>]/g)].length >= 4, `${[...html.matchAll(/<h2[\s>]/g)].length} found`)
for (const s of services) check(`Service in raw HTML: "${s.title}"`, text.includes(s.title))
check('Phone number in raw HTML', text.includes(contact.phoneDisplay))
check('Email in raw HTML', text.includes(contact.email))
check(`Service area "${contact.area}" in raw HTML`, text.includes(contact.area))
check('No "[PLACEHOLDER]" text visible', !/\[(SUBURB|INSTAGRAM URL|FACEBOOK URL|PHONE|EMAIL|AREA)\]/.test(text))
check('No %VITE_SITE_URL% in the page', !html.includes('%VITE_SITE_URL%'))
check('Hidden address stays hidden: "Florida Glen" / street / postal code appear nowhere in the page', !/florida\s*glen/i.test(html) && !/streetAddress|postalCode/.test(html))
check('No street-map credit or location marker left in the page (no OpenStreetMap, no pin)', !/OpenStreetMap|Map data/i.test(html) && !/cm-pin/.test(html))
check('<title> present', /<title>[^<]{10,}<\/title>/.test(html))
check('meta description present', /<meta name="description" content="[^"]{50,}"/.test(html))
const canon = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1]
check('Canonical link points at VITE_SITE_URL', local ? canon?.startsWith('http') : canon === `${expectedSite}/`, `canonical ${canon}, expected ${expectedSite}/`)
let ld = null
try { ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] || '') } catch {}
check('JSON-LD parses and has name, telephone, areaServed', !!(ld && ld.name && ld.telephone && ld.areaServed))
check('JSON-LD: name is Top Draw Projects, areaServed Gauteng, hours Mo-Fr 08:00-17:00, email from content.js', ld?.name === 'Top Draw Projects' && ld?.areaServed === 'Gauteng' && ld?.openingHours === 'Mo-Fr 08:00-17:00' && ld?.email === contact.email)
check('JSON-LD address is Roodepoort, Gauteng, ZA only (no street, postal code or suburb)', ld?.address?.addressLocality === 'Roodepoort' && ld?.address?.addressRegion === 'Gauteng' && ld?.address?.addressCountry === 'ZA' && !ld?.address?.streetAddress && !ld?.address?.postalCode)
const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0])
check('Every <img> has an alt attribute', imgs.every((i) => /\balt=/.test(i)), `${imgs.length} images`)

// ---- 3. Crawler files -------------------------------------------------------------------------
const robots = await get('/robots.txt')
check('/robots.txt 200', robots.status === 200)
for (const b of ['ClaudeBot', 'GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot'])
  check(`robots.txt allows ${b}`, new RegExp(`User-agent: ${b}\\s+Allow: /`).test(robots.text))
check('robots.txt references the sitemap', /^Sitemap: https?:\/\/\S+\/sitemap\.xml$/m.test(robots.text) && (local || robots.text.includes(`Sitemap: ${expectedSite}/sitemap.xml`)))
const sm = await get('/sitemap.xml')
check('/sitemap.xml 200 and is XML with a <loc>', sm.status === 200 && /<urlset/.test(sm.text) && /<loc>https?:\/\/[^<]+<\/loc>/.test(sm.text))
check('sitemap <loc> uses VITE_SITE_URL', local || sm.text.includes(`<loc>${expectedSite}/</loc>`))
const llms = await get('/llms.txt')
check('/llms.txt 200', llms.status === 200)
check('llms.txt hours: Monday to Friday, 08:00 to 17:00, closed Saturday and Sunday', /Opening hours: Monday to Friday, 08:00 to 17:00\. Closed Saturday and Sunday\./.test(llms.text))
check('llms.txt does not contain a street address', !/florida\s*glen/i.test(llms.text))
check('llms.txt names the business, phone, email and area', llms.text.startsWith('# Top Draw Projects') && llms.text.includes(contact.email) && llms.text.includes(contact.area) && /\+27\s?82\s?332\s?1112/.test(llms.text))

// ---- 4. noindex on the *.netlify.app hostname only ---------------------------------------------
if (local) {
  console.log('SKIP  X-Robots-Tag check (--local: not a netlify.app address)')
} else {
  const host = opt('netlify-host') || (new URL(base).hostname.endsWith('.netlify.app') ? new URL(base).hostname : '')
  if (!host) {
    check('X-Robots-Tag noindex on the *.netlify.app hostname', false, 'BLOCKED: this address is not a netlify.app host; pass --netlify-host=<name>.netlify.app')
  } else {
    const r = await get('/', host).catch((e) => ({ status: 0, headers: new Headers(), text: String(e) }))
    check(`${host} sends X-Robots-Tag: noindex`, (r.headers.get('x-robots-tag') || '').toLowerCase().includes('noindex'), `got "${r.headers.get('x-robots-tag')}" (status ${r.status})`)
  }
}

// ---- 5. Lighthouse (mobile) --------------------------------------------------------------------
if (!flag('skip-lighthouse')) {
  const dir = resolve('lighthouse-reports')
  mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const out = resolve(dir, `lh-${stamp}`)
  const chromePaths = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe']
  const chrome = process.env.CHROME_PATH || chromePaths.find(existsSync)
  console.log(`\nRunning Lighthouse (mobile) on ${base} ...`)
  // shell: true on Windows splits on spaces, so quote anything that can contain one.
  const q = (s) => `"${s}"`
  const run = spawnSync(
    'npx',
    ['--yes', 'lighthouse', q(`${base}/`), '--form-factor=mobile', '--only-categories=performance,seo', '--output=json', '--output=html', `--output-path=${q(out)}`, '--chrome-flags="--headless=new --no-sandbox"', '--quiet'],
    { stdio: 'inherit', shell: true, env: { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) } },
  )
  const jsonPath = `${out}.report.json`
  if (run.status !== 0 || !existsSync(jsonPath)) {
    check('Lighthouse ran', false, 'see output above')
  } else {
    const lh = JSON.parse(readFileSync(jsonPath, 'utf8'))
    const A = lh.audits
    console.log(`\nReports saved in ${dir}  (open ${out}.report.html)`)
    console.log(`\n=== Scores: Performance ${Math.round(lh.categories.performance.score * 100)}  |  SEO ${Math.round(lh.categories.seo.score * 100)}`)
    if (!local && /netlify\.app$/.test(new URL(base).hostname)) console.log('(SEO on a *.netlify.app address stays low on purpose: the noindex header is intentional.)')

    console.log('\n=== SEO audits (all)')
    for (const ref of lh.categories.seo.auditRefs) {
      const a = A[ref.id]
      const s = a.scoreDisplayMode === 'notApplicable' ? 'N/A ' : a.scoreDisplayMode === 'manual' ? 'MANUAL' : a.score === 1 ? 'PASS' : a.score === null ? 'INFO' : 'FAIL'
      console.log(`${s.padEnd(6)} ${a.title}${a.displayValue ? ` [${a.displayValue}]` : ''}`)
      if (s === 'FAIL' && a.details?.items?.length) console.log('       items:', JSON.stringify(a.details.items).slice(0, 1500))
    }

    console.log('\n=== Core Web Vitals and key metrics')
    const rows = [['first-contentful-paint', 'FCP'], ['largest-contentful-paint', 'LCP'], ['total-blocking-time', 'TBT'], ['cumulative-layout-shift', 'CLS'], ['speed-index', 'Speed Index'], ['interactive', 'TTI']]
    console.log('Metric'.padEnd(14) + 'Value'.padEnd(12) + 'Score')
    for (const [id, label] of rows) if (A[id]) console.log(label.padEnd(14) + String(A[id].displayValue ?? '').padEnd(12) + (A[id].score === null ? '-' : Math.round(A[id].score * 100)))

    console.log('\n=== Opportunities and insights with nonzero savings')
    let any = false
    for (const ref of lh.categories.performance.auditRefs) {
      const a = A[ref.id]
      const ms = a.details?.overallSavingsMs || a.metricSavings?.LCP || a.metricSavings?.FCP || a.metricSavings?.TBT || 0
      const bytes = a.details?.overallSavingsBytes || 0
      if (a.scoreDisplayMode !== 'notApplicable' && (ms > 0 || bytes > 0 || Object.values(a.metricSavings || {}).some((v) => v > 0))) {
        any = true
        console.log(`- ${a.title}  savings: ${ms ? `${Math.round(ms)} ms` : ''}${bytes ? ` ${Math.round(bytes / 1024)} KiB` : ''} ${JSON.stringify(a.metricSavings || {})}`)
        if (a.details?.items?.length) console.log('    items:', JSON.stringify(a.details.items).slice(0, 1200))
      }
    }
    if (!any) console.log('(none)')

    console.log('\n=== Performance audits flagged failing with no displayed value (raw details.items)')
    let flagged = false
    for (const ref of lh.categories.performance.auditRefs) {
      const a = A[ref.id]
      if (a.score !== null && a.score < 0.9 && a.scoreDisplayMode === 'numeric' || (a.score !== null && a.score < 1 && a.scoreDisplayMode === 'binary')) {
        if (!a.displayValue) {
          flagged = true
          console.log(`- ${a.title} (score ${a.score})`)
          console.log('    details.items:', JSON.stringify(a.details?.items ?? null).slice(0, 2500))
        }
      }
    }
    if (!flagged) console.log('(none)')
  }
}

console.log(`\n${failures ? `${failures} CHECK(S) FAILED` : 'ALL CHECKS PASSED'}`)
process.exitCode = failures ? 1 : 0 // not process.exit(): lets open sockets close cleanly on Windows
