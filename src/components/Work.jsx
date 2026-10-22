import { useEffect, useRef, useState } from 'react'
import { img, work } from '../content.js'
import { galleryOrder, openGallery } from './Gallery.jsx'
import { OPEN_WORK, loadMotion, useMotionEffect, useReducedMotion } from '../lib/motion.js'
import SectionHead from './SectionHead.jsx'
import Picture from './Picture.jsx'
import { Leader } from './Annotations.jsx'

// Asymmetric placement per item: [figure grid classes, plate aspect, image sizes]
const layout = {
  'W-01': ['col-span-12 lg:col-span-7', 'aspect-[4/3]', '(min-width: 1024px) 56vw, 100vw'],
  'W-02': ['col-span-10 col-start-3 sm:col-span-7 sm:col-start-6 lg:col-span-4 lg:col-start-9 lg:mt-40', 'aspect-[3/4]', '(min-width: 1024px) 30vw, 70vw'],
  'W-03': ['col-span-12 sm:col-span-9 lg:col-span-5 lg:col-start-2 lg:-mt-24', 'aspect-[4/3]', '(min-width: 1024px) 40vw, 90vw'],
  'W-04': ['col-span-11 col-start-2 sm:col-span-10 sm:col-start-3 lg:col-span-5 lg:col-start-8 lg:mt-24', 'aspect-[4/3]', '(min-width: 1024px) 40vw, 90vw'],
  'W-05': ['col-span-12 lg:col-span-7 lg:col-start-1', 'aspect-[4/3]', '(min-width: 1024px) 56vw, 100vw'],
  'W-06': ['col-span-10 col-start-3 sm:col-span-7 sm:col-start-6 lg:col-span-4 lg:col-start-9 lg:mt-40', 'aspect-[4/3]', '(min-width: 1024px) 30vw, 80vw'],
}

// The intro word is set in Schibsted Grotesk 800 (self-hosted, weight axis 400-900).
// The portal freezes its face at mount, so it is only mounted once this face has loaded.
const FONT = '"Schibsted Grotesk", "Arial Black", Arial, sans-serif'
const FONT_LOAD = '800 100px "Schibsted Grotesk"'
const FONT_TIMEOUT = 1500

// Palette tokens only; the portal's own defaults (white/green) never show.
const portalColours = {
  '--gp-paper': 'var(--color-paper)',
  '--gp-ink': 'var(--color-ink)',
  '--gp-field': 'var(--color-ink)',
  '--gp-foreground': 'var(--color-paper)',
}

// The captioned project list: the section's content for the prerendered HTML, no JavaScript,
// reduced motion, and until the portal has loaded.
function WorkContent() {
  return (
    <div className="wrap">
      <SectionHead title="Built and installed" id="work-title" />

      <ul className="grid-12 gap-y-16 lg:gap-y-24">
        {work.map((w) => {
          const [pos, aspect, sizes] = layout[w.key]
          return (
            <li key={w.key} className={pos}>
              <figure>
                <div className={`plate relative overflow-hidden ${aspect}`} data-reveal>
                  <Picture k={w.image} sizes={sizes} />
                  {w.key === 'W-03' && <Leader x={89} y={60} dir="left" label="Steel frame / timber top" />}
                </div>
                <figcaption className="mt-3 border-b border-rule pb-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="label">{w.type}</h3>
                    {!w.place.startsWith('[') && <span className="anno">{w.place}</span>}
                  </div>
                  <p className="mt-1.5 text-[0.9375rem] leading-[1.5]">{w.text}</p>
                </figcaption>
              </figure>
            </li>
          )
        })}
      </ul>

      <p className="anno mt-16 lg:mt-24">More projects on request. Ask Trevor for work similar to yours.</p>
    </div>
  )
}

