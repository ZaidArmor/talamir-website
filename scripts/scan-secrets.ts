import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Secret, personal-data and absolute-path scan.
 *
 * Runs over everything that would be committed. Three separate concerns, one
 * pass, because they share the same file walk and the same reporting shape.
 *
 * Exit codes: 0 clean, 1 findings.
 */

const ROOT = process.cwd();

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'out', 'build', 'coverage']);
// The lockfile is generated; its integrity hashes and registry URLs are not secrets.
const SKIP_FILES = new Set(['package-lock.json']);

interface Finding {
  file: string;
  line: number;
  category: string;
  detail: string;
  text: string;
}

const RULES: Array<{ category: string; pattern: RegExp; detail: string }> = [
  // ── credentials and keys ────────────────────────────────────────────────
  {
    category: 'secret',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    detail: 'private key block',
  },
  {
    category: 'secret',
    // An assignment of a long opaque value to a credential-shaped name.
    pattern:
      /\b(?:api[_-]?key|apikey|secret|passwd|password|auth[_-]?token|access[_-]?token|client[_-]?secret|private[_-]?key)\b\s*[:=]\s*['"][^'"\s]{12,}['"]/i,
    detail: 'credential assigned a literal value',
  },
  { category: 'secret', pattern: /\bAKIA[0-9A-Z]{16}\b/, detail: 'AWS access key id' },
  { category: 'secret', pattern: /\bgh[pousr]_[A-Za-z0-9]{16,}\b/, detail: 'GitHub token' },
  { category: 'secret', pattern: /\bsk-[A-Za-z0-9]{20,}\b/, detail: 'API secret key' },
  { category: 'secret', pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, detail: 'Slack token' },
  {
    category: 'secret',
    pattern: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s'"]*:[^\s'"@]+@/,
    detail: 'connection string with inline credentials',
  },
  {
    category: 'secret',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./,
    detail: 'JWT',
  },

  // ── personal data ───────────────────────────────────────────────────────
  {
    category: 'personal-data',
    // Any real-looking email. The repository should contain none at all.
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    detail: 'email address',
  },
  {
    category: 'personal-data',
    pattern: /\b(?:\+9665|05)\d{8}\b/,
    detail: 'Saudi mobile number',
  },
  {
    category: 'personal-data',
    pattern: /\b\d{10}\b(?=.*(?:iqama|national id|هوية|إقامة))/i,
    detail: 'national id / iqama',
  },

  // ── absolute paths ──────────────────────────────────────────────────────
  {
    category: 'absolute-path',
    pattern: /[A-Za-z]:[\\/](?:Armor|Design|TALAMIR-RECOVERY|Users|Program Files)\b/i,
    detail: 'absolute filesystem path',
  },
];

/** Documented, narrowly scoped exceptions. */
const ALLOW: Array<{ match: RegExp; why: string }> = [
  {
    match: /example\.invalid|example\.com|@example\b/i,
    why: 'reserved example domains, used as placeholders',
  },
  {
    match: /noreply@|placeholder|\[REDACTED\]/i,
    why: 'explicit placeholder markers',
  },
];

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP_DIRS.has(entry.name)) return [];
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (SKIP_FILES.has(entry.name)) return [];
    return /\.(tsx?|css|mjs|md|json|txt|ya?ml|example)$/.test(full) || !entry.name.includes('.')
      ? [full]
      : [];
  });

const findings: Finding[] = [];

for (const file of walk(ROOT)) {
  let content: string;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue; // binary or unreadable — nothing to scan
  }

  content.split('\n').forEach((line, i) => {
    if (ALLOW.some((a) => a.match.test(line))) return;

    for (const rule of RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          file: relative(ROOT, file),
          line: i + 1,
          category: rule.category,
          detail: rule.detail,
          text: line.trim().slice(0, 120),
        });
      }
    }
  });
}

const byCategory = (category: string) => findings.filter((f) => f.category === category);

for (const category of ['secret', 'personal-data', 'absolute-path']) {
  const hits = byCategory(category);
  console.log(
    `${category.padEnd(14)} ${hits.length === 0 ? 'PASS — no findings' : `FAIL — ${hits.length}`}`,
  );
}

if (findings.length > 0) {
  console.error('\nFindings:\n');
  for (const f of findings) {
    console.error(`  [${f.category}] ${f.file}:${f.line} — ${f.detail}`);
    console.error(`    > ${f.text}\n`);
  }
  process.exit(1);
}

console.log(`\nScan clean. Documented exceptions: ${ALLOW.length}`);
for (const a of ALLOW) console.log(`  - ${a.why}`);
