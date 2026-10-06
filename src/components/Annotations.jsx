// Dimension lines and leader notes laid over a photograph.
// Coordinates are percentages of the photograph, which is always shown uncropped.

export function DimV({ x, y1, y2, label }) {
  return (
    <div className="dim dim-v" style={{ left: `${x}%`, top: `${y1}%`, height: `${y2 - y1}%` }} aria-hidden="true">
      <span className="dim-ext" style={{ top: 0 }} />
      <span className="dim-ext" style={{ bottom: 0 }} />
      <span className="dim-line" />
      <span className="dim-label anno">{label}</span>
    </div>
  )
}

export function DimH({ y, x1, x2, label }) {
  return (
    <div className="dim dim-h" style={{ top: `${y}%`, left: `${x1}%`, width: `${x2 - x1}%` }} aria-hidden="true">
      <span className="dim-ext" style={{ left: 0 }} />
      <span className="dim-ext" style={{ right: 0 }} />
      <span className="dim-line" />
      <span className="dim-label anno">{label}</span>
    </div>
  )
}

export function Leader({ x, y, dir = 'right', label }) {
  return (
    <div className="leader" data-dir={dir} style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true">
      <span className="leader-dot" />
      <span className="leader-line" />
      <span className="leader-note anno">{label}</span>
    </div>
  )
}
