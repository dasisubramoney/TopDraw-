// Tests for netlify/functions/submission-created.mjs. Run: npm run test:notify
//
// Nothing here talks to the network or uses a real credential: global fetch is replaced by a mock in
// every test, and every address and value is an example.com / obviously fake one.
import { afterEach, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createHandler } from '../netlify/functions/submission-created.mjs'

const KEY = 'test-key-not-real'
const TO = 'owner@example.com'
const FROM = 'Website <noreply@example.com>'
const ENV_NAMES = ['RESEND_API_KEY', 'NOTIFY_TO', 'NOTIFY_FROM']

const realFetch = globalThis.fetch
const realConsole = { log: console.log, warn: console.warn, error: console.error }
const savedEnv = {}
let calls
let logs

const goodData = () => ({ name: 'Jane Customer', phone: '0820000000', email: 'jane@example.com', suburb: 'Exampleton', sector: 'Residential', projectType: 'Kitchen', message: 'Hello there.' })
const event = (payload) => ({ body: JSON.stringify({ payload }) })
const goodEvent = (over = {}) => event({ form_name: 'consultation', id: 'sub-123', data: goodData(), ...over })

// A mock fetch that records the call and answers with the given status/body.
const respond = (status = 200, bodyObj = { id: 'abc' }) => {
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, opts })
    return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(bodyObj) }
  }
}
const sent = () => JSON.parse(calls[0].opts.body)

beforeEach(() => {
  calls = []
  logs = []
  for (const k of ENV_NAMES) savedEnv[k] = process.env[k]
  process.env.RESEND_API_KEY = KEY
  process.env.NOTIFY_TO = TO
  process.env.NOTIFY_FROM = FROM
  console.log = (...a) => logs.push(a.join(' '))
  console.warn = (...a) => logs.push(a.join(' '))
  console.error = (...a) => logs.push(a.join(' '))
  respond(200)
})
afterEach(() => {
  globalThis.fetch = realFetch
  Object.assign(console, realConsole)
  for (const k of ENV_NAMES) { if (savedEnv[k] === undefined) delete process.env[k]; else process.env[k] = savedEnv[k] }
})

const run = (ev, opts) => createHandler(opts)(ev)

describe('payload and form', () => {
  test('missing or malformed payload: 400, no fetch, no throw', async () => {
    for (const ev of [undefined, {}, { body: undefined }, { body: 'not json' }, { body: '{}' }, { body: '{"payload":null}' }, { body: '{"payload":[]}' }, { body: '{"payload":"x"}' }, event({ form_name: 'consultation', data: 'oops' }), event({ form_name: 'consultation', data: null }), event({ form_name: 'consultation', data: [1] })]) {
      const r = await run(ev)
      assert.equal(r.statusCode, 400, JSON.stringify(ev))
    }
    assert.equal(calls.length, 0)
  })

  test('another form name is ignored: 200, warning logged, no fetch', async () => {
    const r = await run(event({ form_name: 'newsletter', data: goodData() }))
    assert.equal(r.statusCode, 200)
    assert.equal(calls.length, 0)
    assert.ok(logs.some((l) => l.includes('Ignored submission from form "newsletter"')))
  })

  test('a missing form name is ignored too', async () => {
    const r = await run(event({ data: goodData() }))
    assert.equal(r.statusCode, 200)
    assert.equal(calls.length, 0)
  })

  test('a hostile form name cannot add log lines', async () => {
    await run(event({ form_name: 'x"\r\nFAKE LOG LINE', data: goodData() }))
    assert.ok(logs.every((l) => !/[\r\n]/.test(l)))
  })
})

