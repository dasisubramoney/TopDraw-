// Exports the hero poster: the first frame of the intro video (the empty room the intro starts from),
// as WebP at the sizes the hero needs. Run it again if the intro video is ever replaced:
//   node scripts/build-hero-poster.mjs
// Needs Google Chrome (CHROME_PATH, or the usual Windows / macOS / Linux locations). No npm packages: Chrome
// decodes the video and encodes the WebP. The mobile poster comes from intro-mobile.mp4 (720 x 720, used
// under 768 px) and the desktop poster from intro-desktop.webm (1920 x 1080), the files that actually play.
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, extname } from 'node:path'

const root = resolve('public')
const TIME = 0 // seconds into the video: the frame the intro starts on
const jobs = [
  { video: '/video/intro-mobile.mp4', prefix: 'hero-poster-m', widths: [480, 720], quality: 0.72 },
  { video: '/video/intro-desktop.webm', prefix: 'hero-poster-d', widths: [960, 1440, 1920], quality: 0.7 },
]

const chromePath = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => p && existsSync(p))
if (!chromePath) throw new Error('Chrome not found: set CHROME_PATH')

const types = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.html': 'text/html' }
const server = createServer((req, res) => {
  if (req.url === '/') { res.setHeader('content-type', 'text/html'); return res.end('<!doctype html><title>poster</title>') }
  const file = join(root, decodeURIComponent(req.url.split('?')[0]))
  if (!file.startsWith(root) || !existsSync(file)) { res.statusCode = 404; return res.end() }
  const buf = readFileSync(file)
  const total = buf.length
  const range = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '')
  res.setHeader('content-type', types[extname(file)] || 'application/octet-stream')
  res.setHeader('accept-ranges', 'bytes')
  if (range) {
    const start = Number(range[1]), end = range[2] ? Number(range[2]) : total - 1
    res.statusCode = 206
    res.setHeader('content-range', `bytes ${start}-${end}/${total}`)
    return res.end(buf.subarray(start, end + 1))
  }
  res.end(buf)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const serverPort = server.address().port

const port = 9373
const profile = mkdtempSync(join(tmpdir(), 'poster-'))
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let targets
for (let i = 0; i < 60; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.length) break } catch {} await sleep(250) }
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) } }
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
const run = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400))
  return r.result.result.value
}
await send('Runtime.enable'); await send('Page.enable')
await send('Page.navigate', { url: `http://127.0.0.1:${serverPort}/` }); await sleep(500)

try {
  for (const job of jobs) {
    const dims = await run(`(async () => {
      const v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.src = '${job.video}'; window.__v = v
      await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = () => rej(new Error('video error')) })
      await new Promise((res) => { v.onseeked = res; v.currentTime = ${TIME} })
      await new Promise((r) => requestAnimationFrame(r))
      return { w: v.videoWidth, h: v.videoHeight }
    })()`)
    for (const w of job.widths) {
      const h = Math.round((w * dims.h) / dims.w)
      const b64 = await run(`new Promise((res) => {
        const c = document.createElement('canvas'); c.width = ${w}; c.height = ${h}
        const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(window.__v, 0, 0, ${w}, ${h})
        c.toBlob((b) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(b) }, 'image/webp', ${job.quality})
      })`)
      const out = `public/images/${job.prefix}-${w}.webp`
      writeFileSync(out, Buffer.from(b64, 'base64'))
      console.log(`${out}  ${w}x${h}  ${(Buffer.from(b64, 'base64').length / 1024).toFixed(1)} KB`)
    }
  }
} finally {
  ws.close(); chrome.kill(); server.close()
}
