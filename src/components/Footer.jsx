import { contact, whatsappHref } from '../content.js'

const isUrl = (s) => /^https?:\/\//.test(s)

// Laid out like a drawing's title block.
export default function Footer() {
  return (
    <footer className="on-dark bg-ink pb-[calc(32px+env(safe-area-inset-bottom,0px))] text-paper">
      <div className="wrap">
        <div className="grid border-t border-rule sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2 border-b border-rule py-6 lg:border-b-0 lg:pr-6">
            <p className="font-display text-[1.5rem] leading-none">Top Draw</p>
            <p className="text-[0.9375rem] text-rule">Bespoke cabinetry, furniture and interiors. Johannesburg.</p>
          </div>
          <div className="flex flex-col gap-2 border-b border-rule py-6 sm:border-l sm:pl-6 lg:border-b-0">
            <p className="anno text-rule">Contact</p>
            <p>{contact.phoneHref ? <a className="link-underline inline-flex min-h-11 items-center" href={contact.phoneHref}>{contact.phoneDisplay}</a> : contact.phoneDisplay}</p>
            <p>{contact.email.includes('@') ? <a className="link-underline inline-flex min-h-11 items-center" href={`mailto:${contact.email}`}>{contact.email}</a> : contact.email}</p>
            <p>
              <a className="link-underline inline-flex min-h-11 items-center" href={whatsappHref()} target="_blank" rel="noopener">
                WhatsApp Trevor<span className="sr-only"> (opens WhatsApp)</span>
              </a>
            </p>
          </div>
          <div className="flex flex-col gap-2 border-b border-rule py-6 sm:border-b-0 lg:border-l lg:pl-6">
            <p className="anno text-rule">Hours</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {contact.hours.map((h) => (
                <div key={h.days} className="contents">
                  <dt>{h.days}</dt>
                  <dd>{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-2 py-6 sm:border-l sm:pl-6">
            <p className="anno text-rule">Follow</p>
            <ul className="flex flex-col">
              {contact.social.map((s) => (
                <li key={s.label}>
                  {isUrl(s.href) ? (
                    <a className="link-underline inline-flex min-h-11 items-center" href={s.href} target="_blank" rel="noopener">{s.label}</a>
                  ) : (
                    <span>
                      {s.label} <span className="anno text-rule">{s.href}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="anno flex flex-col gap-2 border-t border-rule pt-5 text-rule sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Top Draw. All work shown designed, built and installed by Top Draw.</span>
          <span>Sheet A-07 / End</span>
        </div>
      </div>
    </footer>
  )
}