describe('configuration', () => {
  for (const name of ENV_NAMES) {
    test(`missing ${name}: no fetch, 200, no throw, the variable is named and no value is logged`, async () => {
      delete process.env[name]
      const r = await run(goodEvent())
      assert.equal(r.statusCode, 200)
      assert.equal(calls.length, 0)
      assert.ok(logs.some((l) => l.includes(name)), logs.join(' | '))
      for (const secret of [KEY, TO, 'noreply@example.com']) assert.ok(logs.every((l) => !l.includes(secret)))
    })
    test(`empty ${name} counts as missing`, async () => {
      process.env[name] = '   '
      const r = await run(goodEvent())
      assert.equal(r.statusCode, 200)
      assert.equal(calls.length, 0)
    })
  }

  test('a NOTIFY_FROM with a line break is rejected: no fetch, 200, the variable is named', async () => {
    process.env.NOTIFY_FROM = 'noreply@example.com\r\nBcc: x@example.com'
    const r = await run(goodEvent())
    assert.equal(r.statusCode, 200)
    assert.equal(calls.length, 0)
    assert.ok(logs.some((l) => l.includes('NOTIFY_FROM')))
    assert.ok(logs.every((l) => !l.includes('example.com')))
  })

  for (const bad of ['a@example.com, b@example.com', 'a@example.com;b@example.com', 'not-an-email', '<a@example.com>', 'a@example.com\r\nBcc: x@example.com']) {
    test(`NOTIFY_TO that is not a single valid address (${JSON.stringify(bad)}): no fetch, 200`, async () => {
      process.env.NOTIFY_TO = bad
      const r = await run(goodEvent())
      assert.equal(r.statusCode, 200)
      assert.equal(calls.length, 0)
      assert.ok(logs.some((l) => l.includes('NOTIFY_TO')))
      assert.ok(logs.every((l) => !l.includes('example.com')))
    })
  }
})

describe('Resend failures', () => {
  for (const status of [500, 422, 403, 429]) {
    test(`Resend ${status}: no throw, error status, status logged`, async () => {
      // A key-shaped string, assembled at run time so this file holds no "re_..." literal.
      const keyShaped = ['re', 'fakevalue1234567'].join('_')
      respond(status, { message: `Something went wrong for owner@example.com using ${keyShaped}` })
      const r = await run(goodEvent())
      assert.equal(r.statusCode, 502)
      assert.equal(calls.length, 1)
      const line = logs.find((l) => l.includes('Resend rejected'))
      assert.ok(line && line.includes(String(status)))
      // Resend's message is logged, but with addresses and key-shaped strings removed.
      assert.ok(!line.includes('owner@example.com') && !line.includes(keyShaped), line)
      // ...and the readable part of Resend's message is kept.
      assert.ok(line.includes('Something went wrong for [address] using [key]'), line)
    })
  }

  test('a non-JSON error body is fine: status only', async () => {
    globalThis.fetch = async (url, opts) => { calls.push({ url, opts }); return { ok: false, status: 502, text: async () => '<html>bad gateway</html>' } }
    const r = await run(goodEvent())
    assert.equal(r.statusCode, 502)
    assert.ok(logs.some((l) => l.includes('status 502')))
  })

  test('fetch rejects: no throw, error status, nothing sensitive logged', async () => {
    globalThis.fetch = async () => { throw new TypeError(`connect ECONNREFUSED to ${TO} with ${KEY}`) }
    const r = await run(goodEvent())
    assert.equal(r.statusCode, 502)
    assert.ok(logs.some((l) => l.includes('network error')))
    for (const secret of [KEY, TO, 'Jane', '0820000000', 'jane@example.com']) assert.ok(logs.every((l) => !l.includes(secret)), secret)
  })

  test('fetch hangs until the abort: no throw, error status, the request was aborted', async () => {
    let aborted = false
    globalThis.fetch = (url, opts) =>
      new Promise((_, reject) => {
        opts.signal.addEventListener('abort', () => {
          aborted = true
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))
        })
      })
    const r = await run(goodEvent(), { timeoutMs: 30 })
    assert.equal(r.statusCode, 502)
    assert.ok(aborted)
    assert.ok(logs.some((l) => l.includes('timed out')))
  })

  test('the default timeout is 8 seconds', async () => {
    let timeoutSeen
    const realSetTimeout = globalThis.setTimeout
    globalThis.setTimeout = (fn, ms, ...rest) => { if (ms === 8000) timeoutSeen = ms; return realSetTimeout(fn, ms, ...rest) }
    try { await run(goodEvent()) } finally { globalThis.setTimeout = realSetTimeout }
    assert.equal(timeoutSeen, 8000)
  })
})

