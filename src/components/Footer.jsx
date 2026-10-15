import { contact, nav, whatsappHref } from '../content.js'

const isUrl = (s) => /^https?:\/\//.test(s)

// Small line icons, drawn here so the footer needs no icon library.
const icons = {
  Instagram: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M14 21v-8h2.8l.5-3.2H14V7.9c0-.9.4-1.6 1.7-1.6h1.7V3.5c-.3 0-1.3-.2-2.5-.2-2.6 0-4.1 1.5-4.1 4.2v2.3H8v3.2h2.8v8z" />
    </svg>
  ),
}

// Footer: a pitch with the two ways to get in touch, the section links, contact details and
// hours, and social links; then a closing line. Modelled on a common four-column footer,
// adapted to the site (no newsletter, no dark-mode switch, no rounded corners).
export default function Footer() {
  return (
    <footer className="bg-paper pb-[calc(32px+env(safe-area-inset-bottom,0px))] text-ink">
      <div className="wrap">
        <div className="grid gap-12 pt-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-[var(--gutter)] lg:pt-16">
          <div className="sm:col-span-2 lg:col-span-5">
            <p className="font-display text-display-m">Let’s talk about your project.</p>
            <p className="mt-4 max-w-[40ch] text-[0.9375rem] text-ink">
              Bespoke cabinetry, furniture and interiors in Johannesburg. Call, message or book a site visit.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#contact" className="btn btn-primary">
                Book a site consultation
              </a>
              <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-secondary">
                WhatsApp Trevor <span className="anno" aria-hidden="true">↗</span>
                <span className="sr-only">(opens WhatsApp)</span>
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <p className="anno text-ink">Quick links</p>
            <ul className="mt-3 flex flex-col">
              {nav.map((n) => (
                <li key={n.id}>
                  <a className="link-underline inline-flex min-h-11 items-center" href={`#${n.id}`}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="anno text-ink">Contact us</p>
            <address className="mt-3 flex flex-col gap-3 not-italic">
              <div>
                <p className="anno text-ink">Phone</p>
                {contact.phoneHref ? (
                  <a className="link-underline inline-flex min-h-11 items-center" href={contact.phoneHref}>
                    {contact.phoneDisplay}
                  </a>
                ) : (
                  <p>{contact.phoneDisplay}</p>
                )}
              </div>
              <div>
                <p className="anno text-ink">Email</p>
                {contact.email.includes('@') ? (
                  <a className="link-underline inline-flex min-h-11 items-center break-all" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                ) : (
                  <p>{contact.email}</p>
                )}
              </div>
              <div>
                <p className="anno text-ink">Area</p>
                <p>{contact.area}</p>
              </div>
            </address>
          </div>

          <div className="lg:col-span-2">
            <p className="anno text-ink">Hours</p>
            <dl className="mt-3 flex flex-col gap-3">
              {contact.hours.map((h) => (
                <div key={h.days}>
                  <dt className="anno text-ink">{h.days}</dt>
                  <dd>{h.time}</dd>
                </div>
              ))}
            </dl>

            <p className="anno mt-8 text-ink">Follow us</p>
            <ul className="mt-3 flex gap-3">
              {contact.social.map((s) => (
                <li key={s.label}>
                  {isUrl(s.href) ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex h-11 w-11 items-center justify-center border border-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
                    >
                      {icons[s.label]}
                      <span className="sr-only">{s.label} (opens in a new tab)</span>
                    </a>
                  ) : (
                    // Placeholder until the real address is supplied (see content.js).
                    <span className="inline-flex h-11 w-11 items-center justify-center border border-dashed border-ink text-ink" title={`${s.label} ${s.href}`}>
                      {icons[s.label]}
                      <span className="sr-only">
                        {s.label} {s.href}
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="anno mt-12 flex flex-col gap-3 border-t border-rule pt-6 text-ink sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <span>© {new Date().getFullYear()} Top Draw. All work shown designed, built and installed by Top Draw.</span>
          <a href="#top" className="link-underline inline-flex min-h-11 items-center">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
