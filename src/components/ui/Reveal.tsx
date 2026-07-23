'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Scroll reveal — the site's only entrance animation.
 *
 * Three properties make it safe rather than decorative:
 *
 *  1. **Fails open.** Content starts visible. It is only hidden after the
 *     effect confirms an IntersectionObserver exists. No JS, a thrown effect,
 *     or an old browser all leave the page fully readable.
 *  2. **Runs once.** The observer disconnects on first intersection, so content
 *     never re-animates on scroll-back — which is the difference between polish
 *     and nausea.
 *  3. **Respects the user.** `prefers-reduced-motion` is checked here *and*
 *     neutralised in CSS, so the transform never runs even if this check is
 *     bypassed.
 *
 * `index` staggers siblings by the brand's `--stagger` token. Keep groups small:
 * a stagger over more than ~6 items reads as a page that is slow to load.
 */
export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'shown' | 'pending'>('shown');

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') return;

    // Only now is it safe to hide: we know we can reveal it again.
    setState('pending');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState('shown');
            observer.disconnect();
          }
        }
      },
      // Trigger slightly before the element reaches the viewport edge, so the
      // transition finishes about when the reader's eye arrives.
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className ?? ''}`}
      data-reveal={state}
      style={{ ['--reveal-delay' as string]: `calc(${index} * var(--stagger))` }}
    >
      {children}
    </div>
  );
}