describe('header injection and Reply-To', () => {
  test('a name with CRLF and a Bcc cannot reach the subject or create a header or recipient', async () => {
    const data = { ...goodData(), name: 'Mallory\r\nBcc: x@example.com' }
    const r = await run(event({ form_name: 'consultation', id: 's1', data }))
    assert.equal(r.statusCode, 200)
    const body = sent()
    assert.ok(!/[\r\n]/.test(body.subject), JSON.stringify(body.subject))
    assert.deepEqual(body.to, [TO])
    assert.ok(!('bcc' in body) && !('cc' in body) && !('headers' in body))
    assert.ok(Object.keys(calls[0].opts.headers).every((h) => !/bcc/i.test(h)))
    assert.ok(!/^Bcc:/im.test(body.text), 'the field line must stay on one line')
  })

  test('a Reply-To with CRLF is omitted and the enquiry is still sent', async () => {
    const data = { ...goodData(), email: 'jane@example.com\r\nBcc: x@example.com' }
    const r = await run(event({ form_name: 'consultation', id: 's2', data }))
    assert.equal(r.statusCode, 200)
    assert.equal(calls.length, 1)
    assert.ok(!('reply_to' in sent()))
  })

  test('two addresses in Reply-To: omitted, still sent', async () => {
    const data = { ...goodData(), email: 'a@example.com, b@example.com' }
    await run(event({ form_name: 'consultation', id: 's3', data }))
    assert.equal(calls.length, 1)
    assert.ok(!('reply_to' in sent()))
  })

  test('one valid Reply-To passes through unchanged', async () => {
    await run(goodEvent())
    assert.equal(sent().reply_to, 'jane@example.com')
  })

  test('an address longer than 254 characters is omitted', async () => {
    const data = { ...goodData(), email: `${'a'.repeat(250)}@example.com` }
    await run(event({ form_name: 'consultation', id: 's4', data }))
    assert.equal(calls.length, 1)
    assert.ok(!('reply_to' in sent()))
  })
})

describe('honeypot and empty submissions', () => {
  for (const field of ['bot-field', 'company']) {
    test(`honeypot "${field}" filled: no fetch, 200, "honeypot" logged`, async () => {
      const r = await run(event({ form_name: 'consultation', id: 's5', data: { ...goodData(), [field]: 'I am a bot' } }))
      assert.equal(r.statusCode, 200)
      assert.equal(calls.length, 0)
      assert.ok(logs.includes('honeypot'))
    })
    test(`honeypot "${field}" empty or blank does not block a real enquiry`, async () => {
      await run(event({ form_name: 'consultation', id: 's6', data: { ...goodData(), [field]: '   ' } }))
      assert.equal(calls.length, 1)
    })
  }

  test('no name, phone or email: skipped, no fetch, 200', async () => {
    const r = await run(event({ form_name: 'consultation', id: 's7', data: { message: 'just a message', suburb: 'X' } }))
    assert.equal(r.statusCode, 200)
    assert.equal(calls.length, 0)
  })

  test('only a phone number is enough to send', async () => {
    await run(event({ form_name: 'consultation', id: 's8', data: { phone: '0820000000' } }))
    assert.equal(calls.length, 1)
    assert.match(sent().subject, /the website$/)
  })
})

