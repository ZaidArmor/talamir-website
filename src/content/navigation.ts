import type { Localized } from './types';
import { getProducts, getSolutions, getIndustries } from './index';

/**
 * Information architecture, expressed once.
 *
 * The header, the footer, the mobile drawer, the sitemap page and the XML
 * sitemap all derive from this tree. There is no second copy of the navigation
 * anywhere in the codebase — adding a section means editing this file only.
 *
 * Depth is capped at two levels on purpose: a third level of hierarchy is the
 * point where visitors stop predicting where things live. Documentation is the
 * one exception and carries its own in-page sidebar.
 */

export interface NavLink {
  label: Localized;
  /** Locale-agnostic path; `href()` adds the locale prefix. */
  path: string;
  /** One line shown in mega-menu panels. */
  description?: Localized;
}

export interface NavSection {
  label: Localized;
  /** A section is clickable in its own right — every group has a landing page. */
  path: string;
  children: NavLink[];
}

/** Sections whose children come from content, so new entries appear by themselves. */
const productChildren = (): NavLink[] =>
  getProducts().map((p) => ({
    label: p.title,
    path: `/products/${p.slug}`,
    description: p.category,
  }));

const solutionChildren = (): NavLink[] =>
  getSolutions().map((s) => ({ label: s.title, path: `/solutions/${s.slug}` }));

const industryChildren = (): NavLink[] =>
  getIndustries().map((i) => ({ label: i.title, path: `/industries/${i.slug}` }));

/**
 * The primary navigation.
 *
 * Grouping rationale — visitors arrive with one of three questions:
 *   "what do you make?"  → Products
 *   "can you fix my problem?" → Solutions, Industries
 *   "who are you and can I trust you?" → Company
 * Developer- and partner-facing surfaces sit in Resources so they never compete
 * with the primary commercial path.
 */
export const primaryNav = (): NavSection[] => [
  {
    label: { ar: 'المنتجات', en: 'Products' },
    path: '/products',
    children: productChildren(),
  },
  {
    label: { ar: 'الحلول', en: 'Solutions' },
    path: '/solutions',
    children: solutionChildren(),
  },
  {
    label: { ar: 'القطاعات', en: 'Industries' },
    path: '/industries',
    children: industryChildren(),
  },
  {
    label: { ar: 'المصادر', en: 'Resources' },
    path: '/documentation',
    children: [
      { label: { ar: 'التوثيق', en: 'Documentation' }, path: '/documentation' },
      { label: { ar: 'الدعم', en: 'Support' }, path: '/support' },
      { label: { ar: 'المدوّنة', en: 'Blog' }, path: '/blog' },
    ],
  },
  {
    label: { ar: 'الشركة', en: 'Company' },
    path: '/about',
    children: [
      { label: { ar: 'من نحن', en: 'About' }, path: '/about' },
      { label: { ar: 'الوظائف', en: 'Careers' }, path: '/careers' },
      { label: { ar: 'الشركاء', en: 'Partner Program' }, path: '/partners' },
      { label: { ar: 'المستثمرون', en: 'Investors' }, path: '/investors' },
      { label: { ar: 'المركز الإعلامي', en: 'Press' }, path: '/press' },
      { label: { ar: 'تواصل معنا', en: 'Contact' }, path: '/contact' },
    ],
  },
];

/**
 * Footer columns.
 *
 * Deliberately a superset of the header: the footer is where the long tail of
 * legal, investor and partner surfaces lives without crowding the top bar.
 */
export const footerNav = (): NavSection[] => [
  { label: { ar: 'المنتجات', en: 'Products' }, path: '/products', children: productChildren() },
  { label: { ar: 'الحلول', en: 'Solutions' }, path: '/solutions', children: solutionChildren() },
  {
    label: { ar: 'القطاعات', en: 'Industries' },
    path: '/industries',
    children: industryChildren(),
  },
  {
    label: { ar: 'المصادر', en: 'Resources' },
    path: '/documentation',
    children: [
      { label: { ar: 'التوثيق', en: 'Documentation' }, path: '/documentation' },
      { label: { ar: 'الدعم', en: 'Support' }, path: '/support' },
      { label: { ar: 'المدوّنة', en: 'Blog' }, path: '/blog' },
      { label: { ar: 'خريطة الموقع', en: 'Sitemap' }, path: '/sitemap' },
    ],
  },
  {
    label: { ar: 'الشركة', en: 'Company' },
    path: '/about',
    children: [
      { label: { ar: 'من نحن', en: 'About' }, path: '/about' },
      { label: { ar: 'الوظائف', en: 'Careers' }, path: '/careers' },
      { label: { ar: 'الشركاء', en: 'Partner Program' }, path: '/partners' },
      { label: { ar: 'المستثمرون', en: 'Investors' }, path: '/investors' },
      { label: { ar: 'المركز الإعلامي', en: 'Press' }, path: '/press' },
      { label: { ar: 'تواصل معنا', en: 'Contact' }, path: '/contact' },
    ],
  },
];
