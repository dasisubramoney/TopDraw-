// Technical cross-sections for the Trevor section: steel box section, balustrade,
// timber door edge. Stroke-only, drafting conventions: 45° hatching for steel,
// grain lines (with one knot) for timber. Each element carries a data attribute the
// animation in Trevor.jsx uses:
//   data-outline   object outlines            (drawn with stroke-dashoffset)
//   data-hatch     hatch / grain lines        (swept in left to right)
//   data-from      stage 3 only: the straight diagonal each grain line starts as
//   data-dim-line  dimension and leader lines (drawn from the centre outward)
//   data-mark      arrowheads, extension lines, dots, knot
//   data-label     mono labels
// The markup is always the finished drawing, so it reads without JavaScript.

const INK = '#222222'
const RULE = '#D2C9BC'
const STEEL = '#353A92'
const W = 640
const H = 440

const f = (n) => Math.round(n * 10) / 10

// 45° hatch lines covering a box; the drawing clips them to the section.
function hatchLines(x, y, w, h, gap) {
  const lines = []
  for (let s = x - h; s <= x + w; s += gap) lines.push(`M${f(s)} ${f(y + h)} L${f(s + h)} ${f(y)}`)
  return lines
}

// Timber grain: gently wavy lines along the length, pushed apart around a knot.
const KNOT = { x: 440, y: 236 }
function grainLine(i, y) {
  const pts = []
  for (let x = 96; x <= 540; x += 8) {
    const wave = 1.6 * Math.sin(x / 37 + i * 1.3)
    const pull = Math.exp(-(((x - KNOT.x) / 36) ** 2)) * Math.exp(-(((y - KNOT.y) / 22) ** 2))
    const push = (y >= KNOT.y ? 1 : -1) * 11 * pull
    pts.push(`${f(x)} ${f(y + wave + push)}`)
  }
  return `M${pts.join(' L')}`
}
const GRAIN = Array.from({ length: 9 }, (_, i) => {
  const y = 196 + i * 7.6
  const x0 = 112 + i * 48
  return { d: grainLine(i, y), from: `M${x0} 262 L${x0 + 72} 190` }
})

// A dimension: two half-lines from the centre to each arrowhead, extension lines, label.
function Dim({ x1, y1, x2, y2, ext = [], label, lx, ly, rotate, anchor = 'middle', primary }) {
  const color = primary ? STEEL : RULE
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const len = Math.hypot(x2 - x1, y2 - y1)
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const a = 7
  const head = (x, y, dx, dy) =>
    `M${f(x)} ${f(y)} L${f(x - dx * a - dy * a * 0.38)} ${f(y - dy * a + dx * a * 0.38)} L${f(x - dx * a + dy * a * 0.38)} ${f(y - dy * a - dx * a * 0.38)} Z`
  return (
    <g data-dim={primary ? 'primary' : ''}>
      {ext.map((d) => (
        <path key={d} d={d} stroke={RULE} strokeWidth="1" fill="none" data-mark />
      ))}
      <path d={`M${f(mx)} ${f(my)} L${x1} ${y1}`} pathLength="1" stroke={color} strokeWidth="1.25" fill="none" data-dim-line />
      <path d={`M${f(mx)} ${f(my)} L${x2} ${y2}`} pathLength="1" stroke={color} strokeWidth="1.25" fill="none" data-dim-line />
      <path d={head(x1, y1, -ux, -uy)} fill={color} data-mark />
      <path d={head(x2, y2, ux, uy)} fill={color} data-mark />
      <text
        x={lx}
        y={ly}
        textAnchor={anchor}
        transform={rotate ? `rotate(-90 ${lx} ${ly})` : undefined}
        className="dw-label"
        data-label
      >
        {label}
      </text>
    </g>
  )
}

// A leader note: dot on the object, line to the label.
function Note({ x1, y1, x2, y2, label, lx, ly, anchor = 'start' }) {
  return (
    <g>
      <circle cx={x1} cy={y1} r="2.6" fill={INK} data-mark />
      <path d={`M${x1} ${y1} L${x2} ${y2}`} pathLength="1" stroke={INK} strokeWidth="0.9" fill="none" data-dim-line />
      <text x={lx} y={ly} textAnchor={anchor} className="dw-label" data-label>
        {label}
      </text>
    </g>
  )
}

const outline = { fill: 'none', stroke: INK, strokeWidth: 1.5, strokeLinejoin: 'round', pathLength: 1, 'data-outline': '' }
const hatchProps = { fill: 'none', stroke: INK, strokeWidth: 0.75, pathLength: 1, 'data-hatch': '' }

// 1. Stainless steel: 50 × 25 × 2.0 mm rectangular hollow section, welded corners.
function SteelBox({ id }) {
  const outer = 'M145 135 H495 V310 H145 Z'
  const inner = 'M159 149 H481 V296 H159 Z'
  const beads = [
    'M145 151 Q136 136 151 135',
    'M489 135 Q504 136 495 151',
    'M495 294 Q504 309 489 310',
    'M151 310 Q136 309 145 294',
  ]
  return (
    <g data-stage="1">
      <clipPath id={`${id}-c1`}>
        <path d={`${outer} ${inner}`} clipRule="evenodd" />
      </clipPath>
      <g clipPath={`url(#${id}-c1)`}>
        {hatchLines(145, 135, 350, 175, 9).map((d) => (
          <path key={d} d={d} {...hatchProps} />
        ))}
      </g>
      <path d={outer} {...outline} />
      <path d={inner} {...outline} />
      {beads.map((d) => (
        <path key={d} d={d} {...outline} strokeWidth={1.25} />
      ))}
      <Dim
        x1={145} y1={350} x2={495} y2={350}
        ext={['M145 316 V358', 'M495 316 V358']}
        label="50 × 25 mm" lx={320} ly={340} primary
      />
      <Note x1={152} y1={225} x2={186} y2={225} label="t = 2.0 mm" lx={192} ly={229} />
      <Note x1={388} y1={142} x2={420} y2={104} label="SS 304" lx={424} ly={100} />
    </g>
  )
}

