import { products } from '../src/content/products';
import { solutions, industries } from '../src/content/taxonomies';
import { posts, docs, roles, press } from '../src/content/editorial';
import type { ContentBase, Localized } from '../src/content/types';

/**
 * Guards the governance boundary.
 *
 * `talamir-product-portfolio` holds no approved source for any commercial,
 * legal, or launch claim, and states that no product may be described as ready,
 * available, or for sale. A website is exactly where that discipline erodes —
 * someone writes "trusted by teams across the region" into a summary field and
 * nobody notices it is unfounded.
 *
 * This check reads every content entry and fails if an item marked
 * `structural` or `descriptive` contains commercial language. Raising the claim
 * level is the deliberate act that unlocks that language, and it should require
 * an approved source on file.
 *
 * Exit codes: 0 clean, 1 violations found.
 */

/** Phrases that assert commercial availability, market position, or proof. */
const COMMERCIAL_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(?:trusted by|used by|chosen by)\b/i, label: 'social proof' },
  {
    pattern: /\b(?:leading|market[- ]leading|number one|#1|best[- ]in[- ]class)\b/i,
    label: 'market position',
  },
  {
    pattern:
      /\b(?:available now|generally available|now shipping|buy|pricing|per month|free trial)\b/i,
    label: 'availability or pricing',
  },
  {
    pattern: /\b(?:certified|compliant|iso ?\d|soc ?2|gdpr[- ]compliant)\b/i,
    label: 'compliance claim',
  },
  { pattern: /\b(?:guarantee[ds]?|uptime|sla|99\.\d ?%)\b/i, label: 'service-level claim' },
  { pattern: /\b(?:customers|clients)\b/i, label: 'customer-base claim' },
  {
    pattern: /الأفضل|الرائد|الأول|متاح الآن|عملاؤنا|نضمن|مضمون|معتمد دولياً/,
    label: 'Arabic commercial claim',
  },
];

interface Violation {
  slug: string;
  field: string;
  locale: string;
  label: string;
  text: string;
}

const violations: Violation[] = [];

const scan = (entry: ContentBase, field: string, value: Localized | undefined) => {
  if (!value) return;
  if (entry.claimLevel === 'commercial') return; // cleared, by definition

  for (const locale of ['ar', 'en'] as const) {
    const text = value[locale];
    if (!text) continue;

    for (const rule of COMMERCIAL_PATTERNS) {
      if (rule.pattern.test(text)) {
        violations.push({
          slug: entry.slug,
          field,
          locale,
          label: rule.label,
          text: text.slice(0, 120),
        });
      }
    }
  }
};

/** Every registry, walked through its shared `ContentBase` fields. */
const registries: Array<{ name: string; entries: ContentBase[] }> = [
  { name: 'products', entries: products },
  { name: 'solutions', entries: solutions },
  { name: 'industries', entries: industries },
  { name: 'posts', entries: posts },
  { name: 'docs', entries: docs },
  { name: 'roles', entries: roles },
  { name: 'press', entries: press },
];

for (const registry of registries) {
  for (const entry of registry.entries) {
    scan(entry, `${registry.name}.title`, entry.title);
    scan(entry, `${registry.name}.summary`, entry.summary);
  }
}

/** A published entry must never sit at a claim level its state contradicts. */
for (const registry of registries) {
  for (const entry of registry.entries) {
    if (entry.state === 'published' && entry.claimLevel === 'commercial') {
      violations.push({
        slug: entry.slug,
        field: `${registry.name}.claimLevel`,
        locale: '-',
        label: 'commercial claim level published without an approved source',
        text: 'set claimLevel back to structural/descriptive, or record the approving source',
      });
    }
  }
}

if (violations.length > 0) {
  console.error(`\nContent claim check FAILED — ${violations.length} violation(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.field} [${v.slug}] (${v.locale}) — ${v.label}`);
    console.error(`    > ${v.text}\n`);
  }
  console.error(
    'The portfolio register holds no approved source for commercial claims.\n' +
      'Either remove the language, or raise claimLevel deliberately with a source on file.\n',
  );
  process.exit(1);
}

console.log(
  `Content claim check passed — ${registries.reduce((n, r) => n + r.entries.length, 0)} entries, no unfounded commercial language.`,
);
