import type { BrandDefinition } from './brand.types';

/**
 * The placeholder identity.
 *
 * These values are deliberately *neutral greys plus one desaturated blue*. They
 * are not drawn from any of the three exploration palettes in
 * `docs/brand-exploration/03-color-systems.md` — Deep Graphite, Thermal Split,
 * Precision Light. That is intentional: if the site shipped one of the
 * candidates it would read as a decision, and none has been made.
 *
 * The purpose of this file is to prove the *structure* works, not to propose a
 * look. Judge the layout, rhythm and hierarchy here; ignore the hues.
 */
export const placeholderBrand: BrandDefinition = {
  id: 'placeholder',

  // The name is under validation. Nothing downstream hardcodes it.
  workingName: { ar: '[الاسم قيد التحقق]', en: '[WORKING NAME]' },

  status: 'placeholder',

  notice: {
    ar: 'هوية مؤقتة — الشكل واللون والاسم غير معتمدة وقابلة للاستبدال.',
    en: 'Placeholder identity — mark, palette and name are unapproved and swappable.',
  },

  colors: {
    light: {
      canvas: '#FFFFFF',
      surface: '#F7F7F8',
      surfaceMuted: '#EFEFF1',
      border: '#E1E1E5',
      // 3.61:1 on canvas, 3.37:1 on surface, 3.14:1 on surfaceMuted.
      // `borderStrong` bounds interactive controls (secondary buttons), so it
      // must clear WCAG 1.4.11 non-text contrast at 3:1. Enforced by
      // tests/contrast.test.ts.
      borderStrong: '#86868F',
      text: '#17171A',
      textMuted: '#5C5C66',
      textOnAccent: '#FFFFFF',
      accent: '#4A5B7A',
      accentHover: '#3A4A66',
      accentSubtle: '#EDF0F5',
      focus: '#2B5FD9',
      success: '#1F7A4D',
      warning: '#8A6410',
      danger: '#B3261E',
      info: '#2B5FD9',
    },
    dark: {
      canvas: '#0F1012',
      surface: '#17181B',
      surfaceMuted: '#1F2024',
      border: '#2A2C31',
      // 3.57:1 / 3.33:1 / 3.05:1 — see the light-scheme note above.
      borderStrong: '#666B77',
      text: '#F2F2F4',
      textMuted: '#A0A2AA',
      textOnAccent: '#0F1012',
      accent: '#93A6C7',
      accentHover: '#AEBEDA',
      accentSubtle: '#1B2028',
      focus: '#7FA5F5',
      success: '#5CC08C',
      warning: '#E0B44A',
      danger: '#F2837B',
      info: '#7FA5F5',
    },
  },

  typography: {
    // System stacks only. Licensing a typeface is a brand decision, and no
    // webfont should be committed before the identity is signed off.
    fontArabic: "'Noto Kufi Arabic', 'Segoe UI', 'Tahoma', system-ui, -apple-system, sans-serif",
    fontLatin: "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    fontMono: "ui-monospace, 'Cascadia Mono', 'Consolas', 'Courier New', monospace",

    scale: {
      display: '3.5rem',
      h1: '2.5rem',
      h2: '1.875rem',
      h3: '1.375rem',
      h4: '1.125rem',
      bodyLg: '1.125rem',
      body: '1rem',
      bodySm: '0.875rem',
      caption: '0.8125rem',
    },
    weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    leading: { tight: '1.1', snug: '1.25', normal: '1.6', relaxed: '1.8' },

    // Latin only. Arabic letterforms connect; tracking them damages legibility,
    // so no Arabic tracking token is offered for components to reach for.
    trackingLatin: { tight: '-0.02em', normal: '0', wide: '0.06em' },
  },

  shape: {
    radius: {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '20px',
      pill: '999px',
    },
    elevation: {
      none: 'none',
      sm: '0 1px 2px rgb(0 0 0 / 0.06)',
      md: '0 4px 12px rgb(0 0 0 / 0.08)',
      lg: '0 12px 32px rgb(0 0 0 / 0.12)',
    },
    borderWidth: '1px',
  },

  motion: {
    duration: { instant: '80ms', fast: '160ms', base: '240ms', slow: '420ms' },
    easing: {
      entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      emphasis: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
    },
    stagger: '60ms',
    distance: '16px',
  },

  logo: {
    // No asset. The placeholder mark is generated — see components/brand/Mark.tsx.
    asset: null,
    placeholderShape: 'rounded',
    lockupRatio: 1,
    minHeight: 28,
  },
};
