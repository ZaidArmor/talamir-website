'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { anchorFor } from './anchors';

/**
 * Which ecosystem entity the page is currently pointed at.
 *
 * Three separated sections share this one fact: the path chooser sets it, the
 * ecosystem map reflects and changes it, and the fit finder sets it when it
 * reaches a result. In the approved design that coupling is a module-level
 * variable; here it is a context, so the sections stay independent components
 * that happen to agree rather than a page that has to be assembled in one file.
 *
 * The provider is the only client boundary that spans sections. Everything
 * inside it that does not need the value stays a server component — it is
 * passed through as `children`, never re-rendered here.
 */
interface SelectionValue {
  selected: string;
  select: (id: string) => void;
  /** Set the selection *and* bring that entity's section into view. */
  selectAndScroll: (id: string) => void;
}

const SelectionContext = createContext<SelectionValue | null>(null);

export function SelectionProvider({ initial, children }: { initial: string; children: ReactNode }) {
  const [selected, setSelected] = useState(initial);

  const selectAndScroll = useCallback((id: string) => {
    setSelected(id);

    const target = document.getElementById(anchorFor(id)) ?? document.getElementById('ecosystem');
    if (!target) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Offset by the sticky header, or the heading lands underneath it.
    const top = target.getBoundingClientRect().top + window.scrollY - 80;

    if (reduced) {
      window.scrollTo({ top, behavior: 'auto' });
      return;
    }

    const from = window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });

    /*
     * Smooth scrolling is driven by the rendering loop, so in a throttled or
     * non-compositing context it can be requested and never start. The click
     * would then appear to do nothing at all — a worse failure than arriving
     * without the animation. If nothing has moved shortly after, jump.
     */
    window.setTimeout(() => {
      if (Math.abs(window.scrollY - from) < 4 && Math.abs(top - from) > 4) {
        window.scrollTo({ top, behavior: 'auto' });
      }
    }, 600);
  }, []);

  const value = useMemo(
    () => ({ selected, select: setSelected, selectAndScroll }),
    [selected, selectAndScroll],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionValue {
  const value = useContext(SelectionContext);
  if (!value) {
    throw new Error('useSelection must be used inside <SelectionProvider>');
  }
  return value;
}
