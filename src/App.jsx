import { useState } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { useReducedMotion, useSmoothScroll } from './lib/motion.js'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Services from './components/Services.jsx'
import Process from './components/Process.jsx'
import Trevor from './components/Trevor.jsx'
import Work from './components/Work.jsx'
import Trade from './components/Trade.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const reduced = useReducedMotion()
  useSmoothScroll(reduced)
  const [presetType, setPresetType] = useState('')

  return (
    <LazyMotion features={domAnimation} strict>
      <a href="#main" className="label fixed left-4 top-4 z-50 -translate-y-24 bg-ink px-4 py-3 text-paper focus:translate-y-0">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Services />
        <Process />
        <Trevor />
        <Work />
        <Trade onTradeEnquiry={() => setPresetType('Trade project (to spec)')} />
        <Contact presetType={presetType} />
      </main>
      <Footer />
    </LazyMotion>
  )
}
