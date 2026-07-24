import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Guards the identity swap.
 *
 * The promise made to the owner is: "swapping the identity touches one file."
 * That promise decays silently — one hardcoded hex in a component, one
 * `transition: 200ms`, one `bg-slate-800`, and the next designer has to hunt.
 * This check fails the build the moment that starts happening.
 *
 * Scope: all source **and configuration** files. `brand/` is the sole place
 * literal design values are legitimate.
 *
 * Exit codes: 0 clean, 1 violations found.
 */

// npm runs scripts from the package root, and tsx's CJS transform leaves
// `import.meta.dirname` undefined — so cwd is the reliable anchor here.
const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const CONFIG_FILES = [
  'tailwind.config.ts',
  'postcss.config.mjs',
  'next.config.ts',
  'vitest.config.ts',
].map((f) => join(ROOT, f));

interface Violation {
  file: string;
  line: number;
  text: string;
  reason: string;
}

/** Tailwind's default palette — deleted from the config, so any use is a bug. */
const TAILWIND_HUES =
  'slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const TAILWIND_UTILITIES =
  'bg|text|border|ring|from|to|via|fill|stroke|divide|outline|shadow|accent|caret|decoration|placeholder';

const RULES: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/,
    reason: 'hardcoded hex colour — use a semantic token from brand/',
  },
  {
    pattern: /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color-mix)\s*\(/,
    reason: 'hardcoded colour function — use a semantic token from brand/',
  },
  {
    pattern: new RegExp(`\\b(?:${TAILWIND_UTILITIES})-(?:${TAILWIND_HUES})-\\d{2,3}\\b`),
    reason:
      'Tailwind default-palette class — that palette is deliberately removed; it would survive an identity swap',
  },
  {
    // Arbitrary-value colour classes: bg-[#fff], text-[rgb(...)], border-[--x]
    pattern:
      /\b(?:bg|text|border|ring|fill|stroke|shadow|outline)-\[[^\]]*(?:#|rgb|hsl|oklch)[^\]]*\]/,
    reason: 'arbitrary colour class — use a semantic token from brand/',
  },
  {
    pattern: /\brounded-\[[^\]]+\]/,
    reason: 'arbitrary border-radius — use a radius token (rounded-sm … rounded-pill)',
  },
  {
    pattern: /\b(?:duration|delay)-\[[^\]]+\]/,
    reason: 'arbitrary timing class — use a duration token (duration-fast, duration-base, …)',
  },
  {
    // `transition: all .3s` / `animation-duration: 200ms` — but not `--duration-fast`.
    pattern: /(?<!-)\b(?:transition|animation)(?:-duration)?\s*:\s*[^;]*\b\d+(?:\.\d+)?m?s\b/,
    reason: 'hardcoded timing — use a duration token',
  },
  {
    // `font-family:` or a Tailwind arbitrary font stack outside brand/.
    pattern: /font-family\s*:|(?<!-)\bfont-\[[^\]]+\]/,
    reason: 'font declaration outside brand/ — typography belongs to the brand contract',
  },
  {
    // A component must not assume a logo file exists; the brand supplies it.
    pattern: /['"`][^'"`]*\/(?:logo|wordmark|brandmark)[^'"`]*\.(?:svg|png|jpe?g|webp|avif)['"`]/i,
    reason: 'component-level logo asset assumption — the mark comes from brand.logo',
  },
];

/**
 * Files where a literal value is legitimate, each with its reason.
 * Every entry here is an intentional, documented exception.
 */
const EXCEPTIONS: Array<{ file: string; why: string }> = [
  {
    file: join(SRC, 'styles', 'globals.css'),
    why: 'the reduced-motion accessibility floor requires the literal 0.01ms override, and the base layer declares the fluid type clamps',
  },
  {
    file: join(SRC, 'styles', 'landing.css'),
    why: 'the approved landing composition: @font-face declarations for the self-hosted faces, container and node geometry, and the long decorative orbit durations no interaction token covers — every colour, radius and interaction timing in it still resolves through a brand token',
  },
];

const isException = (file: string): boolean => EXCEPTIONS.some((e) => e.file === file);

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(tsx?|css|mjs)$/.test(full) ? [full] : [];
  });

const violations: Violation[] = [];

const scan = (file: string) => {
  if (isException(file)) return;

  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    // Comments are prose; a value mentioned in an explanation is not a violation.
    const stripped = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    if (/^\s*\*/.test(line)) return; // JSDoc continuation line

    for (const rule of RULES) {
      if (rule.pattern.test(stripped)) {
        violations.push({
          file: relative(ROOT, file),
          line: i + 1,
          text: line.trim(),
          reason: rule.reason,
        });
      }
    }
  });
};

for (const file of walk(SRC)) scan(file);
for (const file of CONFIG_FILES) {
  try {
    scan(file);
  } catch {
    // A config file that does not exist is not a violation.
  }
}

if (violations.length > 0) {
  console.error(`\nBrand contract check FAILED — ${violations.length} violation(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`    ${v.reason}`);
    console.error(`    > ${v.text}\n`);
  }
  console.error('These values would survive an identity swap and silently break it.\n');
  process.exit(1);
}

console.log('Brand contract check passed — no literal design values outside brand/.');
console.log(`  scanned: src/**, ${CONFIG_FILES.length} config files`);
console.log(`  documented exceptions: ${EXCEPTIONS.length}`);
for (const e of EXCEPTIONS) {
  console.log(`    - ${relative(ROOT, e.file)}: ${e.why}`);
}
