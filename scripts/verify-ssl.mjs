// Run ONLY once the custom domain is live. Checks the certificate and the redirects.
//
//   node scripts/verify-ssl.mjs <domain>        e.g. node scripts/verify-ssl.mjs topdraw.co.za
//
//   - certificate is valid, trusted, covers the domain and www, and has more than 14 days left
//   - TLS 1.2 or newer
//   - http:// redirects to https://
//   - www and the bare domain end up on one address (the one in VITE_SITE_URL)
//   - HSTS header present (warning only)
import { connect } from 'node:tls'
import { loadEnv } from 'vite'

const domain = (process.argv[2] || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')
if (!domain) {
  console.error('Usage: node scripts/verify-ssl.mjs <domain>')
  process.exit(2)
}
const env = loadEnv('production', process.cwd(), 'VITE_')
const site = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || '').replace(/\/+$/, '')
let failures = 0
const ok = (name, pass, detail = '') => {
  if (!pass) failures++
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` (${detail})` : ''}`)
}

const cert = (host) =>
  new Promise((res) => {
    const s = connect({ host, port: 443, servername: host, minVersion: 'TLSv1.2' }, () => {
      res({ authorized: s.authorized, error: s.authorizationError, cert: s.getPeerCertificate(), protocol: s.getProtocol() })
      s.end()
    })
    s.on('error', (e) => res({ authorized: false, error: String(e), cert: {}, protocol: '' }))
    s.setTimeout(10000, () => (s.destroy(), res({ authorized: false, error: 'timeout', cert: {}, protocol: '' })))
  })

for (const host of [domain, `www.${domain}`]) {
  const c = await cert(host)
  const days = c.cert.valid_to ? Math.floor((new Date(c.cert.valid_to) - Date.now()) / 86400000) : -1
  ok(`${host}: certificate trusted`, c.authorized, c.error || c.cert.issuer?.O)
  ok(`${host}: more than 14 days of validity left`, days > 14, `${days} days, expires ${c.cert.valid_to}`)
  ok(`${host}: TLS 1.2 or newer`, /TLSv1\.[23]/.test(c.protocol), c.protocol)
}

const head = async (url) => {
  try {
    return await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'topdraw-verify-ssl/1.0' } })
  } catch (e) {
    return { status: 0, headers: new Headers(), error: String(e) }
  }
}
const loc = (r) => r.headers.get('location') || ''

const http = await head(`http://${domain}/`)
ok('http:// redirects to https://', [301, 302, 307, 308].includes(http.status) && loc(http).startsWith('https://'), `${http.status} -> ${loc(http)}`)

const finalHost = site ? new URL(site).hostname : domain
for (const host of [domain, `www.${domain}`]) {
  let url = `https://${host}/`
  let r = await head(url)
  let hops = 0
  while ([301, 302, 307, 308].includes(r.status) && hops++ < 4) {
    url = new URL(loc(r), url).href
    r = await head(url)
  }
  ok(`https://${host}/ ends on ${finalHost} with 200`, new URL(url).hostname === finalHost && r.status === 200, `ended on ${url} (${r.status})`)
}

const main = await head(`https://${finalHost}/`)
const hsts = main.headers.get('strict-transport-security')
console.log(`${hsts ? 'PASS' : 'WARN'}  HSTS header ${hsts ? `present (${hsts})` : 'missing (optional, recommended once HTTPS is confirmed)'}`)

console.log(`\n${failures ? `${failures} CHECK(S) FAILED` : 'ALL SSL CHECKS PASSED'}`)
process.exit(failures ? 1 : 0)
