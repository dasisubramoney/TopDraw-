import { faq } from '../content.js'
import { loadMotion, prefersReducedMotion } from '../lib/motion.js'
import FAQSection from '@/components/ui/faq1'

// Common questions, between Work and Contact: the shadcn FAQ 1 accordion (components/ui/faq1.tsx)
// fed from content.js. Every question and answer is in the prerendered HTML, closed ones too.
// Opening or closing one changes the page height, so the scroll triggers below it re-measure
// (skipped with reduced motion, where the animation code never loads). The height changes at
// once; the refresh waits a frame for the new layout.
const remeasure = (e) => {
  if (prefersReducedMotion() || !e.target.closest('button[aria-expanded]')) return
  requestAnimationFrame(() => loadMotion().then(({ ScrollTrigger }) => ScrollTrigger.refresh()))
}

export default function Faq() {
  return (
    <div onClick={remeasure}>
      <FAQSection
        id="faq"
        eyebrow="FAQ"
        heading={faq.title}
        description={faq.intro}
        faqs={faq.items.map(({ q, a }) => ({ question: q, answer: a }))}
      />
    </div>
  )
}
