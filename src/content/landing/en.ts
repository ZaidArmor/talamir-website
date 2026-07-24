import type { LandingCopy } from './types';

/**
 * English landing copy — the secondary language.
 *
 * Structurally identical to `ar.ts` by type, not by convention: `LandingCopy`
 * makes a missing or renamed key a compile error, so the two languages cannot
 * drift apart silently the way parallel JSON files always do.
 */
export const landingEn: LandingCopy = {
  meta: {
    title: 'TALAMIR — Ideas into systems',
    description:
      'TALAMIR is a Saudi technology ecosystem building specialized platforms for business operations, finance and the automotive care industry.',
  },

  nav: {
    ecosystem: 'Ecosystem',
    buy: 'What you can buy',
    sell: 'For suppliers',
    fit: 'Fit finder',
    activity: 'Building now',
    faq: 'FAQ',
    cta: 'Start a conversation',
    skip: 'Skip to content',
    primaryLabel: 'Primary navigation',
    menuLabel: 'Navigation menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    languageLabel: 'Language',
    homeLabel: 'TALAMIR — home',
  },

  preloader: { line: 'From idea to a working system' },

  hero: {
    kicker: 'A Saudi technology ecosystem',
    title: 'We build tools that turn your business into a working system.',
    alt: 'نبني أدوات تحوّل أعمالك إلى نظام يعمل.',
    sub: 'TALAMIR is a Saudi technology ecosystem building specialized platforms for business operations, finance and the automotive care industry.',
    primaryCta: 'Find the right tool',
    secondaryCta: 'Explore the ecosystem',
  },

  paths: {
    title: 'What do you want to improve?',
    sub: "Pick your path — we'll take you straight to the right solution.",
    options: [
      { label: 'I want to run my company and branches efficiently', target: 'vexora-erp' },
      {
        label: 'I want to manage accounting, tax and financial reporting',
        target: 'vexora-finance',
      },
      { label: 'I run a car-care and protection center', target: 'sultan' },
      { label: 'I want protection and care for my own car', target: 'car-care' },
    ],
    chosen: 'Our pick for you:',
  },

  about: {
    tag: 'What is TALAMIR?',
    title: 'A Saudi parent brand building specialized products — not one piece of software.',
    paragraphs: [
      'TALAMIR is a Saudi-born, globally-minded technology ecosystem building digital products, cloud platforms, operational systems and connected commercial experiences.',
      'Every product in the ecosystem is legally, operationally and technically independent, carrying its own identity with a clear endorsement from the parent brand.',
      'We build with Intelligent Motion: from a point, to a path, to an orbit, to a system that runs and scales.',
    ],
  },

  builds: {
    title: 'What TALAMIR builds',
    items: [
      {
        title: 'Specialized digital products',
        body: 'Tools designed for a specific industry, not generic software.',
      },
      { title: 'Cloud platforms', body: 'Cloud infrastructure that carries multi-branch growth.' },
      {
        title: 'Operational systems',
        body: 'Operations, tasks, approvals and reporting in one environment.',
      },
      {
        title: 'Connected commercial experiences',
        body: 'A specialized marketplace connecting suppliers with service centers.',
      },
    ],
  },

  ecosystem: {
    tag: 'Ecosystem',
    title: 'The TALAMIR ecosystem',
    sub: 'TALAMIR at the core, four independent entities around it — each with its own identity, type and status. Select any node.',
    hint: 'Navigate by click or arrow keys',
    boundary:
      'Each product keeps its own data, accounts and subscriptions — no shared database, no single login.',
    mapLabel: 'TALAMIR ecosystem entities',
    panelLabel: 'Selected entity detail',
  },

  sultan: {
    tag: 'Deep dive: SULTAN',
    title: 'The operating system of the automotive care and protection industry.',
    experiencesTitle: 'Supported experiences',
    experiences: [
      'Cloud web platform',
      'Desktop application / agent',
      'Mobile control and monitoring',
      'Cutting-machine integrations',
      'Vehicle and cutting-pattern data',
      'Roll and material management',
      'Marketplace capabilities',
    ],
    note: 'These represent product scope and roadmap — not everything is launched yet.',
  },

  buy: {
    tag: 'What can you get?',
    title: 'What can you get from the TALAMIR ecosystem?',
    columns: [
      {
        title: 'Software & subscriptions',
        items: [
          'SULTAN access',
          'VEXORA ERP access',
          'VEXORA Finance access',
          'Product modules when officially available',
          'Implementation and onboarding requests',
          'Business discovery sessions',
          'Future integrations and connectors',
        ],
        action: 'Request a demo',
      },
      {
        title: 'Automotive marketplace via SULTAN',
        items: [
          'PPF rolls',
          'Automotive window film',
          'Building window film',
          'Car-care chemicals',
          'Installation tools',
          'Tools and accessories',
          'Service-center supplies',
          'Laser-cut leather mats when available',
        ],
        action: 'Register marketplace interest',
      },
      {
        title: 'Armor services',
        items: [
          'Paint Protection Film',
          'Automotive window tint',
          'Building window film',
          'Nano ceramic',
          'Professional polishing',
          'Other approved Armor services',
        ],
        action: 'Explore Armor services',
      },
    ],
    note: 'No prices are shown at this stage — contact us for a tailored plan.',
    actions: ['Request a demo', 'Join early access', 'Request a tailored plan'],
  },

  sell: {
    tag: 'For suppliers',
    title: 'Sell to a specialized industry.',
    status: 'In development — Register your interest',
    sub: "Qualified suppliers may express interest in listing products through SULTAN's planned marketplace.",
    categoriesTitle: 'Potential supplier categories',
    categories: [
      'PPF manufacturers and distributors',
      'Window-film suppliers',
      'Car-care chemical brands',
      'Installation-tool suppliers',
      'Accessories suppliers',
      'Service-center equipment providers',
    ],
    capabilitiesTitle: 'Possible future seller capabilities',
    capabilities: [
      'Supplier profile',
      'Product listings',
      'Product specifications',
      'Inventory visibility',
      'Order management',
      'Serial and batch information where applicable',
      'Saudi market reach',
      'Commercial inquiry management',
    ],
    cta: 'Register as a seller',
  },

  market: {
    tag: 'Marketplace journey',
    title: 'From supplier to completed order.',
    steps: ['Supplier', 'Product', 'TALAMIR / SULTAN network', 'Service center', 'Completed order'],
    sub: 'A specialized marketplace connecting suppliers with car-care centers — one organized orbit.',
    flowLabel: 'Marketplace journey stages',
  },

  fit: {
    tag: 'Quick check',
    title: 'Which TALAMIR tool fits your business?',
    restart: 'Restart',
    progressLabel: 'Step',
    questions: [
      {
        question: 'What type of organization do you operate?',
        options: [
          'A company with branches',
          'Accounting or financial advisory firm',
          'Car-care & protection center',
          'Car owner',
        ],
      },
      {
        question: 'What is your main operational challenge?',
        options: [
          'Scattered operations and branches',
          'Accounting, tax and reporting',
          'Cutting, rolls and branch management',
          'I need a service for my car',
        ],
      },
      {
        question: 'Which platform experience do you need?',
        options: [
          'Web + desktop + mobile',
          'Web with financial reporting',
          'Cloud + desktop agent + machines',
          'A branch visit',
        ],
      },
      {
        question: 'Where are you now?',
        options: [
          'Exploring',
          'Preparing to purchase',
          'Seeking early access',
          'I need the service now',
        ],
      },
    ],
    whyTitle: 'Why it fits',
    benefitsTitle: 'Key benefits',
    statusTitle: 'Current availability',
    disclaimer: 'This is guidance only — not professional financial or legal advice.',
    results: {
      'vexora-erp': {
        why: 'You need company, branch, inventory and task operations in one environment.',
        benefits: [
          'Operations and branches in one system',
          'Structured tasks, approvals and reporting',
          'Web, desktop and mobile',
        ],
      },
      'vexora-finance': {
        why: 'Your focus is accounting, tax and financial reporting for the Saudi market.',
        benefits: [
          'Clear accounting and financial reporting',
          'VAT and Zakat workflows',
          'A portal for accounting firms',
        ],
      },
      sultan: {
        why: "You run a car-care center and need the industry's specialized system.",
        benefits: [
          'Vehicle data and cutting patterns',
          'Roll, material and branch management',
          'A specialized supplies marketplace',
        ],
      },
      'car-care': {
        why: 'You want real protection and care for your car from a team operating since 2012.',
        benefits: [
          'PPF, tint and nano ceramic',
          'Branches in Abha, Khamis Mushait and Jazan',
          'Real operating experience',
        ],
      },
    },
  },

  activity: {
    tag: 'System signals',
    title: 'What are we building now?',
    directionLabel: 'Current direction',
    note: 'No invented percentages, release dates or user numbers.',
  },

  how: {
    tag: 'How we work',
    title: 'How TALAMIR works',
    steps: [
      {
        title: 'Understand the industry',
        body: 'From real operations and real needs, not assumptions.',
      },
      {
        title: 'Build with precision',
        body: 'Scalable architecture with permissions and audit trails.',
      },
      {
        title: 'Launch and operate',
        body: 'An independent product with a clear identity under the parent.',
      },
      { title: 'Scale', body: 'Modules and integrations added without breaking the system.' },
    ],
  },

  platforms: {
    tag: 'Platforms',
    title: 'Web, desktop and mobile.',
    sub: "Each product offers the experiences its industry needs — cloud on the web, a desktop agent where required (e.g. SULTAN's cutting machines), and mobile for monitoring.",
    surfaces: ['WEB', 'DESKTOP', 'MOBILE'],
  },

  benefits: {
    tag: 'Why TALAMIR',
    title: 'Clear benefits for Saudi businesses',
    items: [
      'Specialized products, not generic software',
      'Arabic-first experience',
      'English support',
      'Cloud access',
      'Desktop support where applicable',
      'Mobile support where applicable',
      'Multi-branch thinking',
      'Operational visibility',
      'Structured workflows',
      'Permission and audit-oriented design',
      'Saudi-market requirements from day one',
      'Scalable product architecture',
    ],
  },

  trust: {
    tag: 'Trust & boundaries',
    title: 'Clarity we commit to.',
    items: [
      'Every product is legally, operationally and technically independent — no shared database or single login.',
      'We never announce government integrations or certifications before they are officially complete.',
      'Product statuses are explicit: research, architecture, building, testing, operating, early access.',
      'No prices, numbers or endorsements that are not verified.',
    ],
  },

  faq: {
    tag: 'FAQ',
    title: 'Questions we hear often.',
    items: [
      {
        question: 'Is TALAMIR one product?',
        answer:
          'No. TALAMIR is a parent brand building independent products: SULTAN, VEXORA ERP and VEXORA Finance, plus Armor as an operating brand.',
      },
      {
        question: 'Can I subscribe now?',
        answer:
          'The technology products are in development — you can join early access and request a demo. Armor services are operating today.',
      },
      {
        question: 'Are my accounts shared across products?',
        answer:
          'No. Each product keeps its own data, accounts and subscriptions unless a future integration is explicitly approved.',
      },
      {
        question: 'Is Armor a software product?',
        answer:
          'No. Armor is a Saudi operating brand in automotive care and protection since 2012, under the TALAMIR umbrella.',
      },
      {
        question: 'How do I sell through SULTAN?',
        answer:
          "SULTAN's marketplace is in development — register your interest as a supplier and we'll contact you when listing opens.",
      },
      {
        question: 'Are prices published?',
        answer: "No prices at this stage; request a tailored plan and we'll get back to you.",
      },
    ],
  },

  contact: {
    title: "Let's turn your need into a working system.",
    sub: "Tell us about your organization and challenge, and we'll guide you to the right TALAMIR tool.",
    fields: {
      name: 'Full name',
      company: 'Company name',
      city: 'City',
      contact: 'Phone or email',
      challenge: 'Primary challenge (optional)',
    },
    selects: {
      business: {
        label: 'Business type',
        options: [
          'Company / branches',
          'Accounting firm',
          'Car-care center',
          'Industry supplier',
          'Other',
        ],
      },
      product: {
        label: 'Product of interest',
        options: ['SULTAN', 'VEXORA ERP', 'VEXORA Finance', 'Armor services', 'Marketplace'],
      },
      timeline: {
        label: 'Purchase timeline',
        options: ['Exploring', 'Within 3 months', 'Within 6 months', 'Early access'],
      },
      preference: { label: 'Preferred contact method', options: ['Call', 'WhatsApp', 'Email'] },
    },
    consent: 'I agree to be contacted about my request.',
    submit: 'Send request',
    disabledNote:
      'The official intake channel is being set up — the form will not actually send until it is connected.',
    incompleteNote: 'Please complete the fields and agree to be contacted.',
  },

  footer: {
    blurb:
      'A Saudi technology ecosystem building specialized products, platforms and systems — engineered to scale, designed to endure.',
    navLabel: 'Navigate',
    ecosystemLabel: 'Ecosystem',
    rights: '© 2026 TALAMIR — All rights reserved.',
    signature: 'talamir.org · Ideas into systems.',
  },
};
