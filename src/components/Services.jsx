import { useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { services } from '../content.js'
import { useReducedMotion } from '../lib/motion.js'
import SectionHead from './SectionHead.jsx'
import Picture from './Picture.jsx'

// Indexed list on hairlines. One row is always open, so the section is complete at rest.
// Hover (fine pointers), click, tap or arrow-key focus opens a row.
export default function Services() {
  const [active, setActive] = useState(0)
  // Small-screen rows only load their photo once opened, so collapsed rows cost nothing.
  const [opened, setOpened] = useState(() => new Set([0]))
  const open = (i) => {
    setActive(i)
    setOpened((s) => (s.has(i) ? s : new Set(s).add(i)))
  }
  const reduced = useReducedMotion()
  const buttons = useRef([])
  const current = services[active]

  const onKeyDown = (e, i) => {
    const last = services.length - 1
    let next = null
    if (e.key === 'ArrowDown') next = i === last ? 0 : i + 1
    if (e.key === 'ArrowUp') next = i === 0 ? last : i - 1
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = last
    if (next === null) return
    e.preventDefault()
    buttons.current[next]?.focus()
    open(next)
  }

  // Only real mouse movement opens a row. pointerenter also fires when rows shift
  // under a resting cursor, which would steal the row a visitor just tapped.
  const onPointerMove = (e, i) => {
    if (e.pointerType === 'mouse' && (e.movementX || e.movementY) && i !== active) open(i)
  }

  return (
    <section id="services" aria-labelledby="services-title" className="section-pad bg-mist">
      <div className="wrap">
        <SectionHead code="A-01 / Services" title="What we take on" note="Five services, one team" id="services-title" />

        <div className="grid-12">
          <ul className="col-span-12 border-t border-rule lg:col-span-7">
            {services.map((s, i) => {
              const isOpen = i === active
              return (
                <li key={s.num} className="border-b border-rule" onPointerMove={(e) => onPointerMove(e, i)}>
                  <h3 className="m-0">
                    <button
                      ref={(el) => (buttons.current[i] = el)}
                      type="button"
                      id={`svc-btn-${s.num}`}
                      aria-expanded={isOpen}
                      aria-controls={`svc-panel-${s.num}`}
                      onClick={() => open(i)}
                      onKeyDown={(e) => onKeyDown(e, i)}
                      className="group grid w-full cursor-pointer grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-5 text-left sm:grid-cols-[4rem_1fr_auto] lg:py-7"
                    >
                      <span className="anno">{s.num}</span>
                      <span
                        className={`font-display text-display-m transition-colors duration-200 ${
                          isOpen ? 'text-steel' : 'group-hover:text-ink'
                        }`}
                      >
                        {s.title}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`font-mono text-base transition-transform duration-200 ease-[var(--ease-io)] ${isOpen ? 'rotate-45' : ''}`}
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`svc-panel-${s.num}`}
                    role="region"
                    aria-labelledby={`svc-btn-${s.num}`}
                    className="grid transition-[grid-template-rows] duration-[260ms] ease-[var(--ease-io)]"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                    inert={isOpen ? undefined : ''}
                  >
                    <div className="overflow-hidden">
                      <div
                        className={`pb-6 pl-[calc(2.5rem+1rem)] transition-[opacity,transform] duration-[220ms] ease-[var(--ease-out)] sm:pl-[calc(4rem+1rem)] lg:pb-8 ${
                          isOpen ? 'translate-y-0 opacity-100 delay-[60ms]' : 'translate-y-2 opacity-0'
                        }`}
                      >
                        <p className="max-w-[52ch]">{s.text}</p>
                        <figure className="mt-5 lg:hidden">
                          <div className="plate aspect-[4/3]">
                            {opened.has(i) && <Picture k={s.image} sizes="(min-width: 640px) 80vw, 90vw" />}
                          </div>
                          <figcaption className="anno mt-2">
                            {s.num} / {s.caption}
                          </figcaption>
                        </figure>
                      </div>
                    </div>
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
