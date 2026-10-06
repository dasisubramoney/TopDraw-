// Leader notes laid over a photograph.
// Coordinates are percentages of the photograph, which is always shown uncropped.

export function Leader({ x, y, dir = 'right', label }) {
  return (
    <div className="leader" data-dir={dir} style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true">
      <span className="leader-dot" />
      <span className="leader-line" />
      <span className="leader-note anno">{label}</span>
    </div>
  )
}
