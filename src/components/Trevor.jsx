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
//                      chapter list on the right opens the active chapter. The sequence
//                      ends on chapter 04 (Today) with the closing statement revealed in
//                      the drawing's title block.

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

// The drawing's title block: the closing statement, set like a sheet's general note.
function TitleBlock() {
  return (
    <div className="trevor-titleblock" data-titleblock>
      <span aria-hidden="true" className="block h-px origin-left bg-ink" data-tb-rule />
      <p className="trevor-statement mt-4 font-display" data-tb-statement>
        {trevor.closing}
      </p>
    </div>
  )
}

// Title block reveal: rule draws, statement rises word by word behind a mask.
function revealTitleBlock(gsap, SplitText, tl, block, at) {
  const split = SplitText.create(block.querySelector('[data-tb-statement]'), { type: 'words', mask: 'words' })
  const rule = block.querySelector('[data-tb-rule]')
  gsap.set(rule, { scaleX: 0 })
  gsap.set(split.words, { yPercent: 105 })
  tl.to(rule, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, at)
  tl.to(split.words, { yPercent: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' }, at + 0.35)
  return { split, end: at + 0.35 + 0.6 + split.words.length * 0.06 }
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
      tl.to({}, { duration: 1 }, t)
      // 04 Today: the timber section stays; the title block completes the sheet.
      tl.addLabel('c4', t + 1)
      const tb = revealTitleBlock(gsap, SplitText, tl, big.querySelector('[data-titleblock]'), t + 1)
      tl.to({}, { duration: 1.2 }, tb.end)

      const setActive = (i) =>
        chapters.forEach((li, n) => (n === i ? li.setAttribute('data-current', '') : li.removeAttribute('data-current')))
      setActive(0)
      const header = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 0
      // The section heading stays pinned under the site header; the stage pins just below it.
      const head = section.querySelector('.section-head')
      const stageTop = () => header() + (head ? head.offsetHeight : 0)
      const setTop = () => section.style.setProperty('--trevor-top', stageTop() + 'px')
      setTop()
      const ro = new ResizeObserver(setTop)
      if (head) ro.observe(head)

      const st = ScrollTrigger.create({
        trigger: stageEl,
        start: () => `top top+=${stageTop()}`,
        end: '+=300%',
        pin: true,
        scrub: 0.6,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const time = self.progress * tl.duration()
          setActive(time >= tl.labels.c4 ? 3 : time >= tl.labels.c3 ? 2 : time >= tl.labels.c2 ? 1 : 0)
          progressBar.style.transform = `scaleY(${self.progress})`
        },
      })
      ScrollTrigger.refresh()

      return () => {
        ro.disconnect()
        section.style.removeProperty('--trevor-top')
        st.kill()
        tl.progress(0).kill()
        tb.split.revert()
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
      const block = section.querySelector('.trevor-chapter [data-titleblock]')
      const tbl = gsap.timeline({ paused: true })
      const tb = revealTitleBlock(gsap, SplitText, tbl, block, 0)
      const tbst = ScrollTrigger.create({ trigger: block, start: '40% bottom', once: true, onEnter: () => tbl.play() })
      return () => {
        runs.forEach(({ tl, st }) => (st.kill(), tl.progress(1).kill()))
        tbst.kill()
        tbl.progress(1).kill()
        tb.split.revert()
      }
    })

    return () => mm.revert()
  })

  return (
    <section id="trevor" ref={root} aria-labelledby="trevor-title" className="trevor section-pad">
      <div className="wrap">
        <SectionHead title={trevor.title} id="trevor-title" />

        <div className="trevor-stage" data-trevor-stage>
          <div className="trevor-figure" data-trevor-figure>
            <div aria-hidden="true">
              <SectionDrawing id="tv-pinned" />
            </div>
            <TitleBlock />
          </div>

          <div className="trevor-text">
            <p className="trevor-intro font-display text-display-m">{trevor.intro}</p>

            <div className="trevor-list relative mt-10 lg:mt-12">
              <span aria-hidden="true" className="trevor-progress-track" />
              <span aria-hidden="true" className="trevor-progress" data-trevor-progress />
              <ol className="trevor-chapters border-t border-rule">
                {trevor.chapters.map((c, i) => (
                  <li key={c.label} data-chapter={i} className="trevor-chapter border-b border-rule">
                    {i < 3 ? (
                      <div className="trevor-chapter-figure" data-chapter-figure aria-hidden="true">
                        <SectionDrawing id={`tv-${i + 1}`} stages={[i + 1]} compact />
                      </div>
                    ) : (
                      <div className="trevor-chapter-figure trevor-chapter-note">
                        <TitleBlock />
                      </div>
                    )}
                    <div className="trevor-chapter-text grid grid-cols-1 gap-x-4 py-6 sm:grid-cols-[9rem_1fr]">
                      <h3 className="label pt-[0.2rem]">{c.label}</h3>
                      <div className="trevor-chapter-body sm:col-start-2">
                        <div>
                          <p className="mt-2 max-w-[48ch] sm:mt-0">{c.text}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
