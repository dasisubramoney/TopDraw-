// Builds public/images/gauteng-outline.svg: a plain outline of Gauteng province for the Contact section.
// It marks no place: no pin, no street, no suburb, no text.
//
// Data: Natural Earth "Admin 1 - States, Provinces" (1:10m), public domain, https://www.naturalearthdata.com
//       (no attribution required). Feature: iso_3166_2 "ZA-GT", name "Gauteng".
//
//   1. Download the GeoJSON once (about 40 MB, not kept in the repo):
//        curl -L -o ne_10m_admin_1.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson
//   2. node scripts/build-gauteng-outline.mjs ne_10m_admin_1.geojson
//
// The shape is simplified (Douglas-Peucker, about 100 m) to keep the file small, and projected with a
// plain equirectangular projection scaled by cos(latitude), which is faithful over an area this small.
import { readFileSync, writeFileSync } from 'node:fs'

const src = process.argv[2]
if (!src) {
  console.error('Usage: node scripts/build-gauteng-outline.mjs <ne_10m_admin_1_states_provinces.geojson>')
  process.exit(2)
}
const fc = JSON.parse(readFileSync(src, 'utf8'))
const f = fc.features.find((x) => x.properties.iso_3166_2 === 'ZA-GT' || (x.properties.name === 'Gauteng' && x.properties.adm0_a3 === 'ZAF'))
if (!f) throw new Error('Gauteng not found in the dataset')

const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
const all = polys.flat(2)
const lons = all.map((p) => p[0])
const lats = all.map((p) => p[1])
const lat0 = (Math.min(...lats) + Math.max(...lats)) / 2
const k = Math.cos((lat0 * Math.PI) / 180)
const proj = ([lon, lat]) => [lon * k, -lat]

// Douglas-Peucker in projected degrees.
const tol = 0.001 // about 100 m
function simplify(pts, eps) {
  if (pts.length < 3) return pts
  const [ax, ay] = pts[0]
  const [bx, by] = pts.at(-1)
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1e-12
  let max = 0
  let idx = 0
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len
    if (d > max) (max = d), (idx = i)
  }
  if (max <= eps) return [pts[0], pts.at(-1)]
  return [...simplify(pts.slice(0, idx + 1), eps).slice(0, -1), ...simplify(pts.slice(idx), eps)]
}

// A ring starts and ends on the same point, so split it at the point farthest from the start and
// simplify the two halves separately (Douglas-Peucker needs two distinct end points).
function simplifyRing(pts) {
  const open = pts.slice(0, -1)
  let m = 1
  let best = 0
  for (let i = 1; i < open.length; i++) {
    const dd = Math.hypot(open[i][0] - open[0][0], open[i][1] - open[0][1])
    if (dd > best) (best = dd), (m = i)
  }
  const first = simplify(open.slice(0, m + 1), tol)
  const second = simplify([...open.slice(m), open[0]], tol)
  return [...first.slice(0, -1), ...second.slice(0, -1)]
}
const rings = polys.map((p) => simplifyRing(p[0].map(proj))) // outer rings only
const flat = rings.flat()
const minX = Math.min(...flat.map((p) => p[0]))
const maxX = Math.max(...flat.map((p) => p[0]))
const minY = Math.min(...flat.map((p) => p[1]))
const maxY = Math.max(...flat.map((p) => p[1]))
const W = 1000
const scale = W / (maxX - minX)
const H = Math.round((maxY - minY) * scale)
const pad = 8 // room for the stroke
const tx = ([x, y]) => [(x - minX) * scale + pad, (y - minY) * scale + pad]
const d = rings
  .map((r) => 'M' + r.map(tx).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z')
  .join('')

// Area-weighted centroid of the largest ring, as a percentage of the viewBox (for the "Gauteng" label).
const big = rings.reduce((a, b) => (b.length > a.length ? b : a)).map(tx)
let A = 0, cx = 0, cy = 0
for (let i = 0; i < big.length; i++) {
  const [x0, y0] = big[i]
  const [x1, y1] = big[(i + 1) % big.length]
  const c = x0 * y1 - x1 * y0
  A += c
  cx += (x0 + x1) * c
  cy += (y0 + y1) * c
}
cx /= 3 * A
cy /= 3 * A
const VW = W + pad * 2
const VH = H + pad * 2

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}"><path d="${d}" fill="#000" fill-opacity=".1" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>\n`
writeFileSync('public/images/gauteng-outline.svg', svg)
console.log(`Gauteng outline: ${polys.length} part(s), ${flat.length} points, viewBox ${VW} x ${VH}, ${svg.length} bytes`)
console.log(`aspect ratio ${VW} / ${VH}; label centre at left ${((cx / VW) * 100).toFixed(1)}%, top ${((cy / VH) * 100).toFixed(1)}%`)
console.log(`bbox lon ${Math.min(...lons).toFixed(3)}..${Math.max(...lons).toFixed(3)}, lat ${Math.min(...lats).toFixed(3)}..${Math.max(...lats).toFixed(3)}`)
