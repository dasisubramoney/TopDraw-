import { useRef } from 'react'
import { process } from '../content.js'
import { useMotionEffect } from '../lib/motion.js'
import SectionHead from './SectionHead.jsx'

// "Programme": the process drawn as a project programme (a bar chart against working
// days), the document a project manager pins up on site. Stages 1 to 3 come before
// sign-off and are shown as steps; from sign-off a working-day axis carries the timed
// stages, with solid bars for the minimum and hatched ends for the range. Payments sit on
// their own row at the milestones they belong to.
//
// Two layouts share this markup (same pattern as the Trevor section):
//   static (default)  chart fully drawn, every stage listed in full. Mobile, reduced
//                     motion and no JavaScript.
//   live (desktop)    section[data-mode="live"]: the chart pins and a cursor scrubs across
//                     it with scroll, drawing each bar as it passes; the active stage's full
//                     text shows beside the chart and the other rows dim.

// Chart geometry, as fractions of the track width.
const PRE = [0.03, 0.115, 0.2] // stages 1 to 3, before sign-off
const SIGN_OFF = 0.26
const DAYS = 32
const day = (d) => SIGN_OFF + (d / DAYS) * (0.975 - SIGN_OFF)
const TICKS = [0, 5, 10, 15, 20, 25, 30]

// One chart element per stage. Bars: from (day), min and max length in days.
const CHART = [
  { type: 'step', x: PRE[0] },
  { type: 'step', x: PRE[1] },
  { type: 'step', x: PRE[2] },
  { type: 'bar', from: 0, min: 10, max: 20, label: '10 to 20 days' },
  { type: 'bar', from: 10, min: 7, max: 10, label: '7 to 10 days' },
  { type: 'span', from: 0, to: 30, label: 'Coordinated with manufacturing and installation' },
  { type: 'bar', from: 20, min: 5, max: 10, label: '5 to 10 days', labelBefore: true },
  { type: 'step', x: day(30) },
]
// Where the cursor sits while each stage is active. It comes to rest on handover (day 30),
// so it never covers the labels to the right of the last markers.
const ANCHOR = [PRE[0], PRE[1], PRE[2], day(0), day(10), day(15), day(20), day(30), day(30)]
const PAYMENT_X = [PRE[2], day(20), day(30)]

const pct = (f) => `${(f * 100).toFixed(2)}%`

