import type { Config } from 'tailwindcss';

/**
 * Every scale below points at a CSS variable emitted from the brand tokens.
 * No literal colour, font, radius or duration appears in this file — that is
 * what makes the identity swappable. `npm run brand:check` fails the build if
 * a raw hex value reappears here or in any component.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    // `extend` is deliberately not used for colours: dropping Tailwind's default
    // palette stops components from silently reaching for `bg-slate-800`, which
    // would survive an identity swap and quietly break it.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      canvas: 'var(--color-canvas)',
      surface: 'var(--color-surface)',
      'surface-muted': 'var(--color-surface-muted)',
      border: 'var(--color-border)',
      'border-strong': 'var(--color-border-strong)',
      text: 'var(--color-text)',
      'text-muted': 'var(--color-text-muted)',
      'text-on-accent': 'var(--color-text-on-accent)',
      accent: 'var(--color-accent)',
      'accent-hover': 'var(--color-accent-hover)',
      'accent-subtle': 'var(--color-accent-subtle)',
      focus: 'var(--color-focus)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      danger: 'var(--color-danger)',
      info: 'var(--color-info)',
    },
    fontFamily: {
      arabic: 'var(--font-arabic)',
      latin: 'var(--font-latin)',
      mono: 'var(--font-mono)',
    },
    extend: {
      fontSize: {
        display: ['var(--text-display)', { lineHeight: 'var(--leading-tight)' }],
        h1: ['var(--text-h1)', { lineHeight: 'var(--leading-tight)' }],
        h2: ['var(--text-h2)', { lineHeight: 'var(--leading-snug)' }],
        h3: ['var(--text-h3)', { lineHeight: 'var(--leading-snug)' }],
        h4: ['var(--text-h4)', { lineHeight: 'var(--leading-snug)' }],
        'body-lg': ['var(--text-body-lg)', { lineHeight: 'var(--leading-relaxed)' }],
        body: ['var(--text-body)', { lineHeight: 'var(--leading-normal)' }],
        'body-sm': ['var(--text-body-sm)', { lineHeight: 'var(--leading-normal)' }],
        caption: ['var(--text-caption)', { lineHeight: 'var(--leading-normal)' }],
      },
      fontWeight: {
        regular: 'var(--weight-regular)',
        medium: 'var(--weight-medium)',
        semibold: 'var(--weight-semibold)',
        bold: 'var(--weight-bold)',
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        sm: 'var(--elevation-sm)',
        md: 'var(--elevation-md)',
        lg: 'var(--elevation-lg)',
      },
      borderWidth: { DEFAULT: 'var(--border-width)' },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        entrance: 'var(--ease-entrance)',
        exit: 'var(--ease-exit)',
        standard: 'var(--ease-standard)',
        emphasis: 'var(--ease-emphasis)',
      },
      // Named after intent, not pixel width — see docs/07-responsive-rules.md.
      screens: {
        sm: '480px', // large phone
        md: '768px', // tablet portrait
        lg: '1024px', // tablet landscape / small laptop
        xl: '1280px', // desktop
        '2xl': '1536px', // wide desktop
      },
      maxWidth: {
        prose: '68ch', // reading measure — Arabic sits comfortably below 75ch
        container: '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
