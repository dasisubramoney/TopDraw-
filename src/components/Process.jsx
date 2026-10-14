import { useEffect, useRef, useState } from 'react'
import { process } from '../content.js'
import { useMotionEffect, useReducedMotion } from '../lib/motion.js'
import SectionHead from './SectionHead.jsx'

// One continuous line through all five stages. Its progress is scrubbed to scroll:
// horizontal on large screens, vertical on small ones. The only section with a grid.
export default function Process() {
  const track = useRef(null)
  const reduced = useReducedMotion()
  const [reached, setReached] = useState(0)
  const n = process.stages.length

  useEffect(() => {
    if (!reduced) return
    track.current.style.setProperty('--p', '1')
    setReached(n)
  }, [reduced, n])

  useMotionEffect(
    ({ gsap, ScrollTrigger }) => {
      if (reduced) return
      const el = track.current
      el.style.setProperty('--p', '0')
      const tween = gsap.to(el, {
        '--p': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 75%',
          end: 'bottom 60%',
          scrub: 0.6,
          onUpdate: (self) => setReached(Math.min(n, Math.floor(self.progress * n + 0.15) + (self.progress > 0.01 ? 1 : 0))),
        },
      })
      ScrollTrigger.refresh()
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    },
    [reduced, n],
  )

  return (
    <section id="process" aria-labelledby="process-title" className="blueprint section-pad">
      <div className="wrap">
        <SectionHead code="A-02 / Process" title="Concept to completion" note="Same team at every stage" id="process-title" />

        <p className="mb-14 max-w-[52ch] text-body-l lg:mb-20 lg:ml-[calc((100%+var(--gutter))/12*2)]">{process.intro}</p>

        <div ref={track} className="relative" style={{ '--p': reduced ? 1 : 0 }}>
          {/* Base and progress lines */}
          <div aria-hidden="true" className="absolute bottom-0 left-[5px] top-[6px] w-px bg-rule lg:hidden" />
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[5px] top-[6px] w-px origin-top bg-steel lg:hidden"
            style={{ transform: 'scaleY(var(--p))' }}
          />
          <div aria-hidden="true" className="absolute left-0 right-0 top-[5px] hidden h-px bg-rule lg:block" />
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-[5px] hidden h-px origin-left bg-steel lg:block"
            style={{ transform: 'scaleX(var(--p))' }}
          />

          <ol className="relative grid gap-12 lg:grid-cols-5 lg:gap-[var(--gutter)]">
            {process.stages.map((s, i) => {
              const on = i < reached
              return (
                <li key={s.num} className="grid grid-cols-[11px_1fr] gap-x-6 lg:block">
                  <span
                    aria-hidden="true"
                    className={`mt-[1px] block h-[11px] w-[11px] border transition-colors duration-300 ${
                      on ? 'border-steel bg-steel' : 'border-rule bg-paper'
                    }`}
                  />
                  <div className="lg:mt-8 lg:pr-4">
                    <p className="anno -mt-[2px] lg:mt-0">Stage {s.num}</p>
                    <h3 className="mt-2 text-display-m">{s.title}</h3>
                    <p className="mt-3 max-w-[40ch] text-[0.9375rem] leading-[1.6]">{s.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
