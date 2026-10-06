import { useEffect, useState } from 'react'

// GSAP, ScrollTrigger and Lenis only drive scroll effects. The page is prerendered and
// complete without them, so they load as a separate chunk after hydration and never
// compete with the hero image for bandwidth.
let motionPromise = null
export function loadMotion() {
  if (!motionPromise) {
    motionPromise = Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('lenis')]).then(
      ([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
        gsap.registerPlugin(ScrollTrigger)
        return { gsap, ScrollTrigger, Lenis }
      },
    )
  }
  return motionPromise
}

// Runs `setup(motion)` once the motion chunk has loaded, unless the visitor prefers
// reduced motion. `setup` may return a cleanup function.
export function useMotionEffect(setup, deps = []) {
  useEffect(() => {
    if (prefersReducedMotion()) return
    let cleanup
    let cancelled = false
    loadMotion().then((m) => {
      if (!cancelled) cleanup = setup(m)
    })
    return () => {
      cancelled = true
      cleanup?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
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
      lenis = new Lenis({ lerp: 0.12, anchors: true })
      lenis.on('scroll', ScrollTrigger.update)
      const tick = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      return () => {
        gsap.ticker.remove(tick)
        lenis.destroy()
        lenis = null
      }
    },
    [reduced],
  )
}

// Scroll to a section, respecting reduced motion and the sticky header.
export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.1 })
  else el.scrollIntoView({ behavior: 'auto', block: 'start' })
}
