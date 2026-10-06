import { useRef } from 'react'
import { useMotionEffect } from '../lib/motion.js'

// Drawing-sheet header: a full-width rule, the sheet number, the title and a margin note.
export default function SectionHead({ code, title, note, id, dark = false }) {
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
    <header className="relative mb-12 lg:mb-20">
      <div ref={rule} aria-hidden="true" className={`h-px origin-left ${dark ? 'bg-rule' : 'bg-ink'}`} />
      <div className="grid-12 gap-y-3 pt-4 lg:pt-5">
        <p className={`label col-span-12 sm:col-span-3 lg:col-span-2 ${dark ? 'text-rule' : ''}`}>
          {code}
        </p>
        <h2 id={id} className="text-display-l col-span-12 sm:col-span-9 lg:col-span-7">
          {title}
        </h2>
        {note && (
          <p className={`anno col-span-12 lg:col-span-3 lg:text-right lg:pt-3 ${dark ? 'text-rule' : ''}`}>{note}</p>
        )}
      </div>
    </header>
  )
}
