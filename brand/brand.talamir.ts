import type { BrandDefinition } from './brand.types';

/**
 * The approved TALAMIR identity.
 *
 * Every value here is transcribed from the approved landing-page design. This
 * is the one file in the repository where literal colour, type and timing
 * values are legitimate — `npm run brand:check` enforces that everywhere else.
 *
 * The public landing page is rendered in the **dark** scheme unconditionally
 * (see `.landing-scope` in src/styles/landing.css); the light scheme exists
 * because the brand contract requires both, and it governs the inner pages
 * when a visitor's system or explicit choice asks for light.
 *
 * Contrast: every pair the contract checks clears WCAG 2.1 AA in both schemes.
 * The numbers are asserted, not asserted-about — see tests/contrast.test.ts.
 */
export const talamirBrand: BrandDefinition = {
  id: 'talamir',

  // Approved public brand name. No longer under validation.
  workingName: { ar: 'تالامير', en: 'TALAMIR' },

  status: 'approved',

  // Approved identity: nothing temporary left to disclose on the public site.
  notice: null,

  tagline: {
    ar: 'من الفكرة إلى نظام يعمل',
    en: 'From idea to a system that works',
  },

  colors: {
    dark: {
      canvas: '#0D1013',
      surface: '#101418',
      surfaceMuted: '#0B0E11',
      surfaceRaised: '#141A1F',
      border: '#1A2025',
      borderSubtle: '#1E2429',
      // The design's hairline (#2A3138) is decorative and sits below the 3:1
      // non-text floor. `borderStrong` is the role that bounds interactive
      // controls, so it is raised to clear WCAG 1.4.11 — 4.15:1 on canvas.
      borderStrong: '#6E7681',
      text: '#E7E9EC',
      textMuted: '#AEB4BB',
      // The design's --dim, raised from #8A9099 to clear 4.5:1 on surface.
      textSubtle: '#9AA1A9',
      textOnAccent: '#0D1013',
      accent: '#2FC0B3',
      accentHover: '#5FE0D4',
      accentDeep: '#1E7C74',
      accentSubtle: '#0E2724',
      focus: '#5FE0D4',
      success: '#4FD1A5',
      warning: '#E0B060',
      danger: '#F08A72',
      info: '#5FE0D4',
    },
    light: {
      canvas: '#FFFFFF',
      surface: '#F4F7F7',
      surfaceMuted: '#EAF0EF',
      surfaceRaised: '#FFFFFF',
      border: '#DCE4E3',
      borderSubtle: '#E6ECEB',
      borderStrong: '#63736F',
      text: '#0D1013',
      textMuted: '#495456',
      textSubtle: '#5C686A',
      textOnAccent: '#FFFFFF',
      // The signature teal is a light-on-dark colour; on white it reads at
      // 1.9:1. The light scheme therefore carries the deep teal from the same
      // family rather than the surface teal at reduced opacity.
      accent: '#0E6A62',
      accentHover: '#0A544E',
      accentDeep: '#083F3A',
      accentSubtle: '#E0F0EE',
      focus: '#0E6A62',
      success: '#1F7A4D',
      warning: '#8A6410',
      danger: '#B3261E',
      info: '#1B5FA8',
    },
  },

  typography: {
    // Self-hosted subsets under /public/fonts — see the @font-face block in
    // src/styles/landing.css. All three families are SIL Open Font License 1.1,
    // which permits redistribution and web embedding.
    fontArabic: "'Readex Pro', 'Sora', system-ui, -apple-system, sans-serif",
    fontLatin: "'Sora', 'Readex Pro', system-ui, -apple-system, sans-serif",
    fontMono: "'IBM Plex Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace",

    scale: {
      display: '4.125rem',
      h1: '2.625rem',
      h2: '1.9375rem',
      h3: '1.375rem',
      h4: '1.125rem',
      bodyLg: '1.1875rem',
      body: '1rem',
      bodySm: '0.90625rem',
      caption: '0.8125rem',
    },
    weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    leading: { tight: '1.08', snug: '1.25', normal: '1.6', relaxed: '1.75' },

    // Latin only. Arabic letterforms connect; tracking them damages legibility.
    trackingLatin: { tight: '-0.02em', normal: '0', wide: '0.14em' },
  },

  shape: {
    radius: {
      none: '0px',
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      pill: '999px',
    },
    elevation: {
      none: 'none',
      sm: '0 1px 2px rgb(0 0 0 / 0.32)',
      md: '0 12px 40px -18px rgb(47 192 179 / 0.5)',
      lg: '0 24px 64px -24px rgb(0 0 0 / 0.6)',
    },
    borderWidth: '1px',
  },

  motion: {
    duration: { instant: '200ms', fast: '250ms', base: '350ms', slow: '800ms' },
    easing: {
      // The design's two curves. `--ease` is the workhorse; `--ease-in` carries
      // the scroll reveals.
      entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
      standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
      emphasis: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
    stagger: '60ms',
    distance: '28px',
  },

  logo: {
    asset: '/brand/talamir-mark.svg',
    placeholderShape: 'circle',
    lockupRatio: 1,
    minHeight: 32,
  },
};