describe('caps and known fields only', () => {
  test('oversize fields are capped', async () => {
    const data = { name: 'N'.repeat(500), phone: '1'.repeat(1000), email: 'jane@example.com', suburb: 'S'.repeat(900), sector: 'R'.repeat(900), projectType: 'P'.repeat(900), message: 'M'.repeat(5000) }
    await run(event({ form_name: 'consultation', id: 's9', data }))
    const body = sent()
    assert.ok(body.subject.length <= 'New consultation request from '.length + 80)
    const get = (label) => body.text.split('\n').find((l) => l.startsWith(`${label}: `)).slice(label.length + 2)
    for (const label of ['Name', 'Phone', 'Suburb', 'Residential or commercial', 'Type of project']) assert.equal(get(label).length, 200, label)
    const message = body.text.split('Message:\n')[1]
    assert.equal(message.length, 2000)
    assert.ok(body.text.length <= 6 * 220 + 2100)
  })

  test('only known fields reach the email; extra keys and non-string values are ignored', async () => {
    const data = { ...goodData(), evil: 'INJECTED-KEY', 'Bcc': 'x@example.com', phone: { nested: 'object' }, suburb: ['array'] }
    await run(event({ form_name: 'consultation', id: 's10', data }))
    const body = sent()
    assert.ok(!body.text.includes('INJECTED-KEY') && !body.text.includes('x@example.com') && !body.text.includes('object') && !body.text.includes('array'))
    assert.match(body.text, /^Phone: -$/m)
    assert.ok(!('bcc' in body))
  })

  test('a multi-line message keeps its line breaks; control characters are removed', async () => {
    const data = { ...goodData(), message: 'Line one\r\nLine two\u0000\u0007 end' }
    await run(event({ form_name: 'consultation', id: 's11', data }))
    const message = sent().text.split('Message:\n')[1]
    assert.equal(message, 'Line one\nLine two end')
  })
})

describe('the request itself', () => {
  test('URL, method, auth, one recipient, plain text only', async () => {
    const r = await run(goodEvent())
    assert.equal(r.statusCode, 200)
    assert.equal(calls.length, 1)
    const { url, opts } = calls[0]
    assert.equal(url, 'https://api.resend.com/emails')
    assert.equal(opts.method, 'POST')
    assert.equal(opts.headers.Authorization, `Bearer ${KEY}`)
    assert.equal(opts.headers['Content-Type'], 'application/json')
    assert.ok(opts.headers['User-Agent'])
    assert.ok(opts.signal instanceof AbortSignal)
    const body = sent()
    assert.equal(body.from, FROM)
    assert.deepEqual(body.to, [TO])
    assert.equal(typeof body.subject, 'string')
    assert.equal(typeof body.text, 'string')
    assert.ok(!('html' in body) && !('react' in body) && !('attachments' in body))
    assert.deepEqual(Object.keys(body).sort(), ['from', 'reply_to', 'subject', 'text', 'to'])
    assert.equal(body.subject, 'New consultation request from Jane Customer')
    assert.match(body.text, /^Name: Jane Customer\nPhone: 0820000000\nEmail: jane@example\.com\nSuburb: Exampleton\nResidential or commercial: Residential\nType of project: Kitchen\n\nMessage:\nHello there\.$/)
  })

  test('the submission id becomes the Idempotency-Key', async () => {
    await run(goodEvent({ id: 'abc-123' }))
    assert.equal(calls[0].opts.headers['Idempotency-Key'], 'abc-123')
  })

  test('a missing, oversize or odd submission id sends no Idempotency-Key, and still sends', async () => {
    for (const id of [undefined, '', 'x'.repeat(257), 'has space', 'new\r\nline']) {
      calls = []
      await run(goodEvent({ id }))
      assert.equal(calls.length, 1)
      assert.ok(!('Idempotency-Key' in calls[0].opts.headers), JSON.stringify(id))
    }
  })

  test('exactly one email per submission', async () => {
    await run(goodEvent())
    assert.equal(calls.length, 1)
  })
})

describe('logging', () => {
  test('success and failure paths never log the key, the recipient, the sender or any submission value', async () => {
    await run(goodEvent())
    respond(500, { message: 'boom' })
    await run(goodEvent())
    globalThis.fetch = async () => { throw new Error('down') }
    await run(goodEvent())
    assert.ok(logs.length >= 3)
    for (const secret of [KEY, TO, 'noreply@example.com', 'Jane', 'Customer', '0820000000', 'jane@example.com', 'Exampleton', 'Hello there']) {
      assert.ok(logs.every((l) => !l.includes(secret)), `"${secret}" was logged: ${logs.join(' | ')}`)
    }
    assert.ok(logs.some((l) => l.includes('Notification sent for form "consultation"')))
  })
})
