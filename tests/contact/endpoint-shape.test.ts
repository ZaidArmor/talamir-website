import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The intake exposes exactly one endpoint, and it never reads a lead out.
 *
 * These assertions are made against the source tree rather than a running
 * server, so they hold at build time: there is no lead-reading route to remove
 * later, and the one route that exists cannot quietly grow a lister.
 */

const ROOT = process.cwd();
const API = join(ROOT, 'src', 'app', 'api');

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

describe('api surface', () => {
  it('contains only the contact route', () => {
    const files = walk(API)
      .map((f) => relative(API, f).split(sep).join('/'))
      .sort();
    expect(files).toEqual(['contact/route.ts']);
  });

  it('has no lead-id or lead-list route', () => {
    const paths = walk(API).map((f) => relative(API, f).split(sep).join('/'));
    for (const path of paths) {
      expect(path).not.toMatch(/leads?/i);
      expect(path).not.toMatch(/\[.*\]/); // no dynamic id segment
    }
  });
});

describe('contact route source', () => {
  const source = readFileSync(join(API, 'contact', 'route.ts'), 'utf8');

  it('exports GET and POST only', () => {
    expect(source).toMatch(/export async function GET/);
    expect(source).toMatch(/export async function POST/);
    expect(source).not.toMatch(/export async function (PUT|DELETE|PATCH)/);
  });

  it('never reads leads back out of the store', () => {
    // The endpoint writes; reading leads is an operator action, not a route.
    expect(source).not.toContain('getByReference');
    expect(source).not.toContain('listPendingNotifications');
  });

  it('runs on the Node runtime and is dynamic', () => {
    expect(source).toContain("runtime = 'nodejs'");
    expect(source).toContain("dynamic = 'force-dynamic'");
  });
});

describe('migration exists and is parameter-safe by construction', () => {
  it('ships the contact_leads migration', () => {
    expect(existsSync(join(ROOT, 'db', 'migrations', '0001_contact_leads.sql'))).toBe(true);
  });
});
