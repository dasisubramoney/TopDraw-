// All copy and contact details live here. Anything in [BRACKETS] is a placeholder
// that must be replaced before launch. Values marked CONFIRM came from reading the
// photographs and need checking with Trevor.

export const contact = {
  phoneDisplay: '082 332 1112',
  phoneHref: 'tel:+27823321112',
  email: 'topdraw19@gmail.com',
  // WhatsApp number in international format without + or spaces.
  // Assumed to be the same as the phone number; change it if Trevor uses another.
  whatsappNumber: '27823321112',
  whatsappMessage: 'Hi Trevor, I found Top Draw online and would like to talk about a project.',
  area: 'Gauteng',
  hours: [
    { days: 'Mon to Fri', time: '08:00 to 17:00' },
    { days: 'Sat and Sun', time: 'Closed' },
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
  { id: 'contact', code: 'A-05', label: 'Contact' },
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
  barCounter: { name: 'bar-counter-steel-timber', widths: [800, 1600], w: 2400, h: 1800, alt: 'Long timber-topped bar counter on a painted steel frame in front of a brick-pattern wall, with four swivel bar stools on a concrete floor' },
  deli: { name: 'deli-island-shopfit', widths: [800, 1600], w: 2400, h: 1560, alt: 'Corner deli counter in a supermarket: a pale timber-look shelving base with a black top and angled glass display cases' },
  hutch: { name: 'painted-cabinet', widths: [800, 1600], w: 1800, h: 2400, alt: 'Painted open-shelf cabinet with a drawer and two panelled doors below, standing in a corner' },
  glossKitchen: { name: 'kitchen-white-gloss-pendants', widths: [800, 1600], w: 2400, h: 1800, alt: 'Kitchen with white gloss wall units, timber-look base units, a black granite peninsula, a metro tile splashback and three glass pendant lights' },
  laundry: { name: 'laundry-white-charcoal', widths: [800, 1600], w: 1800, h: 2400, alt: 'Laundry room with white wall cupboards, charcoal base units, a marble-look worktop with a double sink and a herringbone timber-look floor' },
  fridgeUnit: { name: 'tall-unit-fridge-surround', widths: [800, 1600], w: 1800, h: 2400, alt: 'Pale oak-look tall cabinets built around a stainless steel fridge, with a microwave shelf and a bank of drawers' },
  longVanity: { name: 'bathroom-long-vanity', widths: [800, 1600], w: 2400, h: 1800, alt: 'Long bathroom vanity with pale drawers and doors, a stone top with two basins and a framed mirror above, beside a corner bath' },
  graniteKitchen: { name: 'kitchen-black-granite', widths: [800, 1600], w: 1800, h: 2400, alt: 'Light woodgrain kitchen with a black granite worktop, full-height wall units, a hob and an eye-level oven' },
  wardrobeWall: { name: 'wardrobe-wall-white', widths: [800, 1600], w: 2400, h: 1800, alt: 'Wall of floor-to-ceiling white wardrobe doors with brushed metal handles' },
}

export const hero = {
  // The hero shows the logo and the two buttons only (owner's choice, October 2026).
  logo: {
    src: '/images/logo-top-draw.webp',
    srcSmall: '/images/logo-top-draw-sm.webp',
    w: 1308,
    h: 277,
    alt: 'Top Draw Projects.',
  },
  mark: { src: '/images/logo-mark.webp', w: 467, h: 277 },
  descriptor: 'Bespoke kitchens, bathrooms and interiors / Gauteng',
  // Not shown on screen: read by screen readers and search engines as part of the
  // page's main heading, after the logo.
  headline: 'Bespoke kitchens, bathrooms and interiors. Designed, built and installed by one team.',
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
  // Captions over the video, timed to what is on screen (seconds of video time).
  // 2.8 to 5.1 s the kitchen is complete; from about 6.2 s the room is empty.
  captions: [
    {
      id: 'design',
      from: 2.9,
      to: 5.0,
      // Pause the video on the finished kitchen so the caption can be read.
      pauseAt: 4.3,
      pause: 1.5,
      label: 'Bespoke design',
      text: 'We design, build and install bespoke kitchens, bathrooms and interiors.',
    },
    {
      id: 'whitebox',
      from: 6.2,
      label: 'White boxing',
      text: 'We also do white boxing, taking a bare room to a finished shell ready for fit-out.',
    },
  ],
  // The video ends on the empty room; hold it (with the white-boxing caption) this long
  // before the finished kitchen fades back in and the hero copy reveals.
  holdAfterEnd: 3,
  // The finished-kitchen frame (seconds) used as the permanent hero background.
  finalFrame: 4.3,
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

// From Trevor's "Topdraw Workflow Process, Rev 1" (October 2026), edited to the site's voice.
// Facts, durations and percentages are his; nothing here is invented.
export const process = {
  intro:
    'Eight stages from your first enquiry to handover. Manufacturing and site preparation are planned to run side by side, to keep disruption and downtime to a minimum.',
  stages: [
    {
      short: 'Enquiry',
      title: 'Enquiry and consultation',
      text: 'Send an enquiry through the form below. We’ll get back to you to arrange a consultation date that suits you.',
    },
    {
      short: 'Visit and quote',
      title: 'Site visit and quotation',
      text: 'We visit your space to take measurements and talk through your needs, your preferences and how you use the room. Once the scope is clear, you get a quotation, a preliminary design concept and a proposed project timeline.',
    },
    {
      short: 'Sign-off',
      title: 'Approval, final measurements and sign-off',
      text: 'Once you accept the quotation and pay the deposit, we come back to confirm final measurements and specifications, so every detail is finalised before materials are ordered and manufacturing starts.',
      payment: 0,
    },
    {
      short: 'Manufacturing',
      title: 'Material sourcing and manufacturing',
      duration: '10 to 20 working days',
      text: 'After final sign-off, the materials are sourced and your cabinetry is scheduled for manufacture.',
    },
    {
      short: 'Site preparation',
      title: 'Site preparation and removal of the existing kitchen',
      duration: '7 to 10 working days',
      text: 'While your cabinetry is being made, the existing kitchen, cabinetry and fittings are removed where needed. The shell is then prepared for the new layout and footprint, which may include electrical and plumbing alterations, tiling, painting and other building work.',
    },
    {
      short: 'Scheduling',
      title: 'Installation scheduling and downtime',
      text: 'Once the installation date is confirmed, site preparation is scheduled to line up with manufacturing and installation. The preparation, manufacturing and installation teams are coordinated to keep disruption and downtime to a minimum. Timing depends on the complexity of the project and the preparation needed.',
    },
    {
      short: 'Installation',
      title: 'Kitchen installation and finishing',
      duration: '5 to 10 working days',
      text: 'Once the site is ready, your new cabinetry and finishes go in. Installation typically covers:',
      list: [
        'Fitting and securing the cabinetry',
        'Installing worktops',
        'Sink, tap and appliance plumbing',
        'Gas or electric cooking appliances, connected by suitably qualified professionals where applicable',
        'LED lighting and electrical connections',
        'Dishwashers and other integrated appliances',
        'Final adjustments and finishing touches',
      ],
      payment: 1,
    },
    {
      short: 'Handover',
      title: 'Snagging and final handover',
      text: 'We inspect the finished installation, attend to any snag-list items and make sure the agreed scope of work is complete. Then the project is handed over to you to enjoy.',
      payment: 2,
    },
  ],
  notes: [
    'Manufacturing: allow about 10 to 20 working days for material sourcing and manufacturing after final sign-off.',
    'Site preparation: allow about 7 to 10 working days, depending on the work required. It runs alongside manufacturing wherever possible.',
    'Installation: allow about 5 to 10 working days, depending on the size and complexity of the project.',
    'These are estimated working days, not a guaranteed completion date. Some work runs at the same time, and the overall duration depends on material availability, the scope of work, site readiness and the coordination of trades.',
  ],
  payments: {
    intro: 'Payments are tied to three milestones, in step with the progress of your kitchen or cabinetry.',
    items: [
      {
        pct: 70,
        title: 'Initial deposit',
        when: 'On accepting the quotation',
        text: 'Confirms the project, so final measurements, material procurement and manufacturing can go ahead.',
      },
      {
        pct: 20,
        title: 'Installation deposit',
        when: 'On delivery to site',
        text: 'Due on the day the cabinetry and materials are delivered, ready for installation. It marks the move from manufacturing to installation.',
      },
      {
        pct: 10,
        title: 'Final payment',
        when: 'At handover',
        text: 'The balance, due on commissioning and final handover once the agreed work is complete.',
      },
    ],
    footnote: 'All payment milestones and amounts are set out in your approved quotation.',
  },
}

// Based on Trevor's own overview (October 2026), edited to the site's voice.
export const trevor = {
  title: 'The Artisan',
  intro: 'Trevor didn’t start in a joinery shop. He started as a boilermaker.',
  chapters: [
    {
      label: 'Stainless steel',
      text: 'Trevor began as a boilermaker and sheet metal worker in the food and beverage industry. That’s where he built deep technical expertise in stainless steel fabrication.',
    },
    {
      label: 'Balustrading',
      text: 'His career moved into the architectural industry, where custom-designed, bespoke balustrading became his speciality.',
    },
    {
      label: 'Timber',
      text: 'From there he moved into high-end furniture, bespoke cabinetry and interior design, combining technical knowledge with a strong eye for detail and design.',
    },
    {
      label: 'Today',
      text: 'Today he designs, builds and installs bespoke interiors for a wide range of home projects, with a focus on quality and precision. He’s hands-on and proud of his workmanship, gets it right the first time, and goes the extra mile for every client.',
    },
  ],
  // Shown as the drawing's title block at the end of the sequence.
  closing: 'The material changed. The standard didn’t.',
}

export const work = [
  { key: 'W-01', type: 'Kitchen', image: 'kitchenTile', text: 'Patterned tile splashback, painted doors, open shelving', place: '[SUBURB]' },
  { key: 'W-02', type: 'Bathroom', image: 'vanityOak', text: 'Wall-hung vanity with matching floating shelves', place: '[SUBURB]' },
  { key: 'W-03', type: 'Furniture', image: 'dining', text: 'Dining table and bench, steel frames, timber tops', place: '[SUBURB]' },
  { key: 'W-04', type: 'Dressing room', image: 'wardrobe', text: 'Full-height wardrobe and desk under a sloping ceiling', place: '[SUBURB]' },
  { key: 'W-05', type: 'Balustrading', image: 'balustrade', text: 'Loft balustrade under thatch', place: '[SUBURB]' },
  { key: 'W-06', type: 'Furniture', image: 'benchFrame', text: 'Steel frame, timber top', place: '[SUBURB]' },
]

export const sectors = ['Residential', 'Commercial']

export const projectTypes = ['Kitchen', 'Bathroom', 'Dressing room or built-in cupboards', 'Furniture', 'Full turnkey project', 'Trade project (to spec)', 'Something else']
