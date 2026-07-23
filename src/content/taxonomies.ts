import type { Industry, Solution } from './types';

/**
 * Solutions and industries.
 *
 * Every entry here is `state: 'draft'` on purpose. A solution page asserts that
 * TALAMIR addresses a named problem, and an industry page asserts sector fit —
 * both are commercial claims, and the portfolio register holds no approved
 * source for either. Drafts render in development so the structure, routing and
 * layout can be reviewed, and are withheld from production by the loader.
 *
 * Promoting one to `published` is a content decision with an owner, not a code
 * change: flip `state`, supply the copy, raise `claimLevel`.
 */
export const solutions: Solution[] = [
  {
    slug: 'operations-visibility',
    title: { ar: 'وضوح العمليات', en: 'Operations Visibility' },
    summary: {
      ar: 'هيكل صفحة جاهز — المحتوى بانتظار مصدر معتمد.',
      en: 'Page structure ready — copy pending an approved source.',
    },
    outcome: {
      ar: 'بانتظار إدخال المالك.',
      en: 'Pending owner input.',
    },
    stages: [],
    claimLevel: 'structural',
    state: 'draft',
    updated: '2026-07-23',
  },
  {
    slug: 'financial-control',
    title: { ar: 'الضبط المالي', en: 'Financial Control' },
    summary: {
      ar: 'هيكل صفحة جاهز — المحتوى بانتظار مصدر معتمد.',
      en: 'Page structure ready — copy pending an approved source.',
    },
    outcome: { ar: 'بانتظار إدخال المالك.', en: 'Pending owner input.' },
    stages: [],
    claimLevel: 'structural',
    state: 'draft',
    updated: '2026-07-23',
  },
  {
    slug: 'workforce-administration',
    title: { ar: 'إدارة القوى العاملة', en: 'Workforce Administration' },
    summary: {
      ar: 'هيكل صفحة جاهز — المحتوى بانتظار مصدر معتمد.',
      en: 'Page structure ready — copy pending an approved source.',
    },
    outcome: { ar: 'بانتظار إدخال المالك.', en: 'Pending owner input.' },
    stages: [],
    claimLevel: 'structural',
    state: 'draft',
    updated: '2026-07-23',
  },
];

export const industries: Industry[] = [
  {
    slug: 'automotive-services',
    title: { ar: 'خدمات المركبات', en: 'Automotive Services' },
    summary: {
      ar: 'هيكل صفحة جاهز — المحتوى بانتظار مصدر معتمد.',
      en: 'Page structure ready — copy pending an approved source.',
    },
    pressures: [],
    regulatoryNote: null,
    claimLevel: 'structural',
    state: 'draft',
    updated: '2026-07-23',
  },
  {
    slug: 'professional-services',
    title: { ar: 'الخدمات المهنية', en: 'Professional Services' },
    summary: {
      ar: 'هيكل صفحة جاهز — المحتوى بانتظار مصدر معتمد.',
      en: 'Page structure ready — copy pending an approved source.',
    },
    pressures: [],
    regulatoryNote: null,
    claimLevel: 'structural',
    state: 'draft',
    updated: '2026-07-23',
  },
  {
    slug: 'retail-and-distribution',
    title: { ar: 'التجزئة والتوزيع', en: 'Retail & Distribution' },
    summary: {
      ar: 'هيكل صفحة جاهز — المحتوى بانتظار مصدر معتمد.',
      en: 'Page structure ready — copy pending an approved source.',
    },
    pressures: [],
    regulatoryNote: null,
    claimLevel: 'structural',
    state: 'draft',
    updated: '2026-07-23',
  },
];