// 2. Balustrading: Ø50 handrail on a hollow post, base plate and anchor bolts.
function Balustrade({ id }) {
  const postOuter = 'M302 376 V150 Q320 144 338 150 V376 Z'
  const postInner = 'M308 376 V156 Q320 151 332 156 V376 Z'
  const plate = 'M250 376 H390 V392 H250 Z'
  return (
    <g data-stage="2">
      <clipPath id={`${id}-c2`}>
        <path d="M362 105 A42 42 0 1 0 278 105 A42 42 0 1 0 362 105 Z M356 105 A36 36 0 1 0 284 105 A36 36 0 1 0 356 105 Z" clipRule="evenodd" />
        <path d={`${postOuter} ${postInner}`} clipRule="evenodd" />
        <path d={plate} />
      </clipPath>
      <g clipPath={`url(#${id}-c2)`}>
        {hatchLines(250, 63, 140, 329, 14).map((d) => (
          <path key={d} d={d} {...hatchProps} />
        ))}
      </g>
      <circle cx="320" cy="105" r="42" {...outline} />
      <circle cx="320" cy="105" r="36" {...outline} />
      <path d={postOuter} {...outline} />
      <path d={postInner} {...outline} />
      <path d={plate} {...outline} />
      <path d="M260 368 H276 V376 H260 Z M364 368 H380 V376 H364 Z" {...outline} strokeWidth={1.25} />
      <path d="M265 392 V430 M271 392 V430 M369 392 V430 M375 392 V430" {...outline} strokeWidth={1} />
      <path d="M170 392 H250 M390 392 H470" stroke={INK} strokeWidth="1" fill="none" data-mark />
      <path
        d="M178 392 l-8 8 M198 392 l-8 8 M218 392 l-8 8 M238 392 l-8 8 M402 392 l-8 8 M422 392 l-8 8 M442 392 l-8 8 M462 392 l-8 8"
        stroke={RULE} strokeWidth="1" fill="none" data-mark
      />
      <Dim
        x1={278} y1={105} x2={362} y2={105}
        label="Handrail Ø 50 mm" lx={320} ly={52} primary
      />
      <Dim
        x1={446} y1={63} x2={446} y2={392}
        ext={['M330 63 H454', 'M394 392 H454']}
        label="Measured on site" lx={438} ly={228} rotate
      />
    </g>
  )
}

// 3. Timber: door edge in section, rebate, edge banding, Ø35 hinge cup recess.
function DoorEdge({ id }) {
  const door =
    'M100 262 L104 250 L96 235 L104 220 L96 205 L100 190 H500 V208 H530 V262 H330 V216 Q330 212 326 212 H194 Q190 212 190 216 V262 Z'
  return (
    <g data-stage="3">
      <clipPath id={`${id}-c3`}>
        <path d={door} />
      </clipPath>
      <g clipPath={`url(#${id}-c3)`}>
        {GRAIN.map((g) => (
          <path key={g.d} d={g.d} data-from={g.from} {...hatchProps} strokeWidth={0.85} />
        ))}
        <ellipse cx={KNOT.x} cy={KNOT.y} rx="13" ry="5.5" fill="none" stroke={INK} strokeWidth="0.85" data-mark />
        <ellipse cx={KNOT.x} cy={KNOT.y} rx="5.5" ry="2.2" fill="none" stroke={INK} strokeWidth="0.85" data-mark />
      </g>
      <path d={door} {...outline} />
      <path d="M530 208 H536 V262 H530" {...outline} strokeWidth={1.25} />
      <path d="M260 198 V276" stroke={RULE} strokeWidth="1" strokeDasharray="10 3 2 3" fill="none" data-mark />
      <Dim
        x1={70} y1={190} x2={70} y2={262}
        ext={['M96 190 H62', 'M96 262 H62']}
        label="Oak veneer / 18 mm" lx={62} ly={174} anchor="start" primary
      />
      <Note x1={533} y1={248} x2={560} y2={302} label="Tolerance ± 0.5 mm" lx={600} ly={322} anchor="end" />
    </g>
  )
}

const STAGES = { 1: SteelBox, 2: Balustrade, 3: DoorEdge }

// `stages` lists which drawings to include (the pinned desktop view layers all three).
// `compact` crops the view and enlarges the labels for narrow screens.
export default function SectionDrawing({ id, stages = [1, 2, 3], compact = false, className = '' }) {
  const viewBox = compact ? '30 36 580 404' : `0 0 ${W} ${H}`
  return (
    <svg
      viewBox={viewBox}
      className={`section-drawing ${compact ? 'dw-compact' : ''} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 H0 V20" fill="none" stroke="#F5F2ED" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="-20" y="-20" width={W + 40} height={H + 40} fill={`url(#${id}-grid)`} />
      {stages.map((n) => {
        const Stage = STAGES[n]
        return <Stage key={n} id={id} />
      })}
    </svg>
  )
}
