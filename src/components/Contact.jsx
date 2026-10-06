import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { contact, projectTypes, whatsappHref } from '../content.js'
import { useReducedMotion } from '../lib/motion.js'
import SectionHead from './SectionHead.jsx'

const empty = { name: '', phone: '', email: '', suburb: '', projectType: '', message: '', company: '' }

const rules = {
  name: (v) => (v.trim().length < 2 ? 'Enter your name.' : ''),
  phone: (v) => {
    const d = v.replace(/[\s()+-]/g, '')
    return /^(0\d{9}|27\d{9})$/.test(d) ? '' : 'Enter a South African number, for example 082 123 4567.'
  },
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email address, for example name@example.co.za.'),
  suburb: (v) => (v.trim().length < 2 ? 'Enter your suburb so Trevor can plan the site visit.' : ''),
  projectType: (v) => (v ? '' : 'Choose the type of project.'),
  message: (v) => (v.length > 1500 ? 'Keep the message under 1500 characters.' : ''),
}

const validate = (values) =>
  Object.fromEntries(Object.entries(rules).map(([k, fn]) => [k, fn(values[k])]).filter(([, msg]) => msg))

function Field({ name, label, error, optional, children }) {
  return (
    <div className="flex flex-col gap-1.5 py-3">
      <label htmlFor={`f-${name}`} className="anno text-rule">
        {label}
        {optional && <span className="ml-2">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`f-${name}-err`} className="anno flex gap-2 text-paper normal-case">
          <span aria-hidden="true" className="font-medium">!</span>
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (err) =>
  `w-full min-h-12 bg-transparent py-2 text-[1.0625rem] text-paper outline-offset-4 border-b ${
    err ? 'border-b-2 border-paper' : 'border-rule'
  } focus:border-paper`

export default function Contact({ presetType }) {
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const reduced = useReducedMotion()
  const formRef = useRef(null)
  const summaryId = useId()

  useEffect(() => {
    if (presetType) setValues((v) => ({ ...v, projectType: presetType }))
  }, [presetType])

  const set = (k) => (e) => {
    const next = { ...values, [k]: e.target.value }
    setValues(next)
    if (touched[k]) setErrors(validate(next))
  }
  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }))
    setErrors(validate(values))
  }

  const aria = (k) => ({
    id: `f-${k}`,
    name: k,
    value: values[k],
    onChange: set(k),
    onBlur: blur(k),
    'aria-invalid': errors[k] && touched[k] ? 'true' : undefined,
    'aria-describedby': errors[k] && touched[k] ? `f-${k}-err` : undefined,
  })
  const shown = (k) => (touched[k] ? errors[k] : '')

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    setTouched(Object.fromEntries(Object.keys(rules).map((k) => [k, true])))
    const first = Object.keys(rules).find((k) => errs[k])
    if (first) {
      formRef.current?.querySelector(`#f-${first}`)?.focus()
      return
    }
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

  const errorCount = Object.keys(errors).filter((k) => touched[k]).length
  const fade = reduced
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0 } } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }

  return (
    <section id="contact" aria-labelledby="contact-title" className="on-dark section-pad bg-ink text-paper">
      <div className="wrap">
        <SectionHead code="A-06 / Contact" title="Book a site consultation" note={`Service area: ${contact.area}`} id="contact-title" dark />

        <div className="grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-4">
            <p className="max-w-[40ch] text-body-l">
              Tell us about the room and what you have in mind. Trevor will call you back to arrange a time to visit and measure up.
            </p>
            <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-secondary mt-8">
              WhatsApp Trevor <span className="anno" aria-hidden="true">↗</span>
              <span className="sr-only">(opens WhatsApp)</span>
            </a>

            <dl className="mt-12 border-t border-rule">
              {[
                ['Phone', contact.phoneHref ? <a className="link-underline" href={contact.phoneHref}>{contact.phoneDisplay}</a> : contact.phoneDisplay],
                ['Email', contact.email.includes('@') ? <a className="link-underline" href={`mailto:${contact.email}`}>{contact.email}</a> : contact.email],
                ['Area', contact.area],
                ['Site visit', contact.siteVisit],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-rule py-3">
                  <dt className="anno pt-[0.3rem] text-rule">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'sent' ? (
                <m.div key="sent" {...fade} role="status" className="border-t border-rule pt-8">
                  <p className="font-display text-display-m">Thanks, {values.name.trim().split(' ')[0]}.</p>
                  <p className="mt-4 max-w-[46ch] text-body-l">
                    Trevor will call you on {values.phone} to arrange a site visit. If it’s urgent, WhatsApp him directly.
                  </p>
                </m.div>
              ) : (
                <m.form
                  key="form"
                  {...fade}
                  ref={formRef}
                  name="consultation"
                  method="POST"
                  data-netlify="true"
                  noValidate
                  onSubmit={onSubmit}
                  aria-describedby={summaryId}
                  className="grid gap-x-[var(--gutter)] border-t border-rule sm:grid-cols-2"
                >
                  <input type="hidden" name="form-name" value="consultation" />
                  <p className="hidden" aria-hidden="true">
                    <label>
                      Company <input name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={set('company')} />
                    </label>
                  </p>

                  <Field name="name" label="Name" error={shown('name')}>
                    <input {...aria('name')} type="text" autoComplete="name" required className={inputCls(shown('name'))} />
                  </Field>
                  <Field name="phone" label="Phone" error={shown('phone')}>
                    <input {...aria('phone')} type="tel" inputMode="tel" autoComplete="tel" required className={inputCls(shown('phone'))} />
                  </Field>
                  <Field name="email" label="Email" error={shown('email')}>
                    <input {...aria('email')} type="email" autoComplete="email" required className={inputCls(shown('email'))} />
                  </Field>
                  <Field name="suburb" label="Suburb" error={shown('suburb')}>
                    <input {...aria('suburb')} type="text" autoComplete="address-level3" required className={inputCls(shown('suburb'))} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field name="projectType" label="Project type" error={shown('projectType')}>
                      <div className="relative">
                        <select {...aria('projectType')} required className={`${inputCls(shown('projectType'))} cursor-pointer appearance-none pr-8`}>
                          <option value="" className="text-ink">Choose one</option>
                          {projectTypes.map((t) => (
                            <option key={t} value={t} className="text-ink">
                              {t}
                            </option>
                          ))}
                        </select>
                        <span aria-hidden="true" className="anno pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
                          ▾
                        </span>
                      </div>
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field name="message" label="About the project" error={shown('message')} optional>
                      <textarea {...aria('message')} rows={4} className={`${inputCls(shown('message'))} resize-y`} />
                    </Field>
                  </div>

                  <div className="flex flex-col gap-4 pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:gap-6">
                    <button type="submit" disabled={status === 'sending'} className="btn btn-primary disabled:opacity-100">
                      {status === 'sending' ? 'Sending…' : 'Book a site consultation'}
                    </button>
                    <p id={summaryId} aria-live="polite" className="anno text-rule normal-case">
                      {errorCount > 0
                        ? `${errorCount} ${errorCount === 1 ? 'field needs' : 'fields need'} attention.`
                        : status === 'failed'
                          ? 'Your request didn’t send. Check your connection and try again, or WhatsApp Trevor.'
                          : 'Trevor reads every request himself.'}
                    </p>
                  </div>
                </m.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
