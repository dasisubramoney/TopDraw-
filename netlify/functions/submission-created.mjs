// Emails every verified "consultation" form submission through the Resend HTTPS API.
//
// Netlify runs a function named `submission-created` automatically after each
// spam-filtered Netlify Forms submission, so there is no webhook to configure in
// the dashboard. Netlify still stores the submission; this only adds ONE plain-text
// email per submission, and unlike Netlify's own notifications it can go to any address.
//
// Configuration is read from Netlify environment variables (Site configuration >
// Environment variables). Never put these values in a tracked file:
//   RESEND_API_KEY   the Resend API key
//   NOTIFY_TO        who receives the email: ONE address
//   NOTIFY_FROM      the From address, on a domain verified in Resend
//
// Privacy: customer names, phone numbers and messages are personal data. Nothing
// here logs a field value, the recipient or the key. Logs carry the form name and
// the outcome only (plus Resend's status and error message, with addresses removed).
//
// Tests: scripts/test-submission-created.mjs (npm run test:notify).

const FORM_NAME = 'consultation'
// Hidden spam traps. `bot-field` is the conventional name; `company` is the honeypot the
// site's form actually has (netlify-honeypot="company"). Netlify already drops a submission
// that fills it, so the check here is a second line of defence.
const HONEYPOTS = ['bot-field', 'company']
const RESEND_URL = 'https://api.resend.com/emails'
const REQUIRED_ENV = ['RESEND_API_KEY', 'NOTIFY_FROM', 'NOTIFY_TO']
const NAME_IN_SUBJECT = 80
const SHORT_FIELD = 200
const MESSAGE_FIELD = 2000

// The only fields that ever reach the email, in this order. Anything else in the payload is ignored.
const SHORT_LABELS = [
  ['name', 'Name'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['suburb', 'Suburb'],
  ['sector', 'Residential or commercial'],
  ['projectType', 'Type of project'],
]

const text = (v) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '')
// One line only: line breaks, tabs and other control characters become spaces, so a value can
// never start a new line (or a new header) in the subject or in a field line.
// Exotic line breaks (NEL, line separator, paragraph separator), named by code point so this source holds no raw separators.
const EXOTIC_BREAKS = String.fromCodePoint(0x85, 0x2028, 0x2029)
const oneLine = (v) => text(v).replace(new RegExp(`[\\u0000-\\u001f\\u007f${EXOTIC_BREAKS}]+`, 'g'), ' ').replace(/\s+/g, ' ').trim()
// The message may span lines, but never contains control characters.
const multiLine = (v) => text(v).replace(new RegExp(`\\r\\n?|[${EXOTIC_BREAKS}]`, 'g'), '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').trim()
// One plain address only: no commas, semicolons, quotes, angle brackets or whitespace.
const EMAIL = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]{2,}$/
const isEmail = (v) => v.length <= 254 && EMAIL.test(v)

// What Resend says went wrong, made safe to log: no addresses, no key-shaped strings, one short line.
const safeMessage = (raw) =>
  oneLine(raw)
    .replace(/\S+@\S+/g, '[address]')
    .replace(/\bre_[A-Za-z0-9_]+/g, '[key]')
    .slice(0, 200)

const reply = (statusCode, body) => ({ statusCode, body })

export const createHandler =
  ({ timeoutMs = 8000 } = {}) =>
  async (event) => {
    // 1. The payload must be readable.
    let payload
    try {
      payload = JSON.parse(event?.body)?.payload
    } catch {
      payload = undefined
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return reply(400, 'Unreadable submission payload')
    if ('data' in payload && (payload.data === null || typeof payload.data !== 'object' || Array.isArray(payload.data))) {
      return reply(400, 'Unreadable submission payload')
    }
    const data = payload.data ?? {}

    // 2. Only the consultation form is emailed.
    if (payload.form_name !== FORM_NAME) {
      console.warn(`Ignored submission from form "${oneLine(payload.form_name).slice(0, 60)}"; this function only emails "${FORM_NAME}"`)
      return reply(200, 'Ignored: not the consultation form')
    }

    // 3. A filled honeypot is a bot: skip without a word.
    if (HONEYPOTS.some((k) => oneLine(data[k]) !== '')) {
      console.log('honeypot')
      return reply(200, 'Ignored')
    }

    // 4. Configuration. Log which variable is missing (never a value) and stop without failing the submission.
    const env = process.env
    const missing = REQUIRED_ENV.filter((k) => !(typeof env[k] === 'string' && env[k].trim()))
    if (missing.length) {
      console.error(`Email not sent. Missing environment variable(s): ${missing.join(', ')}`)
      return reply(200, 'Email is not configured')
    }
    const to = env.NOTIFY_TO.trim()
    if (!isEmail(to)) {
      console.error('Email not sent. NOTIFY_TO is not a single valid address')
      return reply(200, 'Email is not configured')
    }
    const from = env.NOTIFY_FROM.trim()
    if (/[\r\n]/.test(from)) {
      console.error('Email not sent. NOTIFY_FROM is not valid')
      return reply(200, 'Email is not configured')
    }

    // 5. Build the email from the known fields only, each one capped.
    const values = Object.fromEntries(SHORT_LABELS.map(([key]) => [key, oneLine(data[key]).slice(0, SHORT_FIELD)]))
    const message = multiLine(data.message).slice(0, MESSAGE_FIELD)
    if (!values.name && !values.phone && !values.email) {
      console.warn('Email not sent. The submission has no name, phone or email')
      return reply(200, 'Ignored: empty submission')
    }
    const lines = SHORT_LABELS.map(([key, label]) => `${label}: ${values[key] || '-'}`)
    const body = {
      from,
      to: [to],
      subject: `New consultation request from ${values.name.slice(0, NAME_IN_SUBJECT) || 'the website'}`,
      text: `${lines.join('\n')}\n\nMessage:\n${message || '-'}`,
    }
    // Replies go to the person who filled in the form, if exactly one real-looking address was given.
    // A bad or multiple Reply-To is left out; the enquiry is still sent.
    const replyTo = text(data.email).trim()
    if (isEmail(replyTo)) body.reply_to = replyTo

    const headers = {
      Authorization: `Bearer ${env.RESEND_API_KEY.trim()}`,
      'Content-Type': 'application/json',
      // Resend rejects requests that carry no User-Agent.
      'User-Agent': 'topdraw-form-notify/1.0',
    }
    // The same submission delivered twice must not send two emails (Resend keeps the key for 24 hours).
    const id = text(payload.id)
    if (id && id.length <= 256 && /^[\x21-\x7e]+$/.test(id)) headers['Idempotency-Key'] = id

    // 6. Send, giving up after `timeoutMs` (Netlify stops a function after about 10 seconds).
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(RESEND_URL, { method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal })
      if (res.ok) {
        console.log(`Notification sent for form "${FORM_NAME}"`)
        return reply(200, 'Sent')
      }
      let detail = ''
      try {
        const parsed = JSON.parse(await res.text())
        detail = safeMessage(parsed?.message)
      } catch {
        // The error body was not JSON; the status alone is logged.
      }
      console.error(`Resend rejected the email: status ${res.status}${detail ? `, ${detail}` : ''}`)
      return reply(502, 'Email failed')
    } catch (err) {
      // The submission is still saved in Netlify Forms, so nothing is lost if the mail service is down.
      console.error(`Resend request failed: ${err?.name === 'AbortError' ? `timed out after ${timeoutMs} ms` : 'network error'}`)
      return reply(502, 'Email failed')
    } finally {
      clearTimeout(timer)
    }
  }

export const handler = createHandler()
