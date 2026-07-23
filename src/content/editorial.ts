import type { DocPage, Post, PressItem, Role } from './types';

/**
 * Editorial content: blog, documentation, careers, press.
 *
 * These arrays are mostly empty, and that is the correct state. A press item
 * implies real coverage; a role implies an open requisition; a post implies a
 * named author. Fabricating any of them would put unverifiable claims on a
 * public site. The pages that consume these registries all render a designed
 * empty state — see `src/components/blocks/EmptyState.tsx` — so an empty
 * section looks intentional rather than broken.
 */

export const posts: Post[] = [];

export const roles: Role[] = [];

export const press: PressItem[] = [];

/**
 * The one documentation page that can be written truthfully today: how this
 * site's own identity layer works. It is real, verifiable from the repository,
 * and exercises the full docs route, sidebar grouping and markdown rendering.
 */
export const docs: DocPage[] = [
  {
    slug: 'design-tokens',
    section: { ar: 'أساسيات', en: 'Foundations' },
    order: 1,
    productCode: null,
    title: { ar: 'رموز التصميم', en: 'Design Tokens' },
    summary: {
      ar: 'كيف تُعرَّف الهوية في مكان واحد وتُستبدل دون إعادة بناء الموقع.',
      en: 'How the identity is defined in one place and swapped without rebuilding the site.',
    },
    body: {
      ar: [
        '## المبدأ',
        '',
        'لا يستورد أي مكوّن لوناً أو خطاً أو زمن حركة مباشرة. كل مكوّن يقرأ **رمزاً دلالياً** معرّفاً في `brand/`.',
        '',
        '## الاستبدال',
        '',
        '1. أضف ملفاً جديداً يحقق واجهة `BrandDefinition`.',
        '2. سجّله في `brand/index.ts`.',
        '3. اضبط `NEXT_PUBLIC_BRAND_ID`.',
        '',
        'لا يتغيّر أي ملف آخر في المستودع.',
      ].join('\n'),
      en: [
        '## The principle',
        '',
        'No component imports a colour, font or motion timing directly. Every component reads a **semantic token** defined in `brand/`.',
        '',
        '## Swapping the identity',
        '',
        '1. Add a file satisfying the `BrandDefinition` interface.',
        '2. Register it in `brand/index.ts`.',
        '3. Set `NEXT_PUBLIC_BRAND_ID`.',
        '',
        'No other file in the repository changes.',
      ].join('\n'),
    },
    claimLevel: 'descriptive',
    state: 'published',
    updated: '2026-07-23',
  },
];
