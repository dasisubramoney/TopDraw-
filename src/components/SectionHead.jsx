import { useRef } from 'react'
import { nav } from '../content.js'
import { useMotionEffect } from '../lib/motion.js'

// The one section header used by every section, so they all match: a full-width rule, a small
// eyebrow (the section's name from the navigation bar, found from the heading id, e.g.
// "services-title" -> "Services"), then the title. The space above the eyebrow and below the
// title is the same everywhere (--head-gap), and the title is always the same size and weight.
// A small arrow leads the eyebrow: its left edge lines up with the title's left edge, which
// pushes the eyebrow text a little to the right.
// `pinned` keeps the whole header fixed under the site header for as long as its parent is on
// screen (opaque background; the space below becomes padding so the background covers it).
// `eyebrow` overrides the nav-derived name, for sections that are not in the navigation.
export default function SectionHead({ title, id, dark = false, pinned = false, eyebrow: eyebrowText }) {
  const rule = useRef(null)
  const eyebrow = eyebrowText ?? nav.find((n) => id.startsWith(n.id))?.label

  useMotionEffect(
    ({ gsap }) => {
      const tween = gsap.fromTo(
        rule.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, ease: 'power3.inOut', scrollTrigger: { trigger: rule.current, start: 'top 92%', once: true } },
      )
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    },
    [],
    { near: rule },
  )

  return (
    <header
      className={`section-head ${pinned ? 'sticky top-[var(--header-h)] z-20 bg-mist pb-[var(--head-gap)]' : 'relative mb-[var(--head-gap)]'}`}
      style={{ '--head-gap': 'clamp(28px, 3.4vw, 50px)' }}
    >
      <div ref={rule} aria-hidden="true" className={`h-px origin-left ${dark ? 'bg-rule' : 'bg-ink'}`} />
      <div className="pt-[var(--head-gap)]">
        {eyebrow && (
          <p className={`label flex items-center gap-2.5 ${dark ? 'text-rule' : 'text-steel'}`}>
            {/* Drawn arrow, so its left tip sits exactly on the title's left edge (no font side bearing). */}
            <svg aria-hidden="true" viewBox="0 0 16 10" className="h-[10px] w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M0 5h14.5M10.5 1l4 4-4 4" />
            </svg>
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="mt-3 text-display-l lg:max-w-[75%]">
          {title}
        </h2>
      </div>
    </header>
  )
}
