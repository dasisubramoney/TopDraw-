import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// shadcn "FAQ 1" block, re-themed to the site: a centred eyebrow, heading and description, then a
// single-open accordion (the first question starts open). Changes from the original: site
// palette and type instead of shadcn tokens, content passed in as props (no demo copy), each
// question is an h3 (Radix's Header), and `id` labels the section.

export interface FaqItem {
  question: string
  answer: string
}

export interface FAQSectionProps {
  id?: string
  eyebrow?: string
  heading: string
  description?: string
  faqs: FaqItem[]
}

export default function FAQSection({ id = "faq", eyebrow = "FAQ", heading, description, faqs }: FAQSectionProps) {
  const titleId = `${id}-title`
  return (
    <section id={id} aria-labelledby={titleId} className="section-pad w-full bg-paper">
      <div className="wrap">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center lg:mb-16">
            <p className="label mb-4 text-steel">{eyebrow}</p>
            <h2 id={titleId} className="mb-5 text-display-l">
              {heading}
            </h2>
            {description && <p className="mx-auto max-w-[48ch] text-body-l">{description}</p>}
          </div>

          <Accordion type="single" collapsible defaultValue="item-0" className="border-t border-rule">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-display text-[1.375rem] font-normal leading-snug">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-[60ch] break-words">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
