import { trevor } from '../content.js'
import SectionHead from './SectionHead.jsx'
import Picture from './Picture.jsx'
import { Leader } from './Annotations.jsx'

export default function Trevor() {
  return (
    <section id="trevor" aria-labelledby="trevor-title" className="section-pad">
      <div className="wrap">
        <SectionHead code="A-03 / Trevor" title={trevor.title} note="Owner and lead craftsman" id="trevor-title" />

        <div className="grid-12 gap-y-14">
          {/* Portrait placeholder, drawn the way a drawing marks an opening still to be filled. */}
          <figure className="col-span-12 sm:col-span-8 lg:col-span-5 lg:row-span-2">
            <div className="plate relative aspect-[4/5]">
              <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-rule" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 0L100 100M100 0L0 100" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" fill="none" />
              </svg>
              <p className="anno absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-mist px-3 py-2 text-center">
                [Portrait]
                <br />
                Trevor in the workshop
              </p>
            </div>
            <figcaption className="anno mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-rule pb-3">
              <span>Fig. 02 / Trevor</span>
              <span>Photo to come</span>
            </figcaption>
          </figure>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <p className="font-display text-display-m">{trevor.intro}</p>

            <ol className="mt-10 border-t border-rule">
              {trevor.chapters.map((c, i) => (
                <li key={c.label} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-rule py-6 sm:grid-cols-[2.5rem_9rem_1fr]">
                  <span className="anno pt-[0.35rem]">0{i + 1}</span>
                  <p className="label pt-[0.2rem]">{c.label}</p>
                  <p className="col-start-2 mt-2 max-w-[48ch] sm:col-start-3 sm:mt-0">{c.text}</p>
                </li>
              ))}
            </ol>

            <p className="mt-10 max-w-[46ch] text-body-l">{trevor.close}</p>
          </div>

          <figure className="col-span-12 sm:col-span-10 sm:col-start-3 lg:col-span-5 lg:col-start-8">
            <div className="plate relative aspect-[4/3]">
              <Picture k={trevor.figure.image} sizes="(min-width: 1024px) 36vw, 90vw" />
              <Leader x={23} y={30} dir="right" label={trevor.figure.note} />
            </div>
            <figcaption className="anno mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-rule pb-3">
              <span>Fig. 03 / {trevor.figure.caption}</span>
              <span>Made by Top Draw</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
