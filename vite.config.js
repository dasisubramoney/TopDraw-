import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { contact } from './src/content.js'

const pkg = (names) => new RegExp(`[\\\\/]node_modules[\\\\/](${names.join('|')})[\\\\/]`)

// index.html cannot import JavaScript, so facts it repeats (the structured data and the no-JavaScript
// paragraph) are filled in here from src/content.js: change the email there and it changes everywhere.
// Runs before Vite's own %ENV% replacement, which would otherwise warn about these names.
const contentPlaceholders = () => ({
  name: 'content-placeholders',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => html.replaceAll('%CONTACT_EMAIL%', contact.email),
  },
})

export default defineConfig({
  plugins: [contentPlaceholders(), react(), tailwindcss()],
  resolve: {
    // shadcn-style imports: "@/components/ui/...", "@/lib/utils"
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        // Vite 8 bundles with Rolldown, where `codeSplitting.groups` replaces the old
        // `manualChunks`. Three long-lived vendor chunks cache well across deploys.
        codeSplitting: {
          groups: [
            { name: 'vendor', test: pkg(['react', 'react-dom', 'scheduler']), priority: 30 },
            { name: 'motion', test: pkg(['framer-motion', 'motion-dom', 'motion-utils']), priority: 20 },
            { name: 'gsap', test: pkg(['gsap']), priority: 10 },
          ],
        },
      },
    },
  },
})
