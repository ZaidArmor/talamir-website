import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ExternalCta } from '../../src/components/landing/ExternalCta';

/**
 * The external CTA is a real anchor, which is what makes it keyboard-operable
 * and focus-visible for free. These assertions pin the safety attributes and
 * the accessible name so a refactor cannot quietly drop them.
 */

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

let container: HTMLElement;
let root: Root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const anchor = () => container.querySelector('a')!;

describe('ExternalCta', () => {
  const render = () =>
    act(() => {
      root.render(
        <ExternalCta
          href="https://armor.sa"
          label="Visit the ARMOR Car Care website"
          newTabHint="(opens in a new tab)"
        />,
      );
    });

  it('is a real anchor pointing at the destination', () => {
    render();
    expect(anchor().tagName).toBe('A');
    expect(anchor().getAttribute('href')).toBe('https://armor.sa');
  });

  it('opens in a new tab with a safe rel', () => {
    render();
    expect(anchor().getAttribute('target')).toBe('_blank');
    expect(anchor().getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('names itself for assistive tech, including the new-tab hint', () => {
    render();
    expect(anchor().getAttribute('aria-label')).toBe(
      'Visit the ARMOR Car Care website (opens in a new tab)',
    );
  });

  it('is keyboard-focusable', () => {
    render();
    // An anchor with an href is in the tab order and can be focused/activated.
    anchor().focus();
    expect(document.activeElement).toBe(anchor());
    expect(anchor().tabIndex).toBeGreaterThanOrEqual(0);
  });
});
