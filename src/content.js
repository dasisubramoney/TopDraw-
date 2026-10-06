// All copy and contact details live here. Anything in [BRACKETS] is a placeholder
// that must be replaced before launch. Values marked CONFIRM came from reading the
// photographs and need checking with Trevor.

export const contact = {
  phoneDisplay: '[PHONE]',
  phoneHref: '', // e.g. 'tel:+27821234567'
  email: '[EMAIL]',
  // WhatsApp number in international format without + or spaces, e.g. '27821234567'.
  whatsappNumber: '[WHATSAPP NUMBER]',
  whatsappMessage: 'Hi Trevor, I found Top Draw online and would like to talk about a project.',
  area: '[AREA]',
  // e.g. 'Free within [AREA]' or 'R___, credited against the job'
  siteVisit: '[SITE VISIT: FREE OR FEE]',
  hours: [
    { days: 'Mon to Fri', time: '[HOURS]' },
    { days: 'Saturday', time: '[HOURS]' },
  ],
  social: [
    { label: 'Instagram', href: '[INSTAGRAM URL]' },
    { label: 'Facebook', href: '[FACEBOOK URL]' },
  ],
}

export const whatsappHref = () => {
  const n = /^\d{9,15}$/.test(contact.whatsappNumber) ? contact.whatsappNumber : ''
  return `https://wa.me/${n}?text=${encodeURIComponent(contact.whatsappMessage)}`
}

export const nav = [
  { id: 'services', code: 'A-01', label: 'Services' },
  { id: 'process', code: 'A-02', label: 'Process' },
  { id: 'trevor', code: 'A-03', label: 'Trevor' },
  { id: 'work', code: 'A-04', label: 'Work' },
  { id: 'trade', code: 'A-05', label: 'Trade' },
  { id: 'contact', code: 'A-06', label: 'Contact' },
]

// Images: `sizes` lists the widths actually exported to /public/images.
export const img = {
  kitchen2: { name: 'kitchen-charcoal-island-2', widths: [800, 1600], w: 2400, h: 1800, alt: 'Charcoal kitchen with a white stone-topped island, pendant lights, a full-height panel and a fridge recess' },
  newBuild: { name: 'kitchen-new-build', widths: [800, 1000], w: 1000, h: 750, alt: 'Open-plan new-build kitchen with a dark waterfall island, timber-faced units and a wine rack, pendant lights still wrapped before handover' },
  library: { name: 'library-ladder', widths: [750], w: 750, h: 1000, alt: 'Floor-to-ceiling painted library shelving with a rolling ladder and cupboards below' },
  loftShell: { name: 'loft-shell-in-progress', widths: [800, 1600], w: 2400, h: 1800, alt: 'Thatched double-volume room mid-renovation, with a stone chimney, timber loft balustrade and new kitchen base units' },
  vanityInstall: { name: 'vanity-mirror-cabinet', widths: [800, 1600], w: 1800, h: 2064, alt: 'Bathroom vanity in timber-look drawers with a white top and a full-width mirrored cabinet, offcuts still on the counter during installation' },
  kitchenTile: { name: 'kitchen-patterned-tile', widths: [800, 1600], w: 2400, h: 1800, alt: 'Light kitchen with a patterned tile splashback, open floating shelves and a peninsula worktop' },
  vanityOak: { name: 'vanity-floating-oak', widths: [800, 1600], w: 1800, h: 2400, alt: 'Wall-hung timber vanity with two drawers, a round basin and matching floating shelves beside the bath' },
  wardrobe: { name: 'wardrobe-eaves-oak', widths: [800, 1600], w: 2400, h: 1800, alt: 'Full-height timber wardrobe with a bulkhead, built into a room with a sloping ceiling, with open shelves and a desk shelf under the eaves' },
  dining: { name: 'dining-table-steel-oak', widths: [800, 1600], w: 2400, h: 1800, alt: 'Dining table and bench in pale timber, each held in black steel box-section frames' },
  benchFrame: { name: 'bench-steel-frame', widths: [800, 1600], w: 2400, h: 1800, alt: 'End view of a black steel frame wrapping a pale timber top, showing the welded corners' },
  balustrade: { name: 'loft-balustrade', widths: [800, 1600], w: 2400, h: 1800, alt: 'Loft under a thatched roof with a long timber pole balustrade along the edge and a staircase opening' },
  tallUnit: { name: 'tall-unit-charcoal', widths: [800, 1600], w: 1800, h: 2400, alt: 'Charcoal full-height cupboard beside a low open shelving unit with a white top and black floating shelves above' },
}

export const hero = {
  eyebrow: 'Interiors / Johannesburg',
  audienceLine: 'For homeowners, interior designers and architects',
  headline: 'Bespoke kitchens, bathrooms and interiors. Designed, built and installed by one team.',
  lead: "Trevor trained as a stainless steel fabricator, where a millimetre out means it doesn't fit. He runs every job himself, from the first site measure to the final hinge adjustment, so it's right the first time.",
  // Shown under 640px so the copy fits above the fold on small phones.
  leadShort: "A steel fabricator turned cabinetmaker, Trevor runs every job himself, so it's right the first time.",
  primaryCta: 'Book a site consultation',
  secondaryCta: 'WhatsApp Trevor',
}

