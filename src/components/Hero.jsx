import { useEffect, useRef, useState } from 'react'
import { hero, whatsappHref } from '../content.js'
import Picture from './Picture.jsx'
import { DimV, Leader } from './Annotations.jsx'

export default function Hero() {
  const [ready, setReady] = useState(false)
  const imgRef = useRef(null)
  const { height, notes } = hero.annotations

  useEffect(() => {
    if (imgRef.current?.complete) setReady(true)
  }, [])

  return (
    <section id="top" aria-labelledby="hero-title" className="pb-20 pt-6 lg:pb-32 lg:pt-12">
      <div className="wrap grid-12 gap-y-10 lg:gap-y-0">
        <div className="col-span-12 flex flex-col lg:col-span-6 lg:row-span-2 lg:pr-4 xl:pr-10">
          <p className="label">{hero.eyebrow}</p>
          <h1 id="hero-title" className="mt-3 text-display-xl lg:mt-5">
            {hero.headline}
          </h1>
          <p className="mt-4 max-w-[46ch] text-body-l lg:mt-6">{hero.lead}</p>

          <p className="anno mt-4 lg:hidden">{hero.audienceLine}</p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-9">
            <a href="#contact" className="btn btn-primary">
              {hero.primaryCta}
            </a>
            <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-secondary">
              {hero.secondaryCta} <span className="anno" aria-hidden="true">↗</span>
              <span className="sr-only">(opens WhatsApp)</span>
            </a>
          </div>
        </div>

        <figure className="col-span-12 -mx-[var(--margin)] lg:row-start-1 lg:mb-10 lg:col-span-6 lg:col-start-7 lg:mx-0 lg:-mr-[var(--margin)] min-[1520px]:mr-0">
          <div className="plate annotated aspect-[4/3]" data-ready={ready}>
            <Picture
              k="heroKitchen"
              priority
              imgRef={imgRef}
              onLoad={() => setReady(true)}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <DimV {...height} />
            {notes.map((n) => (
              <Leader key={n.label} {...n} />
            ))}
          </div>
          <figcaption className="anno mx-[var(--margin)] mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-rule pb-3 lg:mx-0">
            <span>
              {hero.caption.fig} / {hero.caption.text}
            </span>
            <span>Designed, built and installed by Top Draw</span>
          </figcaption>
        </figure>

        <dl className="col-span-12 border-t border-rule lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:-mt-4">
          {hero.audiences.map((a) => (
            <div key={a.label} className="grid grid-cols-[7rem_1fr] gap-3 border-b border-rule py-3 sm:grid-cols-[8.5rem_1fr]">
              <dt className="anno pt-[0.3rem]">{a.label}</dt>
              <dd className="text-[0.9375rem] leading-[1.45]">{a.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
