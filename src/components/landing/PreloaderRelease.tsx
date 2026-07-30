'use client';

import { useEffect } from 'react';

/**
 * Guarantees the preloader is gone, and stays gone.
 *
 * The preloader retires itself on a CSS keyframe (see `.lp-preloader` in
 * landing.css) and that remains the primary mechanism — it works with no
 * JavaScript at all, and nothing here is required for the page to become
 * usable. This component is the floor underneath it, for the cases a keyframe
 * cannot cover on its own:
 *
 *  - a stylesheet that arrives late, or whose `--duration-slow` token fails to
 *    resolve, leaving `animation` invalid and the overlay parked at opacity 1;
 *  - a `pageshow` restore from the back/forward cache;
 *  - any environment where the animation simply never runs to completion.
 *
 * Design constraints worth keeping if this is ever edited:
 *
 *  1. It only ever *hides*. There is no code path that re-covers the page, so
 *     it cannot fight the keyframe and cannot strand a visitor behind the
 *     overlay — the failure mode is "no preloader", never "permanent preloader".
 *  2. The attribute is written in an effect, never during render, so the server
 *     and client markup are identical and there is nothing to mismatch on
 *     hydration.
 *  3. The deadline is measured from navigation start via `performance.now()`,
 *     not from mount. Hydration can land well after 1500ms on a slow phone; a
 *     mount-relative timer would silently become a 1500ms-after-hydration timer
 *     and miss the budget it is supposed to enforce.
 *
 * Nothing here restores `overflow`, `position` or `touch-action` on
 * html/body, because nothing in this page ever locks them — the mobile drawer
 * is a `pointer-events` layer, not a scroll lock. Cleanup for a lock that does
 * not exist would read as evidence that one does.
 */

/** The overlay must be gone by this point after navigation start, at the latest. */
const RELEASE_DEADLINE_MS = 1500;

export function PreloaderRelease() {
  useEffect(() => {
    const node = document.querySelector<HTMLElement>('.lp-preloader');
    if (!node) return;

    // Idempotent by construction: setting the same attribute twice is a no-op,
    // so every trigger below can fire in any order, or all of them.
    const release = () => {
      node.dataset.state = 'done';
    };

    // Whatever time is left of the budget, measured from navigation start.
    const remaining = Math.max(0, RELEASE_DEADLINE_MS - performance.now());
    const timer = window.setTimeout(release, remaining);

    // If the document already finished loading before hydration ran, the `load`
    // listener below would never fire. Settle it now instead of waiting.
    if (document.readyState === 'complete') release();

    document.addEventListener('DOMContentLoaded', release);
    window.addEventListener('load', release);
    window.addEventListener('pageshow', release);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('DOMContentLoaded', release);
      window.removeEventListener('load', release);
      window.removeEventListener('pageshow', release);
    };
  }, []);

  return null;
}
