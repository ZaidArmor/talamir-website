import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/**
 * Workspace boundary check.
 *
 * This repository must be **self-contained**: it may not be governed by another
 * repository, may not nest one, and may not depend on — or even reference — a
 * forbidden project tree. The website workspace was created after an
 * out-of-scope write into a foreign repository, and this check is the mechanism
 * that keeps that from recurring silently.
 *
 * Exit codes: 0 clean, 1 violations found.
 */

const ROOT = process.cwd();

/** Trees this repository must never reference or depend on. */
const FORBIDDEN_TREES = [
  /[A-Za-z]:[\\/]Armor\b/i,
  /[A-Za-z]:[\\/]Design\b/i,
  /[A-Za-z]:[\\/]TALAMIR-RECOVERY\b/i,
];

const failures: string[] = [];
const notes: string[] = [];

/* ── 1. this directory is the repository root, not a subdirectory of one ──── */
try {
  const top = execSync('git rev-parse --show-toplevel', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();

  if (resolve(top) !== resolve(ROOT)) {
    failures.push(`Governed by a parent repository at ${top}`);
  } else {
    notes.push(`repository root is the workspace itself`);
  }
} catch {
  notes.push('not a git repository yet (acceptable before initialization)');
}

/* ── 2. no parent directory carries a .git ───────────────────────────────── */
let parent = dirname(ROOT);
let previous = '';
while (parent !== previous) {
  if (existsSync(join(parent, '.git'))) {
    failures.push(`Parent repository found at ${parent}`);
  }
  previous = parent;
  parent = dirname(parent);
}
notes.push('no parent directory carries a .git');

/* ── 3. no nested repository inside the workspace ────────────────────────── */
const walkDirs = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'node_modules' && e.name !== '.next')
    .flatMap((e) => {
      const full = join(dir, e.name);
      return [full, ...walkDirs(full)];
    });

for (const dir of walkDirs(ROOT)) {
  if (dir !== join(ROOT, '.git') && existsSync(join(dir, '.git'))) {
    failures.push(`Nested repository at ${relative(ROOT, dir)}`);
  }
}
notes.push('no nested repository');

/* ── 4. no reference to a forbidden tree in any tracked-style file ───────── */
const walkFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') return [];
    const full = join(dir, e.name);
    if (e.isDirectory()) return walkFiles(full);
    return /\.(tsx?|css|mjs|md|json|txt)$/.test(full) ? [full] : [];
  });

// The lockfile is generated and contains only registry URLs.
const scanned = walkFiles(ROOT).filter((f) => !f.endsWith('package-lock.json'));

for (const file of scanned) {
  const body = readFileSync(file, 'utf8');
  for (const pattern of FORBIDDEN_TREES) {
    if (pattern.test(body)) {
      failures.push(`${relative(ROOT, file)} references a forbidden project tree`);
    }
  }
}
notes.push(`${scanned.length} files carry no forbidden-tree reference`);

/* ── 5. no script or config resolves outside the workspace ───────────────── */
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
  scripts?: Record<string, string>;
};
for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
  if (/[A-Za-z]:[\\/]/.test(command)) {
    failures.push(`package.json script "${name}" contains an absolute path`);
  }
}
notes.push('no npm script contains an absolute path');

/* ── report ──────────────────────────────────────────────────────────────── */
if (failures.length > 0) {
  console.error(`\nBoundary check FAILED — ${failures.length} violation(s):\n`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error('');
  process.exit(1);
}

console.log('Boundary check passed — the workspace is self-contained.');
for (const n of notes) console.log(`  - ${n}`);
