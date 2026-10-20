// Run ONLY once the custom domain is live AND VITE_SITE_URL has been changed to it and redeployed.
//
//   node scripts/verify-domain.mjs https://topdraw.co.za
//
// Confirms the go-live switch is complete: every address in the page and the crawler files uses the
// final domain, nothing mentions the temporary *.netlify.app address, and the custom domain is NOT
// marked noindex. Then runs scripts/verify.mjs (build commit, raw-HTML content, crawler files,
// Lighthouse) against the domain.
import { spawnSync } from 'node:child_process'
import { loadEnv } from 'vite'

const site = (process.argv[2] || '').replace(/\/+$/, '')
if (!/^https:\/\/[^/]+$/.test(site)) {
  console.error('Usage: node scripts/verify-domain.mjs https://<final-domain>')
  process.exit(2)
}
const host = new URL(site).hostname
const env = loadEnv('production', process.cwd(), 'VITE_')
const configured = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || '').replace(/\/+$/, '')
let failures = 0
const ok = (name, pass, detail = '') => {
  if (!pass) failures++
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` (${detail})` : ''}`)
}
const get = async (path) => {
  const r = await fetch(`${site}${path}`, { redirect: 'follow', headers: { 'User-Agent': 'topdraw-verify-domain/1.0' } })
  return { status: r.status, headers: r.headers, text: await r.text() }
}

ok('VITE_SITE_URL is set to the final domain', configured === site, `VITE_SITE_URL is "${configured}"`)
ok('Domain is not a *.netlify.app address', !host.endsWith('.netlify.app'))

const home = await get('/')
ok('Home page 200', home.status === 200, `status ${home.status}`)
ok('NO X-Robots-Tag noindex on the custom domain', !(home.headers.get('x-robots-tag') || '').toLowerCase().includes('noindex'), `header: ${home.headers.get('x-robots-tag')}`)
ok('No <meta name="robots" content="noindex">', !/<meta[^>]+name="robots"[^>]+noindex/i.test(home.text))
const find = (re) => re.exec(home.text)?.[1]
ok('canonical = final domain', find(/<link rel="canonical" href="([^"]+)"/) === `${site}/`)
ok('og:url = final domain', find(/<meta property="og:url" content="([^"]+)"/) === `${site}/`)
ok('og:image on final domain', (find(/<meta property="og:image" content="([^"]+)"/) || '').startsWith(`${site}/`))
ok('JSON-LD url on final domain', home.text.includes(`"url": "${site}/"`))
ok('No netlify.app address in the page', !/netlify\.app/i.test(home.text))
ok('No %VITE_SITE_URL% in the page', !home.text.includes('%VITE_SITE_URL%'))

const robots = await get('/robots.txt')
ok('robots.txt references the sitemap on the final domain', robots.text.includes(`Sitemap: ${site}/sitemap.xml`))
ok('robots.txt does not block the site', !/^\s*Disallow:\s*\/\s*$/m.test(robots.text))
const sm = await get('/sitemap.xml')
ok('sitemap.xml lists the final domain', sm.status === 200 && sm.text.includes(`<loc>${site}/</loc>`) && !/netlify\.app/.test(sm.text))
const llms = await get('/llms.txt')
ok('llms.txt uses the final domain', llms.status === 200 && llms.text.includes(site) && !/netlify\.app/.test(llms.text))

console.log(`\n${failures ? `${failures} DOMAIN CHECK(S) FAILED` : 'ALL DOMAIN CHECKS PASSED'}\n`)
console.log('Running the full verification against the domain ...\n')
const full = spawnSync('node', ['scripts/verify.mjs', site], { stdio: 'inherit', shell: true })
process.exit(failures || full.status ? 1 : 0)
