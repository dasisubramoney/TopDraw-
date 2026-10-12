import { useRef } from 'react'
import { trevor } from '../content.js'
import { useMotionEffect } from '../lib/motion.js'
import SectionHead from './SectionHead.jsx'
import SectionDrawing from './SectionDrawings.jsx'

// "Section drawing": Trevor's career told through one technical cross-section that
// changes from stainless steel, to balustrading, to timber.
//
// Two layouts share this markup:
//   stacked (default)  every chapter shows its own finished drawing. Used on mobile, with
//                      reduced motion, and before/without JavaScript.
//   pinned (desktop)   section[data-mode="pinned"], set by the motion code: one large
//                      drawing on the left is scrubbed through all three stages while the
//                      chapter list on the right highlights the active chapter.

const parts = (scope) => ({
  outline: [...scope.querySelectorAll('[data-outline]')],
  hatch: [...scope.querySelectorAll('[data-hatch]')],
  grainFrom: [...scope.querySelectorAll('[data-from]')],
  dimLines: [...scope.querySelectorAll('[data-dim-line]')],
  marks: [...scope.querySelectorAll('[data-mark]')],
  labels: [...scope.querySelectorAll('[data-label]')],
})

// Dash pattern "1 2" on a pathLength of 1: offset 1 hides the line completely (no
// end-cap specks), offset 0 shows all of it.
const DASH = '1 2'

function hide(gsap, p) {
  gsap.set([...p.outline, ...p.hatch, ...p.dimLines], { strokeDasharray: DASH, strokeDashoffset: 1 })
  gsap.set([...p.marks, ...p.labels], { autoAlpha: 0 })
}

// Draw a stage in: outline, hatch sweeping left to right, (timber: diagonals bend into
// grain), then dimensions from the centre outward and labels 0.1 s apart.
function drawIn(gsap, tl, p, at) {
  const grain = p.grainFrom.map((el) => el.getAttribute('d'))
  p.grainFrom.forEach((el) => gsap.set(el, { attr: { d: el.dataset.from } }))
  tl.to(p.outline, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, at)
  tl.to(p.hatch, { strokeDashoffset: 0, duration: 0.35, ease: 'power1.inOut', stagger: { amount: 0.45 } }, at + 0.3)
  let next = at + 0.9
  if (p.grainFrom.length) {
    p.grainFrom.forEach((el, i) => tl.to(el, { morphSVG: grain[i], duration: 0.8, ease: 'power2.inOut' }, at + 1 + i * 0.03))
    next = at + 1.6
  }
  tl.to(p.dimLines, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, next)
  tl.to(p.marks, { autoAlpha: 1, duration: 0.2 }, next + 0.2)
  tl.to(p.labels, { autoAlpha: 1, duration: 0.2, stagger: 0.1 }, next + 0.35)
  return next + 0.35 + p.labels.length * 0.1
}

// Undraw a stage: labels and dimensions first, then hatch and outline (0.6 s).
function drawOut(tl, p, at) {
  tl.to([...p.labels, ...p.marks], { autoAlpha: 0, duration: 0.15 }, at)
  tl.to(p.dimLines, { strokeDashoffset: 1, duration: 0.25, ease: 'power2.in' }, at)
  tl.to(p.hatch, { strokeDashoffset: 1, duration: 0.25, ease: 'power1.in', stagger: { amount: 0.2 } }, at + 0.1)
  tl.to(p.outline, { strokeDashoffset: 1, duration: 0.6, ease: 'power2.inOut' }, at)
  return at + 0.6
}

