import { partner } from '../content.js'
import SectionHead from './SectionHead.jsx'

// Referral partner: BoerBoel Sheet Metal Fabrication. Sits under Work. The referral
// relationship is disclosed in plain text beside the link.
export default function Partner() {
  return (
    <section id="partner" aria-labelledby="partner-title" className="section-pad bg-paper">
      <div className="wrap">
        <SectionHead title={partner.title} id="partner-title" eyebrow="Steel partner" />

        <div className="grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <p className="max-w-[48ch] text-body-l">{partner.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <a href={partner.url} target="_blank" rel="noopener sponsored" className="btn btn-primary w-fit">
                {partner.cta} <span className="anno" aria-hidden="true">↗</span>
                <span className="sr-only">(opens sheetmetal.co.za in a new tab)</span>
              </a>
              <p className="anno">{partner.mention}</p>
            </div>
            {/* BoerBoel's own logo (their white version, recoloured to ink for this light section). */}
            <a href={partner.url} target="_blank" rel="noopener sponsored" className="mt-8 inline-block opacity-90 transition-opacity duration-200 hover:opacity-100">
              <img
                src="/images/partner-boerboel.webp"
                width="1503"
                height="412"
                alt="BoerBoel, laser cutting and sheet metal services"
                loading="lazy"
                decoding="async"
                className="h-auto w-[min(100%,15rem)]"
              />
            </a>
            <p className="anno mt-8 max-w-[56ch]">{partner.disclosure}</p>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <p className="label">{partner.name}</p>
            <ul className="mt-4 border-t border-rule">
              {partner.services.map((s) => (
                <li key={s} className="border-b border-rule py-3">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
