import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { nav, whatsappHref } from '../content.js'
import { getLenis, requestSkipIntro, scrollToId, useReducedMotion } from '../lib/motion.js'

function useActiveSection() {
  const [active, setActive] = useState('')
  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return active
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const active = useActiveSection()
  // Transparent over the top of the hero, solid paper once the page scrolls.
  const [atTop, setAtTop] = useState(true)
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const solid = open || !atTop
  const reduced = useReducedMotion()
  const menuBtn = useRef(null)
  const panel = useRef(null)

  useEffect(() => {
    const lenis = getLenis()
    if (open) {
      lenis?.stop()
      document.documentElement.style.overflow = 'hidden'
      panel.current?.querySelector('a')?.focus()
    } else {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
    const onKey = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
        menuBtn.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const close = () => mq.matches && setOpen(false)
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [])

  const go = (e, id) => {
    e.preventDefault()
    requestSkipIntro()
    setOpen(false)
    // Wait a frame so the menu's scroll lock is released before scrolling.
    requestAnimationFrame(() => {
      scrollToId(id)
      history.replaceState(null, '', `#${id}`)
      const h = document.getElementById(id)?.querySelector('h2')
      if (h) {
        h.setAttribute('tabindex', '-1')
        h.focus({ preventScroll: true })
      }
    })
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-200 ${solid ? 'border-rule bg-paper' : 'border-transparent bg-transparent'}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
        <a href="#top" onClick={(e) => go(e, 'top')} className="flex items-baseline gap-3 no-underline">
          <span className="whitespace-nowrap font-display text-[1.375rem] leading-none tracking-[-0.01em] lg:text-[1.5rem]">Top Draw</span>
          <span className="anno hidden whitespace-nowrap md:inline lg:hidden xl:inline">Bespoke interiors / Johannesburg</span>
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {nav.slice(0, 5).map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={(e) => go(e, n.id)}
                  aria-current={active === n.id ? 'true' : undefined}
                  className={`label inline-flex min-h-11 items-center border-b-2 pt-[2px] transition-colors duration-200 ${
                    active === n.id ? 'border-steel' : 'border-transparent hover:border-rule'
                  }`}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            onClick={(e) => go(e, 'contact')}
            className="nav-cta btn btn-secondary hidden whitespace-nowrap !min-h-11 !px-4 !py-2 !text-base lg:inline-flex"
          >
            Book a consultation
          </a>
          <button
            ref={menuBtn}
            type="button"
            className="label -mr-3 inline-flex min-h-11 items-center gap-2 px-3 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => {
              requestSkipIntro()
              setOpen((o) => !o)
            }}
          >
            {open ? 'Close' : 'Menu'}
            <span aria-hidden="true" className="relative block h-[9px] w-4">
              <span className={`absolute left-0 h-px w-4 bg-ink transition-transform duration-200 ${open ? 'top-1 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-px w-4 bg-ink transition-transform duration-200 ${open ? 'top-1 -rotate-45' : 'top-2'}`} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            ref={panel}
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, transition: { duration: 0.15, ease: [0.65, 0, 0.35, 1] } }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 top-[calc(var(--header-h)+env(safe-area-inset-top,0px)+1px)] overflow-y-auto bg-paper lg:hidden"
          >
            <nav aria-label="Mobile" className="wrap flex min-h-full flex-col pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-4">
              <ul className="border-t border-rule">
                {nav.map((n) => (
                  <li key={n.id} className="border-b border-rule">
                    <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="flex items-baseline gap-5 py-4">
                      <span className="anno w-10">{n.code}</span>
                      <span className="font-display text-[1.75rem] leading-tight">{n.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-3 pt-10">
                <a href="#contact" onClick={(e) => go(e, 'contact')} className="btn btn-primary">
                  Book a site consultation
                </a>
                <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-secondary">
                  WhatsApp Trevor <span className="anno" aria-hidden="true">↗</span>
                  <span className="sr-only">(opens WhatsApp)</span>
                </a>
              </div>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}
