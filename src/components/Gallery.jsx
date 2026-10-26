import { useCallback, useEffect, useRef, useState } from 'react'
import { img } from '../content.js'
import { getLenis } from '../lib/motion.js'

// The project photos (24), in the order shown in the Work grid and the gallery.
export const galleryOrder = ['navyKitchen', 'kitchen2', 'wardrobesGrey', 'library', 'dining', 'navyKitchenRange', 'vanityOak', 'glossKitchen', 'shelvingWall', 'kitchenTile', 'hutch', 'laundry', 'navyKitchenFridge', 'deli', 'newBuild', 'vanityInstall', 'wardrobeDesk', 'fridgeUnit', 'wardrobe', 'longVanity', 'tallUnit', 'graniteKitchen', 'barCounter', 'wardrobeWall']

// Full-screen gallery of the project photos. Opened from the "Gallery" nav item, or by
// clicking a photo in the Work grid (which opens it at that photo). Built on <dialog>, so
// focus stays inside and Escape closes it. Each photo fills the screen; scroll, swipe, the
// arrow keys or the up/down buttons move between them (one photo per scroll, snapped).
export const OPEN_GALLERY = 'td:open-gallery'
export const openGallery = (index = 0) => window.dispatchEvent(new CustomEvent(OPEN_GALLERY, { detail: index }))

export default function Gallery() {
  const dialog = useRef(null)
  const track = useRef(null)
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const n = galleryOrder.length

  const goTo = useCallback((i, smooth = true) => {
    const slide = track.current?.children[Math.max(0, Math.min(n - 1, i))]
    slide?.scrollIntoView({ behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto', block: 'start' })
  }, [n])

  useEffect(() => {
    const onOpen = (e) => {
      const start = Number(e.detail) || 0
      setIndex(start)
      setOpen(true)
      dialog.current?.showModal()
      getLenis()?.stop()
      document.documentElement.style.overflow = 'hidden'
      requestAnimationFrame(() => goTo(start, false))
    }
    window.addEventListener(OPEN_GALLERY, onOpen)
    return () => window.removeEventListener(OPEN_GALLERY, onOpen)
  }, [goTo])

  // Track which photo is on screen.
  useEffect(() => {
    if (!open) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setIndex(Number(e.target.dataset.i))),
      { root: track.current, threshold: 0.6 },
    )
    ;[...track.current.children].forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [open])

  const onClose = () => {
    setOpen(false)
    getLenis()?.start()
    document.documentElement.style.overflow = ''
  }

  const onKeyDown = (e) => {
    if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) {
      e.preventDefault()
      goTo(index + 1)
    } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
      e.preventDefault()
      goTo(index - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      goTo(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      goTo(n - 1)
    }
  }

  return (
    <dialog ref={dialog} className="gallery" aria-label="Project gallery" onClose={onClose} onKeyDown={onKeyDown}>
      <div className="gallery-bar">
        <p className="label">Gallery</p>
        <p className="anno" aria-live="polite">
          {index + 1} of {n}
        </p>
        <button type="button" className="gallery-close label" onClick={() => dialog.current?.close()}>
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div ref={track} className="gallery-track" data-lenis-prevent tabIndex={-1}>
        {galleryOrder.map((k, i) => {
          const p = img[k]
          const big = p.widths[p.widths.length - 1]
          return (
            <figure key={k} className="gallery-slide" data-i={i}>
              {open && (
                <img
                  src={`/images/${p.name}-${big}.webp`}
                  srcSet={p.widths.map((w) => `/images/${p.name}-${w}.webp ${w}w`).join(', ')}
                  sizes="100vw"
                  width={p.w}
                  height={p.h}
                  alt={p.alt}
                  loading={Math.abs(i - index) <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="gallery-img"
                />
              )}
              <figcaption className="gallery-caption">{p.alt}</figcaption>
            </figure>
          )
        })}
      </div>

      <div className="gallery-nav">
        <button type="button" aria-label="Previous photo" disabled={index === 0} onClick={() => goTo(index - 1)}>
          <span aria-hidden="true">↑</span>
        </button>
        <button type="button" aria-label="Next photo" disabled={index === n - 1} onClick={() => goTo(index + 1)}>
          <span aria-hidden="true">↓</span>
        </button>
      </div>
    </dialog>
  )
}
