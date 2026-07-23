'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Theme control.
 *
 * The stored value is applied by an inline script in the document head (see
 * `themeScript` below) so the correct theme is painted on the first frame.
 * Without that, a dark-mode user sees a white flash on every navigation.
 *
 * "System" is a real third state, not the absence of a choice — a user who has
 * explicitly chosen to follow the OS should keep following it when the OS
 * changes at sunset.
 */
export function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<Theme>('system');

  // Read the choice the inline script already applied, so the control's state
  // matches the page instead of resetting it.
  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    setTheme(stored === 'light' || stored === 'dark' ? stored : 'system');
  }, []);

  const apply = (next: Theme) => {
    setTheme(next);
    const root = document.documentElement;
    if (next === 'system') {
      window.localStorage.removeItem('theme');
      root.removeAttribute('data-theme');
    } else {
      window.localStorage.setItem('theme', next);
      root.setAttribute('data-theme', next);
    }
  };

  const cycle: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
  const glyph: Record<Theme, string> = { system: '◐', light: '☀', dark: '☾' };

  return (
    <button
      type="button"
      onClick={() => apply(cycle[theme])}
      title={label}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors duration-fast ease-standard hover:bg-surface-muted hover:text-text"
    >
      <span aria-hidden="true">{glyph[theme]}</span>
    </button>
  );
}

/**
 * Runs before first paint. Kept deliberately tiny and dependency-free.
 * Wrapped in try/catch because localStorage throws in some privacy modes, and
 * a theme preference is never worth breaking the page over.
 */
export const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`;
