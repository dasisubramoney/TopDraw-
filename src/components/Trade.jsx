import { contact, trade, whatsappHref } from '../content.js'
import SectionHead from './SectionHead.jsx'
import Picture from './Picture.jsx'

export default function Trade({ onTradeEnquiry }) {
  return (
    <section id="trade" aria-labelledby="trade-title" className="section-pad">
      <div className="wrap">
        <SectionHead code="A-05 / Trade" title={trade.title} note="Fabrication and installation partner" id="trade-title" />

        <div className="grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-6 lg:col-start-3 lg:row-start-1">
            <p className="max-w-[46ch] text-body-l">{trade.intro}</p>

            <dl className="mt-10 border-t border-rule">
              {trade.points.map((p) => (
                <div key={p.label} className="grid gap-x-6 gap-y-1 border-b border-rule py-5 sm:grid-cols-[9rem_1fr]">
                  <dt className="label pt-[0.2rem]">{p.label}</dt>
                  <dd className="max-w-[48ch]">{p.text}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
              <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-secondary">
                {trade.cta} <span className="anno" aria-hidden="true">↗</span>
                <span className="sr-only">(opens WhatsApp)</span>
              </a>
              <a href="#contact" onClick={onTradeEnquiry} className="link-underline min-h-11 py-3">
                Or send a trade enquiry
              </a>
            </div>
            <p className="anno mt-6">
              Drawings and schedules by email:{' '}
              {contact.email.includes('@') ? (
                <a className="link-underline" href={`mailto:${contact.email}`}>{contact.email}</a>
              ) : (
                contact.email
              )}
            </p>
          </div>

          <figure className="col-span-10 col-start-3 sm:col-span-6 sm:col-start-7 lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:mt-2">
            <div className="plate aspect-[3/4]">
              <Picture k="tallUnit" sizes="(min-width: 1024px) 22vw, 60vw" />
            </div>
            <figcaption className="anno mt-3 border-b border-rule pb-3">Fig. 04 / Full-height joinery and open shelving</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
