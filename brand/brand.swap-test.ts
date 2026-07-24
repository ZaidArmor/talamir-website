import type { BrandDefinition } from './brand.types';

/**
 * A swap-proof fixture — NOT a design proposal.
 *
 * Every value here is deliberately as far from the placeholder as the contract
 * allows: warm instead of cool, sharp corners instead of rounded, a hexagon
 * mark instead of a square, flat instead of shadowed, faster motion, a serif
 * stack. If activating this changes the site's entire appearance without a
 * single component edit, the identity layer works. If some corner of the site
 * stays grey and rounded, that corner has a hardcoded value and a bug.
 *
 * Run it with:  NEXT_PUBLIC_BRAND_ID=swap-test npm run dev
 *
 * Do not read this as a candidate palette. It exists to be *different*, not to
 * be good, and it is excluded from the identity decision entirely.
 */
export const swapTestBrand: BrandDefinition = {
  id: 'swap-test',
  workingName: { ar: '[اختبار الاستبدال]', en: '[SWAP TEST]' },

  // Still not 'approved' — the fixture must not lift the noindex gate.
  status: 'candidate',

  notice: {
    ar: 'هوية اختبارية للتحقق من آلية الاستبدال — ليست مقترحاً تصميمياً.',
    en: 'Swap-verification fixture — not a design proposal.',
  },

  // A fixture has no brand line to publish.
  tagline: null,

  colors: {
    light: {
      canvas: '#FDF8F0',
      surface: '#F5EADA',
      surfaceMuted: '#EADCC6',
      surfaceRaised: '#FFFDF8',
      border: '#D8C4A4',
      borderSubtle: '#E3D3B8',
      // 4.34:1 / 3.86:1 / 3.40:1 — WCAG 1.4.11 non-text contrast.
      borderStrong: '#8F7047',
      text: '#241C10',
      textMuted: '#6B5636',
      textSubtle: '#6B5636',
      textOnAccent: '#FDF8F0',
      accent: '#8C3A1E',
      accentHover: '#6E2C14',
      accentDeep: '#4E1D0C',
      accentSubtle: '#F0DFCC',
      focus: '#8C3A1E',
      success: '#3F6B2A',
      warning: '#8A5A0C',
      danger: '#9B2020',
      info: '#2C5A7A',
    },
    dark: {
      canvas: '#191207',
      surface: '#241A0C',
      surfaceMuted: '#312413',
      surfaceRaised: '#3A2B17',
      border: '#46341C',
      borderSubtle: '#3A2B17',
      // 3.88:1 / 3.57:1 / 3.15:1 — WCAG 1.4.11 non-text contrast.
      borderStrong: '#8A6E42',
      text: '#F7EEDD',
      textMuted: '#BCA47C',
      textSubtle: '#BCA47C',
      textOnAccent: '#191207',
      accent: '#E08A5A',
      accentHover: '#F0A578',
      accentDeep: '#A85E36',
      accentSubtle: '#2E2112',
      focus: '#E08A5A',
      success: '#8CC06A',
      warning: '#E0B44A',
      danger: '#E08078',
      info: '#7AB0D8',
    },
  },

  typography: {
    fontArabic: "'Noto Naskh Arabic', 'Traditional Arabic', Georgia, serif",
    fontLatin: "Georgia, 'Times New Roman', serif",
    fontMono: "ui-monospace, 'Consolas', monospace",
    scale: {
      display: '4rem',
      h1: '2.75rem',
      h2: '2rem',
      h3: '1.5rem',
      h4: '1.1875rem',
      bodyLg: '1.1875rem',
      body: '1.0625rem',
      bodySm: '0.9375rem',
      caption: '0.8125rem',
    },
    weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    leading: { tight: '1.05', snug: '1.2', normal: '1.65', relaxed: '1.85' },
    trackingLatin: { tight: '-0.01em', normal: '0', wide: '0.1em' },
  },

  shape: {
    // Sharp everywhere — the visual opposite of the placeholder.
    radius: { none: '0px', sm: '0px', md: '0px', lg: '0px', xl: '0px', pill: '0px' },
    elevation: { none: 'none', sm: 'none', md: 'none', lg: 'none' },
    borderWidth: '2px',
  },

  motion: {
    duration: { instant: '60ms', fast: '110ms', base: '160ms', slow: '260ms' },
    easing: {
      entrance: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      exit: 'cubic-bezier(0.5, 0, 1, 1)',
      standard: 'cubic-bezier(0.3, 0, 0.2, 1)',
      emphasis: 'cubic-bezier(0.3, 0, 0.2, 1)',
    },
    stagger: '40ms',
    distance: '10px',
  },

  logo: {
    asset: null,
    placeholderShape: 'hexagon',
    lockupRatio: 1,
    minHeight: 30,
  },
};
