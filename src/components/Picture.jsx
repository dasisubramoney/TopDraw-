import { img } from '../content.js'

// Responsive WebP from /public/images. Hard edges, no radius.
export default function Picture({ k, sizes = '100vw', priority = false, className = '', onLoad, imgRef }) {
  const i = img[k]
  const largest = i.widths[i.widths.length - 1]
  return (
    <img
      ref={imgRef}
      src={`/images/${i.name}-${largest}.webp`}
      srcSet={i.widths.map((w) => `/images/${i.name}-${w}.webp ${w}w`).join(', ')}
      sizes={sizes}
      width={i.w}
      height={i.h}
      alt={i.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchpriority={priority ? 'high' : undefined}
      onLoad={onLoad}
      className={className}
    />
  )
}
