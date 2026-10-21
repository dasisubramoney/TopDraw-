import { img } from '../content.js'

// Responsive WebP from /public/images. Hard edges, no radius.
// `fixedRatio` pins the box to the declared width/height. Without it a lazy image switches to its file's
// own ratio on load, and the exported sizes are rounded (800x1067, 1600x2133 for a 3:4 photo), so tiles
// change height by a fraction of a pixel and shift everything below them.
export default function Picture({ k, sizes = '100vw', priority = false, className = '', onLoad, imgRef, alt, fixedRatio = false }) {
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
      alt={alt ?? i.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchpriority={priority ? 'high' : undefined}
      onLoad={onLoad}
      style={fixedRatio ? { aspectRatio: `${i.w} / ${i.h}` } : undefined}
      className={className}
    />
  )
}
