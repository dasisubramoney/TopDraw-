import { useEffect, useState } from 'react'
import { services } from '../content.js'
import { loadMotion, useReducedMotion } from '../lib/motion.js'
import SectionHead from './SectionHead.jsx'

// Card colours down the stack: the logo's black, blue and beige. Text colour is chosen for
// contrast (paper on ink 15.9:1, paper on steel 10.1:1, ink on beige 6.7:1).
const cardTone = ['bg-ink text-paper', 'bg-steel text-paper', 'bg-beige text-ink', 'bg-ink text-paper', 'bg-steel text-paper']

// The plain list: what the prerendered page, no-JavaScript and reduced-motion visitors get,
// and what shows until the stack has loaded. Title left, description right from 1024 px.
function ServiceList() {
  return (
    <ul className="border-t border-rule">
      {services.map((s) => (
        <li key={s.num} className="grid-12 gap-y-3 border-b border-rule py-8 lg:py-12">
          <h3 className="col-span-12 font-display text-display-m lg:col-span-5">{s.title}</h3>
          <p className="col-span-12 max-w-[52ch] lg:col-span-6 lg:col-start-7">{s.text}</p>
        </li>
      ))}
    </ul>
  )
}

// Scroll Stack (from React Bits): each service is a card that pins under the header as you
// scroll and the next card slides over it. It scrolls with the page (no inner scroll box) and
// leaves smoothing to the site's own Lenis, so there is one scroller, not two.
export default function Services() {
  const reduced = useReducedMotion()
  const [parts, setParts] = useState(null)
  const [desktop, setDesktop] = useState(false)
  // Where the cards pin: just below the site header plus the pinned section heading.
  const [pin, setPin] = useState(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Load the stack after hydration; reduced motion keeps the plain list.
  useEffect(() => {
    if (reduced) {
      setParts(null)
      return
    }
    let cancelled = false
    import('./ScrollStack.jsx').then((mod) => {
      if (!cancelled) setParts({ Stack: mod.default, Item: mod.ScrollStackItem })
    })
    return () => {
      cancelled = true
    }
  }, [reduced])

  // Measure the pinned heading so the first card pins directly under it.
  useEffect(() => {
    if (!parts) return
    const head = document.getElementById('services-title').closest('header')
    const measure = () => {
      const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0
      setPin(Math.round(bar + head.offsetHeight))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(head)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [parts])

  // The stack changes this section's height, so other scroll triggers re-measure.
  useEffect(() => {
    if (!parts) return
    const id = requestAnimationFrame(() => loadMotion().then(({ ScrollTrigger }) => ScrollTrigger.refresh()))
    return () => cancelAnimationFrame(id)
  }, [parts])

  const Stack = parts?.Stack
  const Item = parts?.Item

  return (
    <section id="services" aria-labelledby="services-title" className="section-pad bg-mist">
      <div className="wrap">
        <SectionHead title="Areas of Expertise" id="services-title" centered pinned={Boolean(Stack)} />

        {Stack ? (
          <Stack
            useWindowScroll
            smoothScroll={false}
            snap={false}
            stackPosition={pin ?? (desktop ? 250 : 160)}
            itemDistance={desktop ? 90 : 60}
            itemStackDistance={desktop ? 24 : 16}
            baseScale={0.88}
            itemScale={0.03}
            dimAmount={0.18}
            holdDistance={desktop ? 160 : 100}
          >
            {services.map((s, i) => (
              <Item key={s.num} itemClassName={cardTone[i % cardTone.length]}>
                <div className="grid-12 content-center gap-y-4 p-8 lg:min-h-[19rem] lg:p-14 min-h-[15rem]">
                  <h3 className="col-span-12 font-display text-display-l lg:col-span-6">{s.title}</h3>
                  <p className="col-span-12 max-w-[46ch] text-body-l lg:col-span-5 lg:col-start-8 lg:self-end">{s.text}</p>
                </div>
              </Item>
            ))}
          </Stack>
        ) : (
          <ServiceList />
        )}
      </div>
    </section>
  )
}