// Hero intro video: plays on every page load, then holds on its last frame (the empty room).
export const intro = {
  sources: {
    mobile: '/video/intro-mobile.mp4', // 720 x 720, used under 768px
    webm: '/video/intro-desktop.webm', // 1920 x 1080
    mp4: '/video/intro-desktop.mp4',
  },
  revealAt: 6.6, // seconds; the reveal starts here or on "ended", whichever comes first
  // Dimension lines drawn onto the last frame, in the video's own pixel coordinates.
  // The figures are illustrative "measuring up" notes, not survey data. If the final
  // video frames the room differently, adjust these against its last frame.
  annotations: {
    desktop: {
      w: 1920,
      h: 1080,
      font: 15,
      dims: [
        { dir: 'v', x: 1560, y1: 175, y2: 790, label: '2 700 mm' },
        { dir: 'v', x: 1150, y1: 300, y2: 625, label: '2 032 mm' },
        { dir: 'h', y: 262, x1: 1262, x2: 1520, label: '1 450 mm' },
      ],
    },
    mobile: {
      w: 720,
      h: 720,
      font: 11,
      dims: [
        { dir: 'v', x: 340, y1: 206, y2: 312, label: '1 050 mm' },
        { dir: 'v', x: 448, y1: 202, y2: 415, label: '2 032 mm' },
      ],
    },
  },
}

export const services = [
  {
    num: '01',
    title: 'Full turnkey projects',
    text: 'One team from concept to final completion: design, manufacture, installation and every trade in between.',
    image: 'newBuild',
    caption: 'New build, open-plan kitchen',
  },
  {
    num: '02',
    title: 'General carpentry',
    text: 'Libraries, shelving, built-in cupboards, doors and trim. Made in the workshop and fitted to the room.',
    image: 'library',
    caption: 'Library wall with rolling ladder',
  },
  {
    num: '03',
    title: 'Kitchen and bathroom design',
    text: 'Layouts drawn around how you cook and live, detailed down to the hinge, the handle and the last 2 mm of a scribe.',
    image: 'kitchen2',
    caption: 'Kitchen with island',
  },
  {
    num: '04',
    title: 'Shell prep for new cabinetry',
    text: 'Walls, floors and services checked and set out true before a single carcass arrives on site.',
    image: 'loftShell',
    caption: 'Renovation, mid-build',
  },
  {
    num: '05',
    title: 'Project management',
    text: 'One programme, one point of contact. Trevor co-ordinates the plumber, the electrician and the stone fitter so you don’t have to.',
    image: 'vanityInstall',
    caption: 'Bathroom, during installation',
  },
]

export const process = {
  intro: 'Five stages, one team. Nothing is handed over to someone who wasn’t there for the last stage.',
  stages: [
    { num: '01', title: 'Concept', text: 'We meet on site, measure up and talk through how you use the room. You get a straight answer on budget and timing.' },
    { num: '02', title: 'Design', text: 'Layouts and shop drawings, with materials, finishes and hardware specified before anything is cut.' },
    { num: '03', title: 'Manufacture', text: 'Built in our workshop to the drawing and to the measured site, not to a catalogue size.' },
    { num: '04', title: 'Install', text: 'Fitted by the people who built it, with Trevor on site.' },
    { num: '05', title: 'Completion', text: 'Final adjustments, a walk-through with you and a clean site at handover.' },
  ],
}

export const trevor = {
  title: 'From steel to timber',
  intro: 'Trevor didn’t start in a joinery shop. He started as a boilermaker.',
  chapters: [
    {
      label: 'Stainless steel',
      text: 'Boilermaker and sheet metal worker, fabricating stainless steel for the food and beverage industry. Work where a poor weld or a millimetre out isn’t good enough.',
    },
    {
      label: 'Balustrading',
      text: 'Into architectural work, specialising in custom balustrading. No two staircases are the same, so every piece is measured on site and made to fit.',
    },
    {
      label: 'Timber',
      text: 'Then high-end furniture, bespoke cabinetry and interior design. The material changed. The standard didn’t.',
    },
  ],
  close: 'He’s hands-on, he gets it right the first time, and he’ll go the extra mile to do it.',
  figure: { image: 'benchFrame', caption: 'Steel frame, timber top', note: 'Welded box section' },
}

export const work = [
  { key: 'W-01', type: 'Kitchen', image: 'kitchenTile', text: 'Patterned tile splashback, painted doors, open shelving', place: '[SUBURB]' },
  { key: 'W-02', type: 'Bathroom', image: 'vanityOak', text: 'Wall-hung vanity with matching floating shelves', place: '[SUBURB]' },
  { key: 'W-03', type: 'Furniture', image: 'dining', text: 'Dining table and bench, steel frames, timber tops', place: '[SUBURB]' },
  { key: 'W-04', type: 'Dressing room', image: 'wardrobe', text: 'Full-height wardrobe and desk under a sloping ceiling', place: '[SUBURB]' },
  { key: 'W-05', type: 'Balustrading', image: 'balustrade', text: 'Loft balustrade under thatch', place: '[SUBURB]' },
]

export const trade = {
  title: 'For designers and architects',
  intro: 'You’ve drawn it. We build it to your drawing, install it properly and leave your client with what you specified.',
  points: [
    { label: 'To spec', text: 'We work from your drawings, finishes schedule and hardware list. Substitutions are agreed with you, not made on site.' },
    { label: 'Shop drawings', text: 'Shop drawings come back to you for sign-off before anything is manufactured.' },
    { label: 'Site ready', text: 'We check the shell, levels and services before install, and flag problems early.' },
    { label: 'On programme', text: 'One point of contact who works to your programme and alongside your contractors.' },
  ],
  cta: 'Send Trevor your drawings',
}

export const projectTypes = ['Kitchen', 'Bathroom', 'Dressing room or built-in cupboards', 'Furniture', 'Full turnkey project', 'Trade project (to spec)', 'Something else']
