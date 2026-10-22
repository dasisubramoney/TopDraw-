import { useEffect, useState } from 'react'

// GSAP, ScrollTrigger and Lenis only drive scroll effects. The page is prerendered and
// complete without them, so they load as a separate chunk after hydration and never
// compete with the hero image for bandwidth.
let motionPromise = null
export function loadMotion() {
  if (!motionPromise) {
    motionPromise = Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText'), import('gsap/MorphSVGPlugin'), import('lenis')]).then(
      ([{ gsap }, { ScrollTrigger }, { SplitText }, { MorphSVGPlugin }, { default: Lenis }]) => {
        gsap.registerPlugin(ScrollTrigger, SplitText, MorphSVGPlugin)
        return { gsap, ScrollTrigger, SplitText, MorphSVGPlugin, Lenis }
      },
    )
  }
  return motionPromise
}

// Runs `setup(motion)` once the motion chunk has loaded, unless the visitor prefers
// reduced motion. `setup` may return a cleanup function.
//
// `near` (a ref) defers the setup until that element is within a viewport of the screen, then
// sets it up once and stops watching. Setting up every section the moment the chunk loads put
// all of their pinning, scrubbing and text splitting into one long main-thread task. The
// prerendered page is complete without any of it, so nothing is hidden while a section waits.
// `shifts` says the setup changes the page's height (pinned sections add several screens):
// if the section is wholly above the screen when it runs, the page is scrolled by the height it
// added, so the visitor stays where they were.
export function useMotionEffect(setup, deps = [], { near, shifts = false } = {}) {
  useEffect(() => {
    if (prefersReducedMotion()) return
    let cleanup
    let cancelled = false
    let io
    const start = (el) =>
      loadMotion().then((m) => {
        if (cancelled) return
        cleanup = shifts && el ? holdPlace(el, () => setup(m)) : setup(m)
      })
    const el = near?.current
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return
          io.disconnect()
          start(el)
        },
        { rootMargin: '100% 0px' },
      )
      io.observe(el)
    } else {
      start(null)
    }
    return () => {
      cancelled = true
      io?.disconnect()
      cleanup?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// Runs `setup`, and if `el` is wholly above the screen, scrolls by however much taller the page
// became, so what the visitor is looking at does not move. The target is worked out from where the
// page was before `setup` ran, not from where it is after: switching a section to its pinned
// layout first shrinks it (the browser's own scroll anchoring moves the scroll position to match),
// the pin spacer then adds the scroll distance, and the net change is what has to be made up.
function holdPlace(el, setup) {
  // "Above the screen" includes the strip behind the sticky header, which nobody can see. After a nav
  // jump the section just above the target ends exactly there.
  const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0
  const above = el.getBoundingClientRect().bottom <= bar + 1
  const y0 = window.scrollY
  const before = document.documentElement.scrollHeight
  const cleanup = setup()
  if (above) {
    const grew = document.documentElement.scrollHeight - before
    if (Math.abs(grew) > 0.5) {
      const y = y0 + grew
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
      else window.scrollTo(0, y)
    }
  }
  return cleanup
}

const query = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(query).matches

export function useReducedMotion() {
  // Starts false so server and client markup match; corrected on mount.
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

let lenis = null
export const getLenis = () => lenis

// Smooth scroll is off entirely when the visitor prefers reduced motion.
export function useSmoothScroll(reduced) {
  useMotionEffect(
    ({ gsap, ScrollTrigger, Lenis }) => {
      if (reduced) return
      // Lenis honours the html scroll-padding-top set in CSS, so no extra offset is needed.
      // Anchors are handled below, not by Lenis, so jumps do not glide through every section.
      lenis = new Lenis({ lerp: 0.12 })
      // The hero intro locks scrolling until it reveals (see HeroIntro.jsx).
      if (document.documentElement.classList.contains('intro-lock')) lenis.stop()
      lenis.on('scroll', ScrollTrigger.update)
      // In-page links jump straight to their target. A glide would scroll through every pinned
      // and scrubbed section on the way (Trevor, Projects, the gallery...) and play each of their
      // animations in fast-forward. The Projects "See the work" button is the exception: its
      // glide is the zoom.
      const onAnchor = (e) => {
        const a = e.target.closest && e.target.closest('a[href^="#"]')
        if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        const id = decodeURIComponent(a.getAttribute('href').slice(1))
        const el = id ? document.getElementById(id) : document.documentElement
        if (!el) return
        e.preventDefault()
        if (!a.closest('.work-portal')) announce(id)
        if (a.closest('.work-portal')) lenis.scrollTo(el, { duration: 1.4 })
        else jumpTo(id ? () => resolveTarget(id) : el)
        if (id) history.replaceState(null, '', '#' + id)
      }
      document.addEventListener('click', onAnchor)
      const tick = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      return () => {
        document.removeEventListener('click', onAnchor)
        gsap.ticker.remove(tick)
        lenis.destroy()
        lenis = null
      }
    },
    [reduced],
  )
}

// Where a nav link lands, when it is not the top of the section. Work goes straight to the
// photo gallery, past the PROJECTS zoom intro (the portal's content panel). The portal only
// mounts once Work is near the screen, so this is re-resolved while the jump settles.
const jumpTargets = { work: '#work [data-gp-content]' }
// Following a link to Work also tells the Work section to drop its zoom intro for the rest of
// the visit, so scrolling back up from the gallery does not replay it (see Work.jsx).
export const OPEN_WORK = 'td:open-work'
const announce = (id) => id === 'work' && window.dispatchEvent(new Event(OPEN_WORK))
const resolveTarget = (id) => (jumpTargets[id] && document.querySelector(jumpTargets[id])) || document.getElementById(id)

// Jump to a section, respecting reduced motion and the sticky header.
export function scrollToId(id) {
  announce(id)
  const el = resolveTarget(id)
  if (!el) return
  if (lenis) jumpTo(() => resolveTarget(id))
  else el.scrollIntoView({ behavior: 'auto', block: 'start' })
}

// Jump straight to an element, then keep correcting for a moment. Sections below the target
// can still change height as the jump lands (the Projects portal mounts when it is near the
// screen and makes its section several screens taller), which moves the target; re-checking
// puts the page back on it. Any scroll input from the visitor stops the correcting.
let stopCorrecting = () => {}
function jumpTo(target) {
  stopCorrecting()
  const resolve = typeof target === 'function' ? target : () => target
  lenis.scrollTo(resolve(), { immediate: true })
  const bar = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0
  const until = performance.now() + 2500
  let frame = 0
  const tick = () => {
    if (performance.now() > until) return stopCorrecting()
    const el = resolve()
    if (!el) return stopCorrecting()
    const drift = el.getBoundingClientRect().top - (el === document.documentElement ? 0 : bar())
    if (Math.abs(drift) > 3) lenis.scrollTo(el, { immediate: true })
    frame = requestAnimationFrame(tick)
  }
  const events = ['wheel', 'touchstart', 'keydown', 'pointerdown']
  stopCorrecting = () => {
    cancelAnimationFrame(frame)
    events.forEach((e) => window.removeEventListener(e, stopCorrecting))
    stopCorrecting = () => {}
  }
  events.forEach((e) => window.addEventListener(e, stopCorrecting, { passive: true }))
  frame = requestAnimationFrame(tick)
}

// Hero intro: other components ask the intro to end (e.g. a nav click during playback).
export const SKIP_INTRO = 'td:skip-intro'
export const requestSkipIntro = () => {
  if (document.documentElement.classList.contains('intro-lock')) window.dispatchEvent(new Event(SKIP_INTRO))
}
