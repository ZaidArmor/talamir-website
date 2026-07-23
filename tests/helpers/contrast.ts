/**
 * WCAG 2.1 relative-luminance and contrast-ratio maths.
 *
 * Written here rather than pulled from a dependency because it is twenty lines
 * of specified arithmetic, and because the contrast gate must not depend on a
 * package that could change its rounding behaviour between versions.
 *
 * Reference: WCAG 2.1, "relative luminance" and "contrast ratio" definitions.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parses `#rgb`, `#rrggbb` and `#rrggbbaa` (alpha ignored — see note below). */
export function parseHex(hex: string): Rgb {
  const value = hex.trim().replace(/^#/, '');

  const expand = (s: string): string =>
    s.length === 3 || s.length === 4
      ? s
          .slice(0, 3)
          .split('')
          .map((c) => c + c)
          .join('')
      : s.slice(0, 6);

  const full = expand(value);
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Not a hex colour this checker understands: "${hex}"`);
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** WCAG relative luminance. */
export function luminance({ r, g, b }: Rgb): number {
  const channel = (raw: number): number => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio, always >= 1. Order of arguments does not matter. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(parseHex(a));
  const lb = luminance(parseHex(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Rounded to 2dp for readable failure messages. */
export const ratio = (a: string, b: string): number => Math.round(contrastRatio(a, b) * 100) / 100;
