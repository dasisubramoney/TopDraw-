import { useRef } from 'react'
import { work } from '../content.js'
import { useMotionEffect } from '../lib/motion.js'
import SectionHead from './SectionHead.jsx'
import Picture from './Picture.jsx'
import { Leader } from './Annotations.jsx'

// Asymmetric placement per item: [figure grid classes, plate aspect, image sizes]
const layout = {
  'W-01': ['col-span-12 lg:col-span-7', 'aspect-[4/3]', '(min-width: 1024px) 56vw, 100vw'],
  'W-02': ['col-span-10 col-start-3 sm:col-span-7 sm:col-start-6 lg:col-span-4 lg:col-start-9 lg:mt-40', 'aspect-[3/4]', '(min-width: 1024px) 30vw, 70vw'],
  'W-03': ['col-span-12 sm:col-span-9 lg:col-span-5 lg:col-start-2 lg:-mt-24', 'aspect-[4/3]', '(min-width: 1024px) 40vw, 90vw'],
  'W-04': ['col-span-11 col-start-2 sm:col-span-10 sm:col-start-3 lg:col-span-5 lg:col-start-8 lg:mt-24', 'aspect-[4/3]', '(min-width: 1024px) 40vw, 90vw'],
  'W-05': ['col-span-12 lg:col-span-9 lg:col-start-1', 'aspect-[16/9]', '(min-width: 1024px) 70vw, 100vw'],
}

export default function Work() {
  const root = useRef(null)

  useMotionEffect(({ gsap, ScrollTrigger }) => {
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
  })

  return (
    <section id="work" ref={root} aria-labelledby="work-title" className="section-pad bg-mist">
      <div className="wrap">
        <SectionHead code="A-04 / Selected work" title="Built and installed" note="Kitchens, bathrooms, dressing rooms, furniture, balustrading" id="work-title" />

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
                      <h3 className="label">
                        <span className="anno mr-3">{w.key}</span>
                        {w.type}
                      </h3>
                      <span className="anno">{w.place}</span>
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
    </section>
  )
}
