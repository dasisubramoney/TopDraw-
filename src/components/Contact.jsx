import { useEffect, useRef, useState } from 'react'
import { contact, projectTypes, sectors, whatsappHref } from '../content.js'

// Contact: a dark street map of Johannesburg (OpenStreetMap data, see scripts/build-map.py)
// behind a step-by-step consultation form: one question at a time, a progress line under
// it and a round "Next" button. Before JavaScript runs (and in the prerendered HTML) every
// field is listed, so the form never depends on the stepper.

const empty = { name: '', phone: '', email: '', suburb: '', sector: '', projectType: '', message: '', company: '' }

const rules = {
  name: (v) => (v.trim().length < 2 ? 'Enter your name.' : ''),
  phone: (v) => {
    const d = v.replace(/[\s()+-]/g, '')
    return /^(0\d{9}|27\d{9})$/.test(d) ? '' : 'Enter a South African number, for example 082 123 4567.'
  },
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email address, for example name@example.co.za.'),
  suburb: (v) => (v.trim().length < 2 ? 'Enter your suburb so Trevor can plan the site visit.' : ''),
  sector: (v) => (v ? '' : 'Choose residential or commercial.'),
  projectType: (v) => (v ? '' : 'Choose the type of project.'),
  message: (v) => (v.length > 1500 ? 'Keep the message under 1500 characters.' : ''),
}

const steps = [
  { key: 'name', label: 'Your name', type: 'text', autoComplete: 'name', placeholder: 'Your name' },
  { key: 'phone', label: 'Contact number', type: 'tel', autoComplete: 'tel', placeholder: '082 000 0000' },
  { key: 'email', label: 'Email address', type: 'email', autoComplete: 'email', placeholder: 'you@example.co.za' },
  { key: 'suburb', label: 'Suburb', type: 'text', autoComplete: 'address-level3', placeholder: 'Your suburb' },
  { key: 'sector', label: 'Residential or commercial?', choices: sectors },
  { key: 'projectType', label: 'Type of project', choices: projectTypes },
  { key: 'message', label: 'Anything else Trevor should know? (optional)', textarea: true, placeholder: 'The room, the style you like, your timing…' },
]

function Choices({ step, value, onPick }) {
  return (
    <div role="radiogroup" aria-labelledby={`f-${step.key}-label`} className="cs-choices">
      {step.choices.map((c, i) => (
        <label key={c} className="cs-choice" data-checked={value === c ? '' : undefined}>
          <input
            type="radio"
            name={step.key}
            id={i === 0 ? `f-${step.key}` : undefined}
            value={c}
            checked={value === c}
            onChange={() => onPick(c)}
            className="sr-only"
          />
          {c}
        </label>
      ))}
    </div>
  )
}