// Inside the portal the photos are the gallery, which is decorative. This keeps the section's
// heading and project captions for screen readers (no images, so nothing extra downloads).
function WorkSummary() {
  return (
    <div className="sr-only">
      <h2 id="work-title">Built and installed</h2>
      <ul>
        {work.map((w) => (
          <li key={w.key}>
            <h3>{w.type}</h3>
            <p>{w.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// The project photos on the black panel after the zoom: still, no drag or movement. Each photo
// keeps its own shape (a staggered grid, four columns on desktop, two on phones), so nothing is
// cropped. Decorative (the captioned list is the content for assistive tech; see WorkSummary).
// Twenty photos chosen from Trevor's album: finished, well-lit work across kitchens, bathrooms,
// built-ins, furniture and shopfitting.
// The order is shared with the full-screen gallery (galleryOrder in Gallery.jsx); each photo
// opens the gallery at that photo.
function PhotoGrid() {
  return (
    <div className="bg-ink">
      <ul className="wrap columns-2 gap-4 py-24 sm:gap-6 lg:columns-4 lg:gap-8 lg:py-36">
        {galleryOrder.map((k, i) => (
          <li key={k} className="mb-4 break-inside-avoid shadow-[0_22px_48px_-10px_rgba(0,0,0,0.6)] sm:mb-6 lg:mb-8">
            <button type="button" onClick={() => openGallery(i)} className="group block w-full cursor-zoom-in" aria-label={`View full screen: ${img[k].alt}`}>
              <Picture k={k} alt="" fixedRatio sizes="(min-width: 1024px) 24vw, 46vw" className="block h-auto w-full transition-opacity duration-200 group-hover:opacity-90" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// The section is complete static content in the prerendered HTML. Once it is within a
// screen of the viewport, the portal and its font load; if either is late (1.5 s) or motion
// is reduced, the static section simply stays.
export default function Work() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const [parts, setParts] = useState(null)
  // Set when a link to Work is followed: show the gallery directly, without the zoom intro.
  const [direct, setDirect] = useState(false)

  useEffect(() => {
    const open = () => setDirect(true)
    window.addEventListener(OPEN_WORK, open)
    return () => window.removeEventListener(OPEN_WORK, open)
  }, [])
  const Portal = parts?.Portal

  useEffect(() => {
    if (reduced) {
      setParts(null)
      return
    }
    let cancelled = false
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const late = new Promise((_, reject) => setTimeout(() => reject(new Error('font timeout')), FONT_TIMEOUT))
        Promise.race([Promise.all([import('./GlyphPortal.jsx'), document.fonts.load(FONT_LOAD, 'PROJECTS')]), late])
          .then(([portal, faces]) => {
            if (!cancelled && faces.length) setParts({ Portal: portal.default })
          })
          .catch(() => {})
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(root.current)
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [reduced])

  // The portal changes the height of this section, so other scroll triggers re-measure.
  useEffect(() => {
    if (!Portal) return
    const id = requestAnimationFrame(() => loadMotion().then(({ ScrollTrigger }) => ScrollTrigger.refresh()))
    return () => cancelAnimationFrame(id)
  }, [Portal])

  useMotionEffect(
    ({ gsap, ScrollTrigger }) => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray('[data-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top bottom-=40', once: true },
            },
          )
        })
      }, root)
      // Anything already above the fold or passed on load is shown immediately.
      ScrollTrigger.refresh()
      return () => ctx.revert()
    },
    [Portal],
    { near: root },
  )

  if (direct) {
    return (
      <section id="work" ref={root} aria-labelledby="work-title" className="on-dark bg-ink text-paper">
        <WorkSummary />
        <PhotoGrid />
      </section>
    )
  }

  return (
    <section id="work" ref={root} aria-labelledby="work-title" className={Portal ? '' : 'section-pad bg-mist'}>
      {Portal ? (
        <Portal
          word="PROJECTS"
          fontFamily={FONT}
          fontWeight={800}
          scrollLength={1.5}
          interactive
          annotations={false}
          enterLabel="See the work"
          className="work-portal"
          style={portalColours}
          background={
            <div style={{ position: 'absolute', inset: 0, transform: 'scale(var(--gp-field-scale, 1))' }}>
              {/* TODO: swap for the hero project photo once chosen. Decorative, so no alt text. */}
              <Picture k="kitchen2" alt="" sizes="100vw" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-ink opacity-85" />
            </div>
          }
          front={
            <>
              <p className="label gp-eyebrow">Top Draw</p>
              {/* TODO: confirm this line with Trevor. */}
              <p className="gp-support">Measured on site. Built in our workshop. Professionally installed.</p>
            </>
          }
        >
          {/* After the zoom you land on a still grid of the project photos. */}
          <WorkSummary />
          <PhotoGrid />
        </Portal>
      ) : (
        <WorkContent />
      )}
    </section>
  )
}
