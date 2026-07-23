import type { Product } from './types';

/**
 * Product registry.
 *
 * Sourced from `talamir-product-portfolio/portfolio/PORTFOLIO-REGISTER.md`.
 * That register states only facts confirmed from repository context and marks
 * everything else `UNKNOWN — OWNER INPUT REQUIRED`. This file inherits that
 * discipline: both entries are `claimLevel: 'structural'` because no approved
 * source places either product at commercial readiness.
 *
 * Adding a future product = appending one object. Routes, navigation, sitemap,
 * JSON-LD and internal search all derive from this array.
 */
export const products: Product[] = [
  {
    slug: 'vexora',
    code: 'PRD-VEXORA',
    title: { ar: 'VEXORA', en: 'VEXORA' },
    summary: {
      ar: 'منتج تخطيط موارد المؤسسات ضمن محفظة تالامير. الوصف التفصيلي قيد إعداد المالك.',
      en: 'The enterprise resource planning product in the portfolio. Detailed description pending owner input.',
    },
    // "VEXORA ERP" is the one confirmed fact in the register.
    category: { ar: 'تخطيط موارد المؤسسات (ERP)', en: 'Enterprise Resource Planning (ERP)' },
    // Register: UNKNOWN — OWNER INPUT REQUIRED. Rendered as such, not guessed.
    lifecycleStage: null,
    capabilities: [],
    solutions: [],
    industries: [],
    docsSlug: null,
    claimLevel: 'structural',
    state: 'published',
    updated: '2026-07-23',
  },
  {
    slug: 'sultan',
    code: 'PRD-SULTAN',
    title: { ar: 'SULTAN', en: 'SULTAN' },
    summary: {
      ar: 'منتج ضمن محفظة تالامير — قيد التطوير، للعرض التوضيحي فقط.',
      en: 'A portfolio product — in development, demonstration only.',
    },
    // Register: category UNKNOWN — OWNER INPUT REQUIRED.
    category: { ar: 'غير محدد — بانتظار إدخال المالك', en: 'Unspecified — pending owner input' },
    lifecycleStage: {
      // The one status the register does assert explicitly.
      ar: 'قيد التطوير — عرض توضيحي فقط',
      en: 'In Development — Demonstration Only',
    },
    capabilities: [],
    solutions: [],
    industries: [],
    docsSlug: null,
    claimLevel: 'structural',
    state: 'published',
    updated: '2026-07-23',
  },
];
