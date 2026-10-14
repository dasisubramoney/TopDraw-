import { useRef } from 'react'
import { useMotionEffect } from '../lib/motion.js'

// Section header: a full-width rule with the title under it. `titleBelow` makes the title larger.
// `centered` sets the title midway between this rule and the line that follows the header
// `pinned` keeps the whole header (rule and title, on an opaque background) fixed under the site
// header for as long as its parent is on screen; the space below it becomes padding so the
// background covers it, and it needs `centered`.
// (the same total space, split evenly above and below), measured from the top of the capitals
// to the baseline, which is how the eye reads a heading; the small 0.14em nudge down is that
// correction (the line box has more space above the capitals than below the baseline).
export default function SectionHead({ title, id, dark = false, titleBelow = false, centered = false, pinned = false }) {
  const rule = useRef(null)

  useMotionEffect(({ gsap }) => {
    const tween = gsap.fromTo(
      rule.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: 'power3.inOut', scrollTrigger: { trigger: rule.current, start: 'top 92%', once: true } },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  })

  return (
    <header className={`${pinned ? "sticky top-[var(--header-h)] z-20 bg-mist pb-8 lg:pb-[var(--head-gap)]" : `relative ${centered ? "mb-8 lg:mb-[var(--head-gap)]" : "mb-12 lg:mb-20"}`}`} style={centered ? { "--head-gap": "50px" } : undefined}>
      <div ref={rule} aria-hidden="true" className={`h-px origin-left ${dark ? 'bg-rule' : 'bg-ink'}`} />
      <div className={centered ? "pt-8 lg:pt-[var(--head-gap)]" : "pt-4 lg:pt-5"}>
        {titleBelow ? (
          <h2 id={id} className="mt-5 text-display-xl lg:mt-8">
            {title}
          </h2>
        ) : (
          <h2 id={id} className={`text-display-l lg:max-w-[75%] ${centered ? "relative top-[0.14em]" : ""}`}>
            {title}
          </h2>
        )}
      </div>
    </header>
  )
}
