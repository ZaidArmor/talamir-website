'use client';

import { Fragment, useEffect, useRef, useState } from 'react';

/**
 * The marketplace journey, lit one stage at a time.
 *
 * The stagger runs on a single interval started by an IntersectionObserver, so
 * the sequence begins when the reader arrives rather than while the diagram is
 * still off-screen. It runs once.
 *
 * Under reduced motion — or with no observer available — every stage is lit
 * immediately. The diagram's meaning is the sequence itself, not the animation
 * of it, so the still version is complete rather than degraded.
 */
export function MarketFlow({ steps, label }: { steps: string[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const total = steps.length * 2 - 1;
  // Fully lit until an observer is proven to exist — the same fail-open rule
  // the reveal primitive follows. A diagram that never animates is finished;
  // one stuck at stage zero looks broken.
  const [lit, setLit] = useState(total);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    // Already scrolled past at mount: leave it lit rather than replaying.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.6) return;

    setLit(0);

    let timer: ReturnType<typeof setInterval> | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        timer = setInterval(() => {
          setLit((value) => {
            if (value >= total) {
              if (timer) clearInterval(timer);
              return value;
            }
            return value + 1;
          });
        }, 260);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [total]);

  return (
    <div className="lp-flow" ref={ref} role="list" aria-label={label}>
      {steps.map((step, index) => (
        <Fragment key={step}>
          {index > 0 && (
            <div className="lp-flow-link" data-on={index * 2 - 1 < lit} aria-hidden="true" />
          )}
          <div className="lp-flow-node" role="listitem" data-on={index * 2 < lit}>
            <span className="lp-flow-dot" aria-hidden="true" />
            <span>{step}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
