import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Contact and ecosystem links, asserted against the **real prerendered HTML**.
 *
 * Source intent is checked elsewhere; this checks what is actually served — the
 * ARMOR link opens safely in a new tab, the direct email is a real mailto, and
 * the landing journey contains no dead `#` link.
 */

const BUILD = join(process.cwd(), '.next', 'server', 'app');

const pages = () =>
  ['ar.html', 'en.html'].map((file) => ({ file, html: readFileSync(join(BUILD, file), 'utf8') }));

beforeAll(() => {
  if (!existsSync(BUILD)) throw new Error('No build output. Run `npm run build` first.');
});

describe('ARMOR ecosystem link', () => {
  it('opens armor.sa in a new tab with safe rel, in both locales', () => {
    for (const { file, html } of pages()) {
      const anchor = html.match(/<a[^>]*href="https:\/\/armor\.sa"[^>]*>/);
      expect(anchor, `armor link missing in ${file}`).not.toBeNull();
      expect(anchor![0], file).toContain('target="_blank"');
      expect(anchor![0], file).toContain('rel="noopener noreferrer"');
      expect(anchor![0], file).toMatch(/aria-label="[^"]+"/);
    }
  });

  it('forwards no form data or query string to armor.sa', () => {
    for (const { html } of pages()) {
      expect(html).not.toMatch(/href="https:\/\/armor\.sa[/?][^"]/);
    }
  });
});

describe('direct email link', () => {
  it('renders a real mailto to the role mailbox', () => {
    for (const { html } of pages()) {
      expect(html).toContain('href="mailto:sales@talamir.org"');
    }
  });
});

describe('no dead links in the landing journey', () => {
  it('contains no bare href="#"', () => {
    for (const { file, html } of pages()) {
      expect(html.includes('href="#"'), `dead link in ${file}`).toBe(false);
    }
  });

  it('links the consent disclosure to the privacy notice', () => {
    for (const { html } of pages()) {
      expect(html).toMatch(/href="\/(ar|en)\/privacy"/);
    }
  });
});
