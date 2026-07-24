import type { EcosystemEntity } from './types';

/**
 * The ecosystem, as data.
 *
 * Adding an entity here makes it appear in the interactive map, the status
 * board, the product chapters, the footer column and the fit finder's result
 * set — no component knows how many there are.
 *
 * Every entry states its own status and its relationship to the parent brand.
 * That is a governance requirement, not a design flourish: an entity that is
 * still being built must never read as one that is available, and an operating
 * brand under the umbrella must not read as a platform for sale.
 */
export const ecosystem: EcosystemEntity[] = [
  {
    id: 'sultan',
    order: 1,
    nameEn: 'SULTAN',
    nameAr: 'سلطان',
    status: 'building',
    accentRole: 'accent',
    type: { ar: 'منتج تقني', en: 'Technology Product' },
    statusLabel: { ar: 'قيد التطوير', en: 'In Development' },
    endorsement: { ar: 'أحد منتجات تالامير', en: 'A TALAMIR Product' },
    description: {
      ar: 'منصة سحابية متخصصة في قطاع العناية وحماية السيارات، تربط بيانات المركبات، تخطيط وقص أفلام الحماية والعزل، ماكينات القص، إدارة الرولات، الفروع، سير العمل والسوق المتخصص ضمن منظومة تشغيل واحدة.',
      en: 'A specialized cloud platform for the automotive care and protection industry, connecting vehicle data, PPF and window-film cutting workflows, plotters, roll management, branches, operations and a specialized marketplace.',
    },
    direction: {
      ar: 'منصة سحابية، تطبيق سطح مكتب، بيانات مركبات، سير عمل القص، وسوق متخصص.',
      en: 'Cloud platform, desktop agent, vehicle data, cutting workflows and a specialized marketplace.',
    },
    cta: { ar: 'استكشف سلطان', en: 'Explore SULTAN' },
  },
  {
    id: 'vexora-erp',
    order: 2,
    nameEn: 'VEXORA ERP',
    nameAr: 'VEXORA ERP',
    status: 'building',
    accentRole: 'accent-hover',
    type: { ar: 'منصة إدارة أعمال', en: 'Business Management Platform' },
    statusLabel: { ar: 'قيد التطوير', en: 'In Development' },
    endorsement: { ar: 'أحد منتجات تالامير', en: 'A TALAMIR Product' },
    description: {
      ar: 'منصة سعودية لإدارة وتشغيل الأعمال، تجمع العمليات والمبيعات والفروع والمخزون والموارد والمهام والموافقات والتقارير ضمن بيئة واحدة تعمل عبر الويب وسطح المكتب والجوال.',
      en: 'A Saudi business management platform connecting operations, sales, branches, inventory, resources, tasks, approvals and reporting across web, desktop and mobile.',
    },
    direction: {
      ar: 'تشغيل الأعمال السعودية عبر الويب وسطح المكتب والجوال.',
      en: 'Saudi business operations across cloud, desktop and mobile.',
    },
    cta: { ar: 'اكتشف VEXORA ERP', en: 'Discover VEXORA ERP' },
  },
  {
    id: 'vexora-finance',
    order: 3,
    nameEn: 'VEXORA Finance',
    nameAr: 'VEXORA Finance',
    status: 'building',
    accentRole: 'accent-deep',
    type: {
      ar: 'منصة مالية ومحاسبية وضريبية واستشارية',
      en: 'Financial, Accounting, Tax & Advisory Platform',
    },
    statusLabel: { ar: 'قيد التطوير', en: 'In Development' },
    endorsement: { ar: 'أحد منتجات تالامير', en: 'A TALAMIR Product' },
    description: {
      ar: 'منصة مالية ومحاسبية وضريبية واستشارية متعددة اللغات، موجهة للشركات والمكاتب المحاسبية والمحاسبين والمستشارين الماليين في السوق السعودي.',
      en: 'A multilingual financial, accounting, tax and advisory platform for companies, accounting firms, accountants and financial advisors, designed for the Saudi market.',
    },
    direction: {
      ar: 'المحاسبة، التقارير المالية، ضريبة القيمة المضافة، الزكاة، مسارات استشارية، وجاهزية السوق السعودي.',
      en: 'Accounting, financial reporting, VAT, Zakat, advisory workflows and Saudi-market readiness.',
    },
    cta: { ar: 'اكتشف VEXORA Finance', en: 'Discover VEXORA Finance' },
  },
  {
    id: 'car-care',
    order: 4,
    nameEn: 'ARMOR CAR CARE',
    nameAr: 'ارمور للعناية وحماية السيارات',
    status: 'operating',
    accentRole: 'text-muted',
    // The one ecosystem entity with an approved, live public site.
    external: {
      href: 'https://armor.sa',
      label: {
        ar: 'زيارة موقع أرمور للعناية وحماية السيارات',
        en: 'Visit the ARMOR Car Care website',
      },
    },
    type: { ar: 'علامة تشغيلية', en: 'Operating Brand' },
    statusLabel: { ar: 'تعمل الآن', en: 'Operating' },
    endorsement: { ar: 'تحت مظلة تالامير', en: 'Under the TALAMIR Umbrella' },
    description: {
      ar: 'علامة تشغيلية سعودية متخصصة في العناية وحماية السيارات منذ عام 2012، تعمل من خلال فروعها في أبها وخميس مشيط وجازان، وتمثل بيئة تشغيل حقيقية تساعد على فهم احتياجات السوق وتطوير حلول أكثر واقعية.',
      en: 'A Saudi operating brand specializing in automotive care and protection since 2012, operating through branches in Abha, Khamis Mushait and Jazan, and providing real operational context for understanding market needs.',
    },
    direction: {
      ar: 'تشغيل العناية وحماية السيارات في أبها وخميس مشيط وجازان.',
      en: 'Automotive care and protection operations across Abha, Khamis Mushait and Jazan.',
    },
    cta: { ar: 'استكشف خدمات ارمور', en: 'Explore Armor services' },
  },
];

/** Ordered once, here, so no component re-sorts and no two surfaces disagree. */
export const orderedEcosystem = (): EcosystemEntity[] =>
  [...ecosystem].sort((a, b) => a.order - b.order);

export const entityById = (id: string): EcosystemEntity | undefined =>
  ecosystem.find((entity) => entity.id === id);
