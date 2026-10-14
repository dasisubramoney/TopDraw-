import { services } from '../content.js'
import SectionHead from './SectionHead.jsx'

// Plain list of the five services on hairlines: title on the left, description on the right
// from 1024 px, stacked on smaller screens. No photos and nothing that moves.
export default function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="section-pad bg-mist">
      <div className="wrap">
        <SectionHead title="Areas of Expertise" id="services-title" centered />

        <ul className="border-t border-rule">
          {services.map((s) => (
            <li key={s.num} className="grid-12 gap-y-3 border-b border-rule py-8 lg:py-12">
              <h3 className="col-span-12 font-display text-display-m lg:col-span-5">{s.title}</h3>
              <p className="col-span-12 max-w-[52ch] lg:col-span-6 lg:col-start-7">{s.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
