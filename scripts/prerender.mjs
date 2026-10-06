// Renders the page to static HTML at build time so text and the hero image
// paint before JavaScript loads. The client then hydrates the same markup.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const file = resolve('dist/index.html')
const html = readFileSync(file, 'utf8')
if (!html.includes('<div id="root"></div>')) throw new Error('Root element not found in dist/index.html')
writeFileSync(file, html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`))
rmSync(resolve('dist-ssr'), { recursive: true, force: true })
console.log('Prerendered dist/index.html')