export default function Contact() {
  const [values, setValues] = useState(empty)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const [enhanced, setEnhanced] = useState(false)
  const [mapNear, setMapNear] = useState(false)
  const root = useRef(null)
  const moved = useRef(false)

  // Stepper only once JavaScript is running.
  useEffect(() => setEnhanced(true), [])

  // Load the map image only when the section is close.
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMapNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(root.current)
    return () => io.disconnect()
  }, [])

  // Move focus to the new question after Next / Back (not on first load).
  useEffect(() => {
    if (!moved.current) return
    root.current?.querySelector(`#f-${steps[step].key}`)?.focus()
  }, [step])

  const set = (k, v) => {
    setValues((s) => ({ ...s, [k]: v }))
    if (error) setError('')
  }

  const submit = async () => {
    if (values.company) return // honeypot
    setStatus('sending')
    try {
      const body = new URLSearchParams({ 'form-name': 'consultation', ...values }).toString()
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  const next = () => {
    const k = steps[step].key
    const msg = rules[k](values[k])
    if (msg) {
      setError(msg)
      root.current?.querySelector(`#f-${k}`)?.focus()
      return
    }
    moved.current = true
    if (step < steps.length - 1) setStep(step + 1)
    else submit()
  }
  const back = () => {
    moved.current = true
    setError('')
    setStep((s) => Math.max(0, s - 1))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (enhanced) return next()
    // Without the stepper: validate everything at once.
    const first = Object.keys(rules).find((k) => rules[k](values[k]))
    if (first) {
      setError(rules[first](values[first]))
      root.current?.querySelector(`#f-${first}`)?.focus()
      return
    }
    submit()
  }

  const renderField = (s, active) => {
    const common = {
      id: `f-${s.key}`,
      name: s.key,
      value: values[s.key],
      onChange: (e) => set(s.key, e.target.value),
      'aria-invalid': active && error ? 'true' : undefined,
      'aria-describedby': active && error ? 'f-error' : undefined,
    }
    if (s.choices) return <Choices step={s} value={values[s.key]} onPick={(c) => set(s.key, c)} />
    if (s.textarea) return <textarea {...common} rows={3} placeholder={s.placeholder} className="cs-input cs-textarea" />
    return (
      <input
        {...common}
        type={s.type}
        inputMode={s.type === 'tel' ? 'tel' : undefined}
        autoComplete={s.autoComplete}
        placeholder={s.placeholder}
        className="cs-input"
      />
    )
  }

  const current = steps[step]
  const last = step === steps.length - 1

  const details = [
    ['Phone', contact.phoneHref ? <a className="link-underline" href={contact.phoneHref}>{contact.phoneDisplay}</a> : contact.phoneDisplay],
    ['Email', <a className="link-underline" href={`mailto:${contact.email}`}>{contact.email}</a>],
    ['Area', contact.area],
  ]

  return (
    <section id="contact" ref={root} aria-labelledby="contact-title" className="contact-map on-dark bg-ink text-paper">
      {mapNear && <img src="/images/map-johannesburg.svg" alt="" aria-hidden="true" className="cm-map" decoding="async" />}
      <div aria-hidden="true" className="cm-pin">
        <span className="cm-pin-ring" />
        <span className="cm-pin-dot" />
        <span className="cm-pin-label">{contact.area}</span>
      </div>

      <div className="wrap relative section-pad">
        <header className="cm-head">
          <p className="text-body-l text-rule">How to reach Trevor</p>
          <h2 id="contact-title" className="mt-2 text-display-xl">
            Book a site consultation
          </h2>
        </header>

        <dl className="cm-details">
          {details.map(([k, v]) => (
            <div key={k}>
              <dt className="label text-rule">{k}</dt>
              <dd className="mt-3">{v}</dd>
            </div>
          ))}
        </dl>
        <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-secondary mt-8">
          WhatsApp Trevor <span className="anno" aria-hidden="true">↗</span>
          <span className="sr-only">(opens WhatsApp)</span>
        </a>

        <div className="cm-form-wrap">
          <h3 className="cm-subhead text-body-l">Get in touch</h3>

          {status === 'sent' ? (
            <div role="status" className="mt-8">
              <p className="font-display text-display-m">Thanks, {values.name.trim().split(' ')[0]}.</p>
              <p className="mt-4 max-w-[46ch] text-body-l">
                Trevor will call you on {values.phone} to arrange a site visit. If it’s urgent, WhatsApp him directly.
              </p>
            </div>
          ) : (
            <form name="consultation" method="POST" noValidate onSubmit={onSubmit} className="mt-8">
              <input type="hidden" name="form-name" value="consultation" />
              <p className="hidden" aria-hidden="true">
                <label>
                  Company <input name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={(e) => set('company', e.target.value)} />
                </label>
              </p>

              {enhanced ? (
                <div className="cs">
                  <div className="cs-field">
                    <div key={current.key} className="cs-enter">
                      <label id={`f-${current.key}-label`} htmlFor={current.choices ? undefined : `f-${current.key}`} className="sr-only">
                        {current.label}
                      </label>
                      <div
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !current.textarea) {
                            e.preventDefault()
                            next()
                          }
                        }}
                      >
                        {renderField(current, true)}
                      </div>
                    </div>

                    <div className="cs-progress" aria-hidden="true">
                      {steps.map((s, i) => (
                        <span key={s.key} data-state={i < step ? 'done' : i === step ? 'current' : undefined} />
                      ))}
                    </div>
                    <div className="cs-captions">
                      <span>{current.label}</span>
                      {!last && <span className="cs-upcoming">{steps[step + 1].label}</span>}
                    </div>
                    <p className="sr-only" aria-live="polite">
                      Question {step + 1} of {steps.length}: {current.label}
                    </p>
                    {error && (
                      <p id="f-error" role="alert" className="cs-error">
                        {error}
                      </p>
                    )}
                    {status === 'failed' && <p className="cs-error">Your request didn’t send. Check your connection and try again, or WhatsApp Trevor.</p>}
                  </div>

                  <div className="cs-actions">
                    {step > 0 && (
                      <button type="button" onClick={back} className="cs-back">
                        Back
                      </button>
                    )}
                    <button type="submit" disabled={status === 'sending'} className="cs-next">
                      <span className="cs-next-text">{status === 'sending' ? 'Sending…' : last ? 'Send' : 'Next'}</span>
                      <span className="cs-next-ring" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-8">
                  {steps.map((s) => (
                    <div key={s.key}>
                      <label id={`f-${s.key}-label`} htmlFor={s.choices ? undefined : `f-${s.key}`} className="label text-rule">
                        {s.label}
                      </label>
                      <div className="mt-2">{renderField(s, false)}</div>
                    </div>
                  ))}
                  {error && <p className="cs-error">{error}</p>}
                  <button type="submit" className="btn btn-primary w-fit">
                    Book a site consultation
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      <p className="cm-credit anno">Map data © OpenStreetMap contributors</p>
    </section>
  )
}
