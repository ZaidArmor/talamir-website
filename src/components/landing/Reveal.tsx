'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

/**
 * The landing page's scroll reveal.
 *
 * Same safety properties as the site-wide `ui/Reveal`: it fails open, runs
 * once, and stands down for `prefers-reduced-motion`. It is separate only
 * because it carries the landing stylesheet's class and must be able to render
 * as something other than a <div> — wrapping a grid child in an extra <div>
 * would break every `grid-template-columns` rule on the page.
 *
 * ── why there is a fallback as well as an observer ────────────────────────
 *
 * `IntersectionObserver` only delivers callbacks while the document is being
 * rendered. In a throttled or non-compositing context — a background tab, an
 * offscreen iframe, some headless and embedded viewers — it can stay silent
 * indefinitely. Since the reveal hides content first and shows it on callback,
 * a silent observer is not a missing animation: it is a blank page.
 *
 * So a single shared watchdog (one timer and one scroll listener for the whole
 * page, not one per element) sweeps anything still pending and reveals whatever
 * has reached the viewport. The observer remains the fast path; this is the
 * floor underneath it.
 */

type Flush = () => void;

const pending = new Set<Flush>();
let wired = false;

/** Reveals every registered element that has reached the viewport. */
const sweep = () => {
  for (const flush of [...pending]) flush();
};

const wire = () => {
  if (wired || typeof window === 'undefined') return;
  wired = true;

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sweep();
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Last resort: if the observer never delivered anything at all, stop hiding.
  window.setTimeout(() => {
    for (const flush of [...pending]) flush();
  }, 2000);
};

export function Reveal({
  children,
  as: Tag = 'div',
  index = 0,
  className,
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  index?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  // Visible until an observer is proven to exist. See ui/Reveal for why.
  const [state, setState] = useState<'shown' | 'pending'>('shown');

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    // Already on screen at mount: never hide it, or the fold flashes empty.
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    setState('pending');

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      pending.delete(flush);
      observer.disconnect();
      setState('shown');
    };

    // The watchdog reveals on proximity; the 2s sweep reveals unconditionally.
    const flush: Flush = () => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96) reveal();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) reveal();
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    );

    observer.observe(node);
    pending.add(flush);
    wire();

    // A late unconditional release for this element specifically, in case the
    // page never scrolls and the observer never speaks.
    const timer = window.setTimeout(reveal, 2200);

    return () => {
      window.clearTimeout(timer);
      pending.delete(flush);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={['lp-reveal', className].filter(Boolean).join(' ')}
      data-reveal={state}
      style={{ ['--lp-reveal-delay' as string]: `calc(${Math.min(index, 5)} * var(--stagger))` }}
    >
      {children}
    </Tag>
  );
}
