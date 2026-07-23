'use client';

import { useId, useRef, useState, type ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * Tabs implementing the WAI-ARIA tabs pattern.
 *
 * Keyboard behaviour is the part that is usually missed, so it is explicit here:
 * arrow keys move between tabs, Home/End jump to the ends, and the arrow
 * direction is *flipped in RTL* — in an Arabic layout the left arrow moves to
 * the next tab, not the previous one. Only the active tab is in the tab order
 * (roving tabindex), so Tab moves out of the tablist rather than through it.
 */
export function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const focusTab = (index: number) => {
    setActive(index);
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[index]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const element = event.currentTarget as HTMLElement;

    // Prefer the nearest explicit `dir` attribute — the app always sets it on
    // <html> from the locale, so this is authoritative. `getComputedStyle` is
    // the fallback for a subtree that inherits direction without declaring it.
    const declared = element.closest('[dir]')?.getAttribute('dir');
    const rtl = (declared ?? getComputedStyle(element).direction) === 'rtl';

    const last = items.length - 1;

    // In RTL the visual "next" tab is to the left.
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';

    if (event.key === forward) {
      event.preventDefault();
      focusTab(active === last ? 0 : active + 1);
    } else if (event.key === back) {
      event.preventDefault();
      focusTab(active === 0 ? last : active - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusTab(last);
    }
  };

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto border-b border-border"
      >
        {items.map((item, i) => {
          const selected = i === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={[
                'whitespace-nowrap border-b-2 px-4 py-3 text-body-sm font-medium transition-colors duration-fast ease-standard',
                selected
                  ? 'border-accent text-text'
                  : 'border-transparent text-text-muted hover:text-text',
              ].join(' ')}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item, i) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={i !== active}
          // Panels are focusable so keyboard users land on the content after
          // the tablist rather than skipping past it.
          tabIndex={0}
          className="pt-6"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
