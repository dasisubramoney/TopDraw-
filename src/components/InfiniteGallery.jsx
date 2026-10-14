import { useEffect, useRef, useState } from 'react'
import { LazyMotion, animate, cubicBezier, domMax, m, useMotionValue, wrap } from 'framer-motion'
import Picture from './Picture.jsx'

// Infinite drag gallery, adapted from a 21st.dev component ("infinite-drag-scroll", masonry
// variant). A 2 x 2 block of identical tiles sits inside a draggable layer; x and y are wrapped
// every time they change, so the photos repeat forever in every direction.
//
// Adapted for this site:
// - Drag needs framer-motion's `domMax` feature set. It is imported statically here, in the
//   gallery's own lazy chunk (the page itself only has `domAnimation`), so the drag code only
//   downloads with the portal. (A dynamic import('framer-motion') would pull all of the library
//   into the main chunks.)
// - The original turns every mouse wheel tick on the page into grid movement. Here the page
//   keeps its own scrolling: while the gallery is pinned, scrolling the page moves the grid,
//   so there is no scroll trap. Mouse users can also drag in any direction; touch users drag
//   sideways only, so a vertical swipe still scrolls the page.
// - An infinite grid always has photos running off some edge, which looks like a mistake at the
//   two moments the gallery is "at rest": when it opens and when it hands over to the next
//   section. At both, the grid is eased to an aligned resting position where every photo on
//   screen is complete and no photo touches the header or the bottom edge (see `rest`).
//   Photo sizes come from the screen height as well as its width (see .gallery in index.css)
//   so such a position exists on any window.
// - Photos are the site's own project photos. It is decorative, so it is hidden from
//   assistive tech (a screen-reader-only caption list sits beside it).

// All twelve project photos, mixed so neighbours differ.
const order = ['kitchen2', 'vanityOak', 'library', 'dining', 'newBuild', 'balustrade', 'kitchenTile', 'tallUnit', 'loftShell', 'benchFrame', 'vanityInstall', 'wardrobe']

const ease = cubicBezier(0.18, 0.71, 0.11, 1)
const item = {
  initial: { opacity: 0, scale: 0.3 },
  animate: (i) => ({
    opacity: 1,
    scale: 1,
    // Staggered, but stable between renders (no Math.random in render).
    transition: { delay: (((i * 7) % 12) / 12) * 0.7, duration: 1, ease },
  }),
}

// Pixels the grid moves per pixel the page scrolls while the gallery is pinned.
const SCROLL_RATIO = 1.1
// Share of the pinned scroll after which the grid settles into its resting position.
const SETTLE_AT = 0.78
// Smallest blue margin (px) kept above and below the photos at rest.
const MIN_MARGIN = 24

