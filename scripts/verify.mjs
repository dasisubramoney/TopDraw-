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
//
// The commit check fetches /build-commit.txt with a unique ?v= query string (and no-cache request headers), and once
// more without the query string to compare. The query string gets past browser and intermediate caches but NOT
// Netlify's own edge, which ignores query strings for static files (measured: unique query strings were served as
// cache hits). A mismatch is retried 5 times, VERIFY_RETRY_DELAY_MS apart (default 15000). If it still fails, the
// script prints a diagnosis, calls the Netlify API for the published deploy when NETLIFY_AUTH_TOKEN is set, reports
// nothing else and exits non-zero.
//
// After Lighthouse, any SEO audit scoring below 1 fails the run. The one exception is `is-crawlable`, and only on a
// *.netlify.app host, where the site-wide noindex is intentional until go-live. If a failing audit's reason says
// "Timed out" (Lighthouse's own fetch of a resource timed out), the whole Lighthouse run is repeated once and the gate
// is judged on the second run only. No other failure is ever re-run.
//
// Inputs that exist only so the script itself can be tested (never needed in normal use):
//   VERIFY_TEST_LOCAL_HEAD=<sha>           pretend this is the local git HEAD (prints a warning when set)
//   --lighthouse-json=<report.json>        judge a saved Lighthouse report instead of running Lighthouse
//   --lighthouse-rerun-json=<report.json>  what the one allowed re-run "produces" (default: the same saved report)
//   VERIFY_NETLIFY_API=<url>               Netlify API base URL. Only honoured for localhost, 127.0.0.1 or
//                                          api.netlify.com (https); anything else is ignored with a warning, so the
//                                          token can never be sent to another host. Default https://api.netlify.com/api/v1
//
// The script never calls process.exit(): it sets process.exitCode and lets the event loop drain, because exiting
// with sockets still closing crashes Node on Windows ("Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)").
import { execSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const NETLIFY_SITE_ID = 'ca761055-fa39-49c6-9361-f0d82f33a930'
// Where the Netlify API token may be sent: Netlify itself (https only), or this machine (for tests).
const NETLIFY_API = (() => {
  const fallback = 'https://api.netlify.com/api/v1'
  const raw = process.env.VERIFY_NETLIFY_API
  if (!raw) return fallback
  let host = 'not a valid URL'
  try {
    const u = new URL(raw)
    host = u.host
    const loopback = u.hostname === 'localhost' || u.hostname === '127.0.0.1'
    if ((u.hostname === 'api.netlify.com' && u.protocol === 'https:') || (loopback && /^https?:$/.test(u.protocol))) return raw.replace(/\/+$/, '')
  } catch {}
  console.warn(`WARNING  VERIFY_NETLIFY_API (${host}) is ignored: it must be localhost, 127.0.0.1 or https://api.netlify.com. Using ${fallback}. The Netlify token is never sent anywhere else.`)
  return fallback
})()
const COMMIT_RETRIES = 5
const RETRY_DELAY_MS = Number.isFinite(Number(process.env.VERIFY_RETRY_DELAY_MS)) && process.env.VERIFY_RETRY_DELAY_MS !== '' ? Number(process.env.VERIFY_RETRY_DELAY_MS) : 15000

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split('=').slice(1).join('=')
const base = (args.find((a) => /^https?:\/\//.test(a)) || '').replace(/\/+$/, '')
const local = flag('local')
let failures = 0
let stopped = false // the commit check failed or the usage was wrong: no summary line is printed

// Everything down to the closing brace of `main` is one labelled block, so that a failed commit check can `break main`
// instead of calling process.exit(). The block is deliberately not indented, to keep this change reviewable.
main: {
if (!base) {
  console.error('Usage: node scripts/verify.mjs <site-url> [--netlify-host=<host>] [--local] [--skip-lighthouse]')
  process.exitCode = 2
  stopped = true
  break main
}

const env = loadEnv('production', process.cwd(), 'VITE_')
const expectedSite = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || '').replace(/\/+$/, '')
const { contact, services } = await import(pathToFileURL(resolve('src/content.js')).href)

// Words that must never appear on the public site (the workshop suburb, for one). They are read from
// .hidden-terms, an untracked, gitignored file, so this repository never names them. One term per line;
// blank lines and lines starting with # are ignored. Without the file, only streetAddress and postalCode
// are checked, and the script says so.
const hiddenTerms = existsSync(resolve('.hidden-terms'))
  ? readFileSync(resolve('.hidden-terms'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  : []
const hiddenRe = hiddenTerms.length
  ? new RegExp(hiddenTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*')).join('|'), 'i')
  : null
const hiddenNote = hiddenRe ? '' : '.hidden-terms not found: only streetAddress and postalCode were checked'
const hasHiddenTerm = (s) => (hiddenRe ? hiddenRe.test(s) : false)

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
if (process.env.VERIFY_TEST_LOCAL_HEAD) {
  localHead = process.env.VERIFY_TEST_LOCAL_HEAD
  console.warn(`WARNING  VERIFY_TEST_LOCAL_HEAD is set: pretending the local HEAD is ${localHead}. This is for testing this script only.`)
}
const dirty = (() => {
  try { return execSync('git status --porcelain', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().length > 0 } catch { return false }
})()

// /build-commit.txt. `bust` adds a unique query string, which gets past browser and intermediate caches but not
// Netlify's edge (it ignores the query string). Both kinds of fetch send no-cache request headers, so the query
// string is the only difference between the two.
const COMMIT_HEADERS = ['age', 'cache-status', 'cache-control', 'etag', 'x-nf-request-id']
const fetchCommit = async (bust) => {
  const url = `${base}/build-commit.txt${bust ? `?v=${Date.now()}-${Math.random().toString(36).slice(2, 10)}` : ''}`
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'topdraw-verify/1.0', 'Cache-Control': 'no-cache', Pragma: 'no-cache' } })
    const body = (await r.text()).trim().slice(0, 64)
    return { url, status: r.status, commit: r.status === 200 ? body : '', headers: Object.fromEntries(COMMIT_HEADERS.map((h) => [h, r.headers.get(h) ?? '-'])) }
  } catch (e) {
    return { url, status: 0, commit: '', headers: {}, error: String(e?.cause?.code || e?.message || e) }
  }
}
const short = (c) => (c ? c.slice(0, 7) : '(none)')
const describe = (r) => (r.status === 200 ? short(r.commit) : `(none: HTTP ${r.status}${r.error ? ` ${r.error}` : ''})`)
const headerLine = (r) => COMMIT_HEADERS.map((h) => `${h}=${r.headers[h] ?? '-'}`).join('  ')
const fetchFailure = (r) => (r.status === 0 ? r.error || 'no response' : `HTTP ${r.status}`)

let plain = await fetchCommit(false)
let busted = await fetchCommit(true)
const attemptLine = (label) => console.log(`Commit check (${label}): cache-busted ${describe(busted)}, local HEAD ${short(localHead)}: ${busted.commit === localHead ? 'match' : 'no match'}`)
attemptLine('attempt 1')
let retries = 0
while (localHead && busted.commit !== localHead && retries < COMMIT_RETRIES) {
  retries++
  console.log(`  waiting ${RETRY_DELAY_MS / 1000} s, then retry ${retries} of ${COMMIT_RETRIES} ...`)
  await sleep(RETRY_DELAY_MS)
  busted = await fetchCommit(true)
  attemptLine(`retry ${retries} of ${COMMIT_RETRIES}`)
}
if (!localHead || busted.commit !== localHead) {
  const bar = '#'.repeat(78)
  const plainNow = retries ? await fetchCommit(false) : plain // a fresh plain fetch: the retries took a while
  console.error(`\n${bar}\nSTALE OR UNVERIFIABLE BUILD: stopping. No other result below would describe your current code.\n`)
  console.error(`  local git HEAD       : ${localHead || '(could not read)'}`)
  console.error(`  cache-busted deployed: ${describe(busted)}   (${busted.url.replace(base, '')})`)
  console.error(`  plain URL deployed   : ${describe(plainNow)}   (/build-commit.txt)`)
  console.error('\n  Response headers')
  console.error(`    cache-busted: ${headerLine(busted)}`)
  console.error(`    plain       : ${headerLine(plainNow)}`)
  if (localHead) {
    // The two commits can only be compared if both fetches succeeded (HTTP 200); otherwise say which one failed.
    const failedFetches = [['cache-busted', busted], ['plain', plainNow]].filter(([, r]) => r.status !== 200)
    if (failedFetches.length) {
      for (const [name, r] of failedFetches) console.error(`\n  DIAGNOSIS: could not compare: the ${name} fetch failed (${fetchFailure(r)})`)
    } else {
      // Netlify's edge cannot produce the "cached copy" case: it ignores the query string for static files, so the plain
      // and cache-busted URLs are answered from one cache entry. A difference can only come from a browser or an
      // intermediate cache. By the same token, the two URLs agreeing says nothing about caching either way.
      console.error(
        plainNow.commit !== busted.commit
          ? `\n  DIAGNOSIS: cached copy. The plain URL returns ${describe(plainNow)} but the cache-busted URL returns ${describe(busted)} (your HEAD is ${short(localHead)}). A browser or intermediate cache is answering one of them; Netlify's own edge serves both from one entry.`
          : '\n  DIAGNOSIS: wrong deploy published (most likely). Netlify purges its edge cache on publish, and the cache-buster cannot bypass Netlify\'s edge, so the two URLs agreeing is not evidence either way.',
      )
    }
  }
  if (process.env.NETLIFY_AUTH_TOKEN) {
    try {
      const r = await fetch(`${NETLIFY_API}/sites/${NETLIFY_SITE_ID}`, { signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${process.env.NETLIFY_AUTH_TOKEN}`, 'User-Agent': 'topdraw-verify/1.0' } })
      if (!r.ok) {
        console.error(`\n  Netlify API: HTTP ${r.status} for site ${NETLIFY_SITE_ID} (is NETLIFY_AUTH_TOKEN valid?)`)
      } else {
        const d = (await r.json()).published_deploy || {}
        console.error(`\n  Netlify, published deploy for site ${NETLIFY_SITE_ID}:`)
        console.error(`    deploy id : ${d.id ?? '(none)'}`)
        console.error(`    created   : ${d.created_at ?? '(unknown)'}`)
        console.error(`    commit_ref: ${d.commit_ref ?? '(none: a manual deploy has no commit)'}`)
        console.error(`    deploys locked: ${d.locked === undefined ? 'unknown (not in the API response)' : d.locked ? 'yes' : 'no'}`)
      }
    } catch (e) {
      console.error(`\n  Netlify API could not be reached: ${String(e?.cause?.code || e?.message || e)}`)
    }
  } else {
    console.error('\n  Check Netlify > Deploys: which deploy is Published, and is it the one you just ran? Re-lock only from a freshly reloaded page.')
  }
  console.error('\n  Rebuild and redeploy from this commit (or commit your changes first), then run this again.')
  console.error(`${bar}\n`)
  process.exitCode = 1
  stopped = true
  break main
}
if (retries) plain = await fetchCommit(false) // a fresh plain fetch, as on the mismatch path: the retries took a while, so the attempt-1 one is stale
console.log(`PASS  Deployed build is current: ${busted.commit.slice(0, 7)} matches local HEAD${retries ? ` (after ${retries} retr${retries === 1 ? 'y' : 'ies'})` : ''}`)
console.log(`      cache-busted: ${headerLine(busted)}`)
console.log(`      plain       : ${describe(plain)}  ${headerLine(plain)}`)
// Only compare when both fetches returned 200: a failed plain fetch tells us nothing about caching.
if (plain.status === 200 && plain.commit !== busted.commit) console.warn(`NOTE  The plain /build-commit.txt URL returns ${describe(plain)}, not ${short(localHead)}: a browser or intermediate cache is answering one of the two fetches.`)
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
check('Hidden address stays hidden: no workshop suburb, street or postal code anywhere in the page', !hasHiddenTerm(html) && !/streetAddress|postalCode/.test(html), hiddenNote)
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
check('llms.txt does not contain a street address', !hasHiddenTerm(llms.text) && !/streetAddress|postalCode/.test(llms.text), hiddenNote)
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
  const savedReport = opt('lighthouse-json')
  const savedRerun = opt('lighthouse-rerun-json') || savedReport // test inputs: what each run "produces"

  // One Lighthouse run (n = 1, or 2 for the single allowed re-run). Returns the parsed report, or lh: null if the run
  // did not produce one.
  const runLighthouse = (n) => {
    const out = resolve(dir, `lh-${stamp}${n > 1 ? '-rerun' : ''}`)
    let jsonPath = `${out}.report.json`
    let run = { status: 0 }
    const saved = n > 1 ? savedRerun : savedReport
    if (saved) {
      jsonPath = resolve(saved)
      console.log(`\nUsing the saved Lighthouse report ${jsonPath} (test mode: Lighthouse is not run${n > 1 ? ', as the re-run' : ''})`)
    } else {
      const chromePaths = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe']
      const chrome = process.env.CHROME_PATH || chromePaths.find(existsSync)
      console.log(`\nRunning Lighthouse (mobile) on ${base} ...`)
      const lhFlags = ['--form-factor=mobile', '--only-categories=performance,seo', '--output=json', '--output=html', '--quiet']
      const lhEnv = { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) }
      // Passing an args array together with shell: true is deprecated (DEP0190). With Lighthouse installed in
      // node_modules, run its CLI script with this Node and no shell; otherwise run one command string through npx.
      const lhPkgPath = fileURLToPath(new URL('../node_modules/lighthouse/package.json', import.meta.url))
      let lhCli = null
      if (existsSync(lhPkgPath)) {
        try {
          const bin = JSON.parse(readFileSync(lhPkgPath, 'utf8')).bin
          const rel = typeof bin === 'string' ? bin : bin?.lighthouse
          if (rel) lhCli = resolve(dirname(lhPkgPath), rel)
        } catch {}
      }
      if (lhCli) {
        console.log(`Lighthouse path: installed copy (${lhCli}), run with node, no shell`)
        run = spawnSync(process.execPath, [lhCli, `${base}/`, ...lhFlags, `--output-path=${out}`, '--chrome-flags=--headless=new --no-sandbox'], { stdio: 'inherit', env: lhEnv })
      } else {
        console.log('Lighthouse path: not installed in node_modules, so one command string through npx with a shell (no args array)')
        // The shell splits on spaces, so quote anything that can contain one.
        const q = (s) => `"${s}"`
        run = spawnSync(`npx --yes lighthouse ${q(`${base}/`)} ${lhFlags.join(' ')} --output-path=${q(out)} --chrome-flags="--headless=new --no-sandbox"`, { stdio: 'inherit', shell: true, env: lhEnv })
      }
    }
    if (run.status !== 0 || !existsSync(jsonPath)) return { lh: null, out, saved }
    return { lh: JSON.parse(readFileSync(jsonPath, 'utf8')), out, saved }
  }

  // SEO gate rules: every audit in the SEO category must score 1. Audits with no score (manual, informative, not
  // applicable) cannot fail. The one exception is `is-crawlable`, and only on a *.netlify.app host, where the site-wide
  // noindex is intentional until go-live. On any other host nothing is exempt.
  const exemptHost = new URL(base).hostname.endsWith('.netlify.app')
  const reasonFor = (a) => [a.explanation, a.errorMessage, a.displayValue, a.details?.items?.length ? JSON.stringify(a.details.items).slice(0, 300) : ''].filter(Boolean).join(' | ') || 'no further detail in the report'
  const seoGate = (report) => {
    const failing = []
    const exempt = []
    for (const ref of report.categories.seo.auditRefs) {
      const a = report.audits[ref.id]
      if (a.score === null || a.score === undefined || a.score >= 1) continue
      const f = { id: ref.id, title: a.title, score: a.score, reason: reasonFor(a) }
      ;(exemptHost && ref.id === 'is-crawlable' ? exempt : failing).push(f)
    }
    return { failing, exempt }
  }
  const perf = (report) => Math.round(report.categories.performance.score * 100)

  let result = runLighthouse(1)
  if (result.lh) {
    // Lighthouse fetches robots.txt and the like itself, and that fetch sometimes times out. That is the only failure
    // worth one more run; anything else is a real finding and is not re-run.
    const timedOut = seoGate(result.lh).failing.filter((f) => /timed out/i.test(f.reason)).map((f) => f.id)
    if (timedOut.length) {
      const first = result.lh
      console.log(`\nLighthouse run 1: Performance ${perf(first)} | SEO ${Math.round(first.categories.seo.score * 100)}`)
      console.log(`Lighthouse re-run 1 of 1: previous run timed out on ${timedOut.join(', ')}`)
      result = runLighthouse(2)
      console.log(`Lighthouse Performance, both runs: run 1 = ${perf(first)}, run 2 = ${result.lh ? perf(result.lh) : 'no report'}`)
    }
  }
  if (!result.lh) {
    check('Lighthouse ran', false, 'see output above')
  } else {
    const lh = result.lh
    const A = lh.audits
    if (!result.saved) console.log(`\nReports saved in ${dir}  (open ${result.out}.report.html)`)
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

    // SEO gate, judged on this (the final) run only. See `seoGate` above for the rules.
    console.log('\n=== SEO gate (every SEO audit must score 1)')
    const gate = seoGate(lh)
    for (const f of gate.exempt) console.log(`NOTE  SEO audit "${f.id}" is exempt on a *.netlify.app host (noindex is intentional until go-live): ${f.title} | ${f.reason}`)
    for (const f of gate.failing) check(`SEO gate: audit "${f.id}" scores 1`, false, `${f.title} | score ${f.score} | ${f.reason}`)
    if (!gate.failing.length) check(`SEO gate: every SEO audit scores 1${exemptHost ? ' (is-crawlable exempt on *.netlify.app)' : ''}`, true)
  }
}

} // end of `main`
if (!stopped) {
  console.log(`\n${failures ? `${failures} CHECK(S) FAILED` : 'ALL CHECKS PASSED'}${!failures && flag('skip-lighthouse') ? ' (Lighthouse and its SEO gate were skipped: --skip-lighthouse)' : ''}`)
  process.exitCode = failures ? 1 : 0
}