export default function Trevor() {
  const root = useRef(null)

  useMotionEffect(({ gsap, ScrollTrigger, SplitText }) => {
    const section = root.current
    const mm = gsap.matchMedia()

    // Desktop: pin and scrub one drawing through the three stages.
    mm.add('(min-width: 1024px)', () => {
      section.dataset.mode = 'pinned'
      const stageEl = section.querySelector('[data-trevor-stage]')
      const big = section.querySelector('[data-trevor-figure]')
      const chapters = [...section.querySelectorAll('[data-chapter]')]
      const progressBar = section.querySelector('[data-trevor-progress]')
      const stages = [1, 2, 3].map((n) => parts(big.querySelector(`[data-stage="${n}"]`)))
      // Stage 1 starts fully drawn; give its lines a dash pattern so they can undraw.
      gsap.set([...stages[0].outline, ...stages[0].hatch, ...stages[0].dimLines], { strokeDasharray: DASH, strokeDashoffset: 0 })
      hide(gsap, stages[1])
      hide(gsap, stages[2])

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      tl.addLabel('c1', 0)
      tl.to({}, { duration: 1.4 }) // hold on the steel section
      // Each new drawing starts 0.2 s before the previous one has fully undrawn.
      let t = drawOut(tl, stages[0], 1.4) - 0.2
      tl.addLabel('c2', t)
      t = drawIn(gsap, tl, stages[1], t)
      tl.to({}, { duration: 1.2 }, t)
      t = drawOut(tl, stages[1], t + 1.2) - 0.2
      tl.addLabel('c3', t)
      t = drawIn(gsap, tl, stages[2], t)
      tl.to({}, { duration: 1.2 }, t)

      const setActive = (i) =>
        chapters.forEach((li, n) => (n === i ? li.setAttribute('data-current', '') : li.removeAttribute('data-current')))
      setActive(0)
      const header = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 0

      const st = ScrollTrigger.create({
        trigger: stageEl,
        start: () => `top top+=${header()}`,
        end: '+=250%',
        pin: true,
        scrub: 0.6,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const time = self.progress * tl.duration()
          setActive(time >= tl.labels.c3 ? 2 : time >= tl.labels.c2 ? 1 : 0)
          progressBar.style.transform = `scaleY(${self.progress})`
        },
      })
      ScrollTrigger.refresh()

      return () => {
        st.kill()
        tl.progress(0).kill()
        chapters.forEach((li) => li.removeAttribute('data-current'))
        progressBar.style.transform = ''
        delete section.dataset.mode
      }
    })

    // Mobile: each chapter's drawing draws in once, when 40% of it is in view.
    mm.add('(max-width: 1023px)', () => {
      const figs = [...section.querySelectorAll('[data-chapter-figure]')]
      const runs = figs.map((fig) => {
        const p = parts(fig)
        hide(gsap, p)
        const tl = gsap.timeline({ paused: true })
        drawIn(gsap, tl, p, 0)
        const st = ScrollTrigger.create({ trigger: fig, start: '40% bottom', once: true, onEnter: () => tl.play() })
        return { tl, st }
      })
      return () => runs.forEach(({ tl, st }) => (st.kill(), tl.progress(1).kill()))
    })

    // Closing statement: word-by-word mask reveal, once.
    const closing = section.querySelector('[data-trevor-closing]')
    const split = SplitText.create(closing, { type: 'words', mask: 'words' })
    const reveal = gsap.from(split.words, {
      yPercent: 105,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: { trigger: closing, start: 'top 85%', once: true },
      onComplete: () => split.revert(),
    })

    return () => {
      reveal.scrollTrigger?.kill()
      reveal.kill()
      split.revert()
      mm.revert()
    }
  })

  return (
    <section id="trevor" ref={root} aria-labelledby="trevor-title" className="trevor section-pad">
      <div className="wrap">
        <SectionHead code="A-03 / Trevor" title={trevor.title} note="Owner and lead craftsman" id="trevor-title" titleBelow />

        <div className="trevor-stage" data-trevor-stage>
          <div className="trevor-figure" data-trevor-figure aria-hidden="true">
            <SectionDrawing id="tv-pinned" />
          </div>

          <div className="trevor-text">
            <p className="font-display text-display-m">{trevor.intro}</p>

            <div className="relative mt-10 lg:mt-12">
              <span aria-hidden="true" className="trevor-progress-track" />
              <span aria-hidden="true" className="trevor-progress" data-trevor-progress />
              <ol className="trevor-chapters border-t border-rule">
                {trevor.chapters.map((c, i) => (
                  <li key={c.label} data-chapter={i} className="trevor-chapter border-b border-rule">
                    <div className="trevor-chapter-figure" data-chapter-figure aria-hidden="true">
                      <SectionDrawing id={`tv-${i + 1}`} stages={[i + 1]} compact />
                    </div>
                    <div className="trevor-chapter-text grid grid-cols-[2.5rem_1fr] gap-x-4 py-6 sm:grid-cols-[2.5rem_9rem_1fr]">
                      <span className="anno pt-[0.35rem]">0{i + 1}</span>
                      <h3 className="label pt-[0.2rem]">{c.label}</h3>
                      <p className="col-start-2 mt-2 max-w-[48ch] sm:col-start-3 sm:mt-0">{c.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-rule pt-10 lg:mt-28 lg:pt-14">
          <p className="trevor-closing font-display" data-trevor-closing>
            {trevor.closing}
          </p>
          <div className="mt-8 grid max-w-[46ch] gap-4 text-body-l lg:mt-10 lg:max-w-none lg:grid-cols-2 lg:gap-[calc(var(--gutter)*2)]">
            <p className="max-w-[46ch]">{trevor.today}</p>
            <p className="max-w-[46ch]">{trevor.close}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