export default function InfiniteGallery({ play = false }) {
  const runway = useRef(null)
  const stage = useRef(null)
  const layer = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(any-pointer: coarse)')
    const sync = () => setCoarse(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Wrap both axes into one tile (half the layer), and re-measure when the layout changes.
  useEffect(() => {
    const el = layer.current
    let w = el.offsetWidth
    let h = el.offsetHeight
    const ro = new ResizeObserver(() => {
      w = el.offsetWidth
      h = el.offsetHeight
    })
    ro.observe(el)
    const offX = x.on('change', (v) => x.set(wrap(-(w / 2), 0, v)))
    const offY = y.on('change', (v) => y.set(wrap(-(h / 2), 0, v)))
    return () => {
      ro.disconnect()
      offX()
      offY()
    }
  }, [x, y])

  useEffect(() => {
    let last = window.scrollY
    let settled = false
    let wasPinned = false
    let moves = []

    // The aligned resting position nearest to where the grid is now, as { x, y }, or null if
    // no position shows only whole photos on this window. Layout only (offsetTop, no
    // transforms), so it is right even while the photos are still scaling in.
    const rest = () => {
      const lay = layer.current
      const tile = lay.firstElementChild
      const items = tile.children
      const cols = getComputedStyle(tile).gridTemplateColumns.split(' ').length
      const rows = items.length / cols
      const gap = parseFloat(getComputedStyle(tile).rowGap)
      const pitch = items[cols].offsetTop - items[0].offsetTop
      const band = pitch - gap
      const hdr = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0
      const avail = stage.current.clientHeight - hdr
      // How many whole rows fit with a margin each side, and no neighbouring row peeking in.
      let top = null
      for (let k = 3; k >= 1 && top === null; k--) {
        const mar = (avail - (k * band + (k - 1) * gap)) / 2
        if (mar >= MIN_MARGIN && mar <= gap) top = hdr + mar
      }
      if (top === null) return null
      const tileH = pitch * rows
      const first = lay.offsetTop + items[0].offsetTop
      let best = null
      for (let j = 0; j < rows; j++) {
        let yj = top - (first + j * pitch)
        yj -= Math.round((yj - y.get()) / tileH) * tileH
        if (best === null || Math.abs(yj - y.get()) < Math.abs(best - y.get())) best = yj
      }
      const tileW = lay.offsetWidth / 2
      return { x: Math.round(x.get() / tileW) * tileW, y: best }
    }

    const settle = (duration) => {
      const r = rest()
      if (!r) return
      moves.forEach((c) => c.stop())
      if (duration === 0) {
        x.set(r.x)
        y.set(r.y)
        moves = []
      } else {
        moves = [animate(x, r.x, { duration, ease }), animate(y, r.y, { duration, ease })]
      }
    }

    // The first view: start at a resting position too.
    const raf = requestAnimationFrame(() => settle(0))

    const onScroll = () => {
      const dy = window.scrollY - last
      last = window.scrollY
      const r = runway.current.getBoundingClientRect()
      const h = window.innerHeight
      const pinned = r.top <= 0 && r.bottom >= h
      const u = Math.min(1, Math.max(0, -r.top / (r.height - h)))
      if (pinned && u >= SETTLE_AT && !settled) {
        settled = true
        settle(0.8)
      } else if (u < SETTLE_AT - 0.08 && settled) {
        settled = false
        moves.forEach((c) => c.stop())
      }
      // Scrolling moves the grid only while pinned (and was pinned a moment ago, so a big jump
      // from far away does not throw it), and not once it has settled for the exit.
      if (pinned && wasPinned && !settled && dy) y.set(y.get() - dy * SCROLL_RATIO)
      wasPinned = pinned
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      moves.forEach((c) => c.stop())
      window.removeEventListener('scroll', onScroll)
    }
  }, [x, y])

  return (
    <LazyMotion features={domMax} strict>
      <div ref={runway} aria-hidden="true" className="gallery relative h-[320svh]">
        <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden bg-steel">
          <m.div
            ref={layer}
            drag={coarse ? 'x' : true}
            dragMomentum
            dragTransition={{ timeConstant: 200, power: 0.28, restDelta: 0, bounceStiffness: 0 }}
            style={{ x, y }}
            className="relative grid h-max w-max cursor-grab grid-cols-2 will-change-transform active:cursor-grabbing"
          >
            {[0, 1, 2, 3].map((copy) => (
              <div key={copy} className="gallery-tile relative">
                {order.map((k, i) => (
                  <m.div
                    key={k}
                    custom={i}
                    variants={item}
                    initial="initial"
                    animate={play ? 'animate' : 'initial'}
                    className="gallery-photo overflow-hidden shadow-[0_22px_48px_-10px_rgba(0,0,0,0.6)] will-change-transform"
                  >
                    <Picture k={k} alt="" sizes="(min-width: 768px) 21vw, 44vw" className="pointer-events-none h-full w-full object-cover" />
                  </m.div>
                ))}
              </div>
            ))}
          </m.div>
        </div>
      </div>
    </LazyMotion>
  )
}