function Chart() {
  return (
    <div className="programme" data-programme aria-hidden="true">
      {/* Axis */}
      <div className="pg-row pg-axis">
        <span className="anno">Stage</span>
        <div className="pg-track">
          <span className="anno pg-zone" style={{ left: pct(PRE[0]) }}>
            Before sign-off
          </span>
          <span className="anno pg-zone" style={{ left: pct(SIGN_OFF) }}>
            Working days after sign-off
          </span>
          {TICKS.map((d) => (
            <span key={d} className="pg-tick anno" style={{ left: pct(day(d)) }}>
              {d}
            </span>
          ))}
        </div>
      </div>

      {process.stages.map((s, i) => {
        const c = CHART[i]
        return (
          <div key={s.short} className="pg-row" data-pg-row={i}>
            <span className="pg-label anno">{s.short}</span>
            <div className="pg-track">
              {c.type === 'step' && <span className="pg-step" data-pg-mark style={{ left: pct(c.x) }} data-x={c.x} />}
              {c.type === 'bar' && (
                <>
                  <span
                    className="pg-bar"
                    data-pg-bar
                    data-x0={day(c.from)}
                    data-x1={day(c.from + c.max)}
                    style={{ left: pct(day(c.from)), width: pct(day(c.from + c.max) - day(c.from)) }}
                  >
                    <span className="pg-bar-fill">
                      <span className="pg-bar-min" style={{ width: pct(c.min / c.max) }} />
                      <span className="pg-bar-range" />
                    </span>
                  </span>
                  <span
                    className="pg-bar-label anno"
                    data-pg-mark
                    data-side={c.labelBefore ? 'before' : undefined}
                    data-x={c.labelBefore ? day(c.from) : day(c.from + c.max)}
                    style={{ left: pct(c.labelBefore ? day(c.from) : day(c.from + c.max)) }}
                  >
                    {c.label}
                  </span>
                </>
              )}
              {c.type === 'span' && (
                <span
                  className="pg-span"
                  data-pg-bar
                  data-x0={day(c.from)}
                  data-x1={day(c.to)}
                  style={{ left: pct(day(c.from)), width: pct(day(c.to) - day(c.from)) }}
                >
                  <span className="pg-bar-fill">
                    <span className="pg-span-line" />
                  </span>
                  <span className="pg-span-label anno">{c.label}</span>
                </span>
              )}
            </div>
          </div>
        )
      })}

      {/* Payments */}
      <div className="pg-row pg-payments">
        <span className="pg-label anno">Payments</span>
        <div className="pg-track">
          {process.payments.items.map((p, i) => (
            <span key={p.pct} className="pg-pay" data-pg-mark data-x={PAYMENT_X[i]} style={{ left: pct(PAYMENT_X[i]) }}>
              <span className="pg-pay-mark" />
              <span className="pg-pay-label anno">{p.pct}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Sign-off line and the scroll cursor span the stage rows */}
      <div className="pg-overlay">
        <span className="pg-signoff" style={{ left: pct(SIGN_OFF) }} />
        <span className="pg-cursor" data-pg-cursor />
      </div>
    </div>
  )
}

function PaymentNote({ index }) {
  const p = process.payments.items[index]
  return (
    <p className="pg-payment-note anno mt-4">
      <span className="pg-pay-mark" aria-hidden="true" />
      Payment: {p.pct}% {p.title.toLowerCase()}, {p.when.toLowerCase()}
    </p>
  )
}

export default function Process() {
  const root = useRef(null)

  useMotionEffect(({ gsap, ScrollTrigger }) => {
    const section = root.current
    const mm = gsap.matchMedia()

    // Desktop: pin the programme and scrub a cursor across it.
    mm.add('(min-width: 1024px)', () => {
      section.dataset.mode = 'live'
      const stage = section.querySelector('[data-process-stage]')
      const chart = section.querySelector('[data-programme]')
      const cursor = chart.querySelector('[data-pg-cursor]')
      const bars = [...chart.querySelectorAll('[data-pg-bar]')].map((el) => ({ el, x0: +el.dataset.x0, x1: +el.dataset.x1 }))
      const marks = [...chart.querySelectorAll('[data-pg-mark]')].map((el) => ({ el, x: +el.dataset.x }))
      const rows = [...chart.querySelectorAll('[data-pg-row]')]
      const steps = [...section.querySelectorAll('[data-process-step]')]
      const n = steps.length
      let current = -1

      const render = (p) => {
        // Cursor: from stage anchor to stage anchor, one equal slice of scroll per stage.
        const k = Math.min(p * n, n - 1e-6)
        const i = Math.floor(k)
        const x = ANCHOR[i] + (ANCHOR[i + 1] - ANCHOR[i]) * (k - i)
        cursor.style.left = pct(x)
        // Once the cursor reaches handover the programme is complete: fade it out so the
        // finished chart rests clean, with nothing crossing its last markers.
        const done = (p - (n - 1) / n) / 0.04
        cursor.style.opacity = String(1 - Math.max(0, Math.min(1, done)))
        bars.forEach((b) => b.el.style.setProperty('--f', Math.max(0, Math.min(1, (x - b.x0) / (b.x1 - b.x0)))))
        marks.forEach((m) => m.el.toggleAttribute('data-reached', x >= m.x - 0.004))
        if (i !== current) {
          current = i
          rows.forEach((r, j) => r.toggleAttribute('data-current', j === i))
          steps.forEach((s, j) => s.toggleAttribute('data-current', j === i))
        }
      }

      const proxy = { p: 0 }
      render(0)
      const header = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 0
      const tween = gsap.to(proxy, {
        p: 1,
        ease: 'none',
        onUpdate: () => render(proxy.p),
        scrollTrigger: {
          trigger: stage,
          start: () => `top top+=${header()}`,
          end: '+=400%',
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      ScrollTrigger.refresh()

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        cursor.style.left = ''
        cursor.style.opacity = ''
        bars.forEach((b) => b.el.style.removeProperty('--f'))
        marks.forEach((m) => m.el.removeAttribute('data-reached'))
        ;[...rows, ...steps].forEach((el) => el.removeAttribute('data-current'))
        delete section.dataset.mode
      }
    })

    // Mobile: the stage rail fills with scroll; each node lights as its stage arrives.
    mm.add('(max-width: 1023px)', () => {
      const list = section.querySelector('[data-process-list]')
      const steps = [...list.querySelectorAll('[data-process-step]')]
      section.dataset.mode = 'rail'
      const fill = gsap.fromTo(
        list,
        { '--rail': 0 },
        { '--rail': 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 70%', scrub: 0.6 } },
      )
      const lights = steps.map((s) =>
        ScrollTrigger.create({ trigger: s, start: 'top 70%', onToggle: (self) => s.toggleAttribute('data-lit', self.progress > 0 || self.isActive) }),
      )
      return () => {
        fill.scrollTrigger?.kill()
        fill.kill()
        list.style.removeProperty('--rail')
        lights.forEach((l) => l.kill())
        steps.forEach((s) => s.removeAttribute('data-lit'))
        delete section.dataset.mode
      }
    })

    // Payment split bar draws in once, segment by segment.
    const segs = section.querySelectorAll('[data-pay-seg]')
    const split = gsap.from(segs, {
      scaleX: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      stagger: 0.15,
      scrollTrigger: { trigger: section.querySelector('[data-pay-split]'), start: 'top 85%', once: true },
    })

    return () => {
      split.scrollTrigger?.kill()
      split.revert()
      mm.revert()
    }
  })

  const { payments } = process

  return (
    <section id="process" ref={root} aria-labelledby="process-title" className="process blueprint section-pad">
      <div className="wrap">
        <SectionHead title="Concept to completion" id="process-title" />

        <p className="mb-12 max-w-[56ch] text-body-l lg:mb-16">{process.intro}</p>

        <div className="process-stage" data-process-stage>
          <div className="process-chart">
            <Chart />
            <p className="anno mt-3">Illustrative. Working days are estimates, not a guaranteed completion date.</p>
          </div>

          <div className="process-steps-wrap" data-process-list>
            <span aria-hidden="true" className="process-rail" />
            <ol className="process-steps">
            {process.stages.map((s, i) => (
              <li key={s.title} className="process-step" data-process-step>
                <span aria-hidden="true" className="process-node" />
                <h3 className="-mt-[3px] text-display-m lg:mt-0">{s.title}</h3>
                {s.duration && <p className="anno mt-2">{s.duration}</p>}
                <p className="mt-3 max-w-[52ch]">{s.text}</p>
                {s.list && (
                  <ul className="process-list mt-3 max-w-[52ch]">
                    {s.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {s.payment !== undefined && <PaymentNote index={s.payment} />}
              </li>
            ))}
            </ol>
          </div>
        </div>

        {/* Payment schedule */}
        <div className="mt-20 lg:mt-28">
          <div className="border-t border-ink pt-4">
            <h3 className="text-display-m">Payment schedule</h3>
            <p className="mt-3 max-w-[56ch]">{payments.intro}</p>
          </div>

          <div className="pay-split mt-10" data-pay-split aria-hidden="true">
            {payments.items.map((p) => (
              <span key={p.pct} className="pay-seg" data-pay-seg style={{ flexGrow: p.pct }}>
                <span className="anno">{p.pct}%</span>
              </span>
            ))}
          </div>

          <ol className="mt-8 grid border-t border-rule sm:grid-cols-3">
            {payments.items.map((p) => (
              <li key={p.pct} className="pay-cell border-b border-rule py-6 sm:border-b-0 sm:pr-6 [&:not(:first-child)]:sm:border-l [&:not(:first-child)]:sm:pl-6">
                <p className="anno">{p.when}</p>
                <p className="mt-3 font-display text-[clamp(2.75rem,2rem+3vw,4.5rem)] leading-none text-steel">{p.pct}%</p>
                <h4 className="label mt-4">{p.title}</h4>
                <p className="mt-2 max-w-[40ch]">{p.text}</p>
              </li>
            ))}
          </ol>
          <p className="anno mt-4">{payments.footnote}</p>
        </div>

        {/* General notes */}
        <div className="mt-16 border-t border-ink pt-4 lg:mt-20">
          <h3 className="label">Timeline notes</h3>
          <ul className="process-list mt-4">
            {process.notes.map((note) => (
              <li key={note} className="max-w-[60ch] border-b border-rule py-3 [&::before]:top-[1.4em]">
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
