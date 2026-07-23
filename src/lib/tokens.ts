import { brand } from '@brand/index';
import type { ColorRoles } from '@brand/brand.types';

/**
 * Serialises the active `BrandDefinition` into CSS custom properties.
 *
 * This runs once, in the root layout, and emits a single <style> block. Tokens
 * therefore exist as real CSS variables at runtime, which means:
 *   - Tailwind utilities resolve against them (see tailwind.config.ts);
 *   - dark mode is a variable re-declaration, not a second set of classes;
 *   - a future identity swap changes the emitted values only.
 */

const colorVars = (roles: ColorRoles): string =>
  (Object.keys(roles) as Array<keyof ColorRoles>)
    .map((role) => `--color-${kebab(role)}: ${roles[role]};`)
    .join('\n    ');

const kebab = (s: string): string => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export function buildTokenStylesheet(): string {
  const { colors, typography, shape, motion } = brand;

  const staticVars = `
    --font-arabic: ${typography.fontArabic};
    --font-latin: ${typography.fontLatin};
    --font-mono: ${typography.fontMono};

    ${Object.entries(typography.scale)
      .map(([k, v]) => `--text-${kebab(k)}: ${v};`)
      .join('\n    ')}
    ${Object.entries(typography.weight)
      .map(([k, v]) => `--weight-${k}: ${v};`)
      .join('\n    ')}
    ${Object.entries(typography.leading)
      .map(([k, v]) => `--leading-${k}: ${v};`)
      .join('\n    ')}
    ${Object.entries(typography.trackingLatin)
      .map(([k, v]) => `--tracking-${k}: ${v};`)
      .join('\n    ')}

    ${Object.entries(shape.radius)
      .map(([k, v]) => `--radius-${k}: ${v};`)
      .join('\n    ')}
    ${Object.entries(shape.elevation)
      .map(([k, v]) => `--elevation-${k}: ${v};`)
      .join('\n    ')}
    --border-width: ${shape.borderWidth};

    ${Object.entries(motion.duration)
      .map(([k, v]) => `--duration-${k}: ${v};`)
      .join('\n    ')}
    ${Object.entries(motion.easing)
      .map(([k, v]) => `--ease-${k}: ${v};`)
      .join('\n    ')}
    --stagger: ${motion.stagger};
    --motion-distance: ${motion.distance};
  `;

  // Light is the default declaration; dark overrides only the colour roles.
  // `[data-theme]` wins over the media query so an explicit user choice beats
  // the OS preference in both directions.
  return `
:root {
    ${colorVars(colors.light)}
    ${staticVars}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    ${colorVars(colors.dark)}
  }
}

:root[data-theme='dark'] {
    ${colorVars(colors.dark)}
}

:root[data-theme='light'] {
    ${colorVars(colors.light)}
}
`.trim();
}
