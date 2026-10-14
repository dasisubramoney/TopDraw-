import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { services } from '../content.js'
import { useReducedMotion } from '../lib/motion.js'
import SectionHead from './SectionHead.jsx'
import Picture from './Picture.jsx'

// Sticky scroll reveal (adapted from 21st.dev). On large screens the five services scroll
// past on the left while one photo stays pinned on the right and swaps to match the service
// in view; the others dim. Under 1024px every service carries its own photo and nothing is
// pinned. The page is complete at rest: with no JavaScript, or reduced motion, nothing dims.
export default function Services() {
  const [active, setActive] = useState(0)
  const [desktop, setDesktop] = useState(false)
  const reduced = useReducedMotion()
  const rows = useRef([])
  const current = services[active]
  const dim = desktop && !reduced

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // The service crossing the middle of the viewport is the active one.
  useEffect(() => {
    if (!desktop) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.index))),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    rows.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [desktop])

  return (
    <section id="services" aria-labelledby="services-title" className="section-pad bg-mist">
      <div className="wrap">
        <SectionHead code="A-01 / Services" title="What we take on" note="Five services, one team" id="services-title" />

        <div className="grid-12">
          <ul className="col-span-12 border-t border-rule lg:col-span-7">
            {services.map((s, i) => {
              const isActive = i === active
              return (
                <li
                  key={s.num}
                  ref={(el) => (rows.current[i] = el)}
                  data-index={i}
                  className="border-b border-rule py-8 lg:flex lg:min-h-[60vh] lg:flex-col lg:justify-center lg:py-12"
                >
                  <div
                    className="transition-opacity duration-300 ease-[var(--ease-out)]"
                    style={{ opacity: dim && !isActive ? 0.35 : 1 }}
                  >
                    <p className="anno">{s.num}</p>
                    <h3 className={`mt-2 font-display text-display-m transition-colors duration-300 ${dim && isActive ? 'text-steel' : ''}`}>
                      {s.title}
                    </h3>
                    <p className="mt-4 max-w-[52ch]">{s.text}</p>
                    <figure className="mt-6 lg:hidden">
                      <div className="plate aspect-[4/3]">
                        <Picture k={s.image} sizes="(min-width: 640px) 80vw, 90vw" />
                      </div>
                      <figcaption className="anno mt-2">
                        {s.num} / {s.caption}
                      </figcaption>
                    </figure>
                  </div>
                </li>
              )
            })}
          </ul>

          <aside aria-hidden="true" className="col-span-4 col-start-9 hidden lg:block">
            <div className="sticky top-[calc(var(--header-h)+32px)]">
              <div className="plate relative aspect-[4/5] overflow-hidden">
                <AnimatePresence initial={false}>
                  <m.div
                    key={current.image}
                    className="absolute inset-0"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.18, ease: 'linear' }}
                  >
                    <Picture k={current.image} sizes="30vw" />
                  </m.div>
                </AnimatePresence>
              </div>
              <div className="anno mt-3 flex justify-between gap-4 border-b border-rule pb-3">
                <span>
                  {current.num} / {current.caption}
                </span>
                <span>[SUBURB]</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
