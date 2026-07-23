import { StrictMode, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tabs } from '../../src/components/ui/Tabs';
import { Disclosure } from '../../src/components/ui/Disclosure';
import { Reveal } from '../../src/components/ui/Reveal';

/**
 * Interactive component behaviour.
 *
 * These assert the behaviours that are easy to break and hard to notice:
 * RTL arrow-key direction, roving tabindex, collapsed content leaving the tab
 * order, and reduced-motion handling. Rendered with React directly — no
 * testing-library dependency is added for what amounts to three render calls.
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
  document.documentElement.removeAttribute('dir');
});

const render = (ui: React.ReactElement) => {
  act(() => {
    root.render(<StrictMode>{ui}</StrictMode>);
  });
};

const TAB_ITEMS = [
  { id: 'one', label: 'One', content: <p>First</p> },
  { id: 'two', label: 'Two', content: <p>Second</p> },
  { id: 'three', label: 'Three', content: <p>Third</p> },
];

const tabs = () => [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
const panels = () => [...container.querySelectorAll<HTMLElement>('[role="tabpanel"]')];

const press = (key: string) => {
  act(() => {
    tabs()[0]
      .closest('[role="tablist"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
};

describe('Tabs — WAI-ARIA pattern', () => {
  it('exposes one selected tab and one visible panel', () => {
    render(<Tabs items={TAB_ITEMS} label="demo" />);
    expect(tabs().map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(panels().map((p) => p.hidden)).toEqual([false, true, true]);
  });

  it('uses a roving tabindex so Tab exits the tablist', () => {
    render(<Tabs items={TAB_ITEMS} label="demo" />);
    expect(tabs().map((t) => t.tabIndex)).toEqual([0, -1, -1]);
  });

  it('wires aria-controls and aria-labelledby in both directions', () => {
    render(<Tabs items={TAB_ITEMS} label="demo" />);
    for (const [i, tab] of tabs().entries()) {
      const panel = panels()[i];
      expect(tab.getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    }
  });

  it('Home and End jump to the ends', () => {
    render(<Tabs items={TAB_ITEMS} label="demo" />);
    press('End');
    expect(tabs()[2].getAttribute('aria-selected')).toBe('true');
    press('Home');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
  });
});

describe('Tabs — direction-aware arrow keys', () => {
  it('LTR: ArrowRight advances, ArrowLeft goes back', () => {
    document.documentElement.setAttribute('dir', 'ltr');
    render(<Tabs items={TAB_ITEMS} label="demo" />);

    press('ArrowRight');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    press('ArrowLeft');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
  });

  it('RTL: ArrowLeft advances — the visual "next" tab is to the left', () => {
    // The behaviour an Arabic keyboard user expects, and the one most
    // implementations get wrong.
    document.documentElement.setAttribute('dir', 'rtl');
    render(<Tabs items={TAB_ITEMS} label="demo" />);

    press('ArrowLeft');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    press('ArrowRight');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
  });

  it('RTL: wraps from the last tab back to the first', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    render(<Tabs items={TAB_ITEMS} label="demo" />);

    press('ArrowLeft');
    press('ArrowLeft');
    expect(tabs()[2].getAttribute('aria-selected')).toBe('true');
    press('ArrowLeft');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
  });
});

describe('Disclosure', () => {
  const button = () => container.querySelector<HTMLButtonElement>('button[aria-expanded]')!;
  const panel = () => document.getElementById(button().getAttribute('aria-controls')!)!;

  it('starts collapsed and reports state via aria-expanded', () => {
    render(<Disclosure question="Q">answer</Disclosure>);
    expect(button().getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps collapsed content out of the tab order', () => {
    // Animating height alone would leave invisible focusable content behind.
    render(<Disclosure question="Q">answer</Disclosure>);
    const inner = panel().querySelector('[hidden]');
    expect(inner, 'collapsed content must be hidden').not.toBeNull();
  });

  it('expands and exposes its content on activation', () => {
    render(<Disclosure question="Q">answer</Disclosure>);
    act(() => button().click());

    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(panel().querySelector('[hidden]')).toBeNull();
  });

  it('uses a real button, not a div', () => {
    render(<Disclosure question="Q">answer</Disclosure>);
    expect(button().tagName).toBe('BUTTON');
  });
});

describe('Reveal — motion safety', () => {
  const matchMedia = (reduced: boolean) =>
    vi.fn().mockImplementation((query: string) => ({
      matches: reduced && query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

  it('fails open — content is visible when no observer exists', () => {
    vi.stubGlobal('matchMedia', matchMedia(false));
    const original = globalThis.IntersectionObserver;
    // @ts-expect-error deliberately removing the API to prove the fallback
    delete globalThis.IntersectionObserver;

    render(<Reveal>content</Reveal>);
    expect(container.querySelector('.reveal')?.getAttribute('data-reveal')).toBe('shown');

    globalThis.IntersectionObserver = original;
  });

  it('never hides content when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', matchMedia(true));
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = '';
        thresholds = [];
      },
    );

    render(<Reveal>content</Reveal>);
    expect(container.querySelector('.reveal')?.getAttribute('data-reveal')).toBe('shown');
  });

  it('applies a stagger delay derived from the brand token', () => {
    vi.stubGlobal('matchMedia', matchMedia(true));
    render(<Reveal index={3}>content</Reveal>);

    const style = container.querySelector<HTMLElement>('.reveal')?.getAttribute('style') ?? '';
    expect(style).toContain('var(--stagger)');
  });
});
