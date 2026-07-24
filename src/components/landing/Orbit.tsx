'use client';

import { useEffect, useRef } from 'react';

/**
 * The hero orbit.
 *
 * The drift-with-the-pointer effect is applied imperatively rather than through
 * state: it fires on every mousemove, and routing that through React would
 * re-render the tree sixty times a second to move one element. Writing the
 * transform straight onto the node keeps it off the main thread's critical path.
 *
 * It is skipped entirely for coarse pointers (there is nothing to track) and
 * for `prefers-reduced-motion`. The rings themselves are CSS keyframes, so they
 * are already covered by the stylesheet's reduced-motion block.
 */
export function Orbit() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduced || !finePointer) return;

    const onMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      node.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      node.style.transform = '';
    };
  }, []);

  return (
    <div className="lp-orbit" ref={ref}>
      <svg viewBox="0 0 400 400" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="lp-hero-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.22" />
            <stop offset="70%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="200" r="190" fill="url(#lp-hero-glow)" />
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="200"
          r="110"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
        />

        <g className="lp-spin">
          <circle
            className="lp-draw"
            cx="200"
            cy="200"
            r="150"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="470 472"
          />
          <circle cx="350" cy="200" r="9" fill="var(--color-accent-hover)" />
        </g>

        <g className="lp-spin-rev">
          <circle
            cx="200"
            cy="200"
            r="110"
            fill="none"
            stroke="var(--color-accent-deep)"
            strokeWidth="3"
            strokeDasharray="260 430"
          />
          <circle cx="200" cy="90" r="6" fill="var(--color-accent)" />
        </g>

        <circle
          cx="200"
          cy="200"
          r="70"
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth="1"
        />
        <circle
          className="lp-pulse"
          cx="200"
          cy="200"
          r="28"
          fill="var(--color-accent)"
          opacity="0.15"
        />
        <circle cx="200" cy="200" r="16" fill="var(--color-accent)" />
      </svg>
    </div>
  );
}
