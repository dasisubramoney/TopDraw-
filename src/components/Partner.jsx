import { contact, partner } from '../content.js'
import SectionHead from './SectionHead.jsx'

// Referral partner: BoerBoel Sheet Metal Fabrication. Sits under Work.
// The "tell them Top Draw referred you" message is the section's main callout, so the
// referral is recorded.
// Right column: BoerBoel's services, then Trevor's offer to install work BoerBoel makes.
const installHref = () => {
  const n = /^\d{9,15}$/.test(contact.whatsappNumber) ? contact.whatsappNumber : ''
  return `https://wa.me/${n}?text=${encodeURIComponent(partner.install.whatsapp)}`
}

export default function Partner() {
  const { referral, install } = partner
  return (
    <section id="partner" aria-labelledby="partner-title" className="section-pad bg-paper">
      <div className="wrap">
        <SectionHead title={partner.title} id="partner-title" eyebrow="Steel partner" />

        <div className="grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <p className="max-w-[48ch] text-body-l">{partner.intro}</p>

            {/* Referral callout */}
            <div className="referral-callout mt-10">
              <p className="label text-steel">{referral.label}</p>
              <p className="mt-3 font-display text-display-m text-ink">{referral.headline}</p>
              <p className="mt-3 max-w-[46ch]">{referral.text}</p>
              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                <a href={partner.url} target="_blank" rel="noopener sponsored" className="btn btn-primary w-fit shrink-0 whitespace-nowrap">
                  {partner.cta} <span className="anno" aria-hidden="true">↗</span>
                  <span className="sr-only">(opens sheetmetal.co.za in a new tab)</span>
                </a>
                {/* BoerBoel's own logo (their white version, recoloured to ink for this light section). */}
                <a href={partner.url} target="_blank" rel="noopener sponsored" className="inline-block w-fit opacity-90 transition-opacity duration-200 hover:opacity-100">
                  <img
                    src="/images/partner-boerboel-600.webp"
                    width="600"
                    height="164"
                    alt="BoerBoel, laser cutting and sheet metal services"
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-[min(100%,12rem)]"
                  />
                </a>
              </div>
            </div>
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

            {/* Trevor installs BoerBoel work */}
            <div className="mt-10 border-t-2 border-ink pt-5">
              <p className="label">{install.label}</p>
              <p className="mt-3 font-display text-display-m">{install.title}</p>
              <p className="mt-3 max-w-[44ch]">{install.text}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <a href={installHref()} target="_blank" rel="noopener" className="btn btn-secondary w-fit whitespace-nowrap">
                  {install.cta} <span className="anno" aria-hidden="true">↗</span>
                  <span className="sr-only">(opens WhatsApp)</span>
                </a>
                <a href="#contact" className="link-underline min-h-11 py-3">
                  Or book a site consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
