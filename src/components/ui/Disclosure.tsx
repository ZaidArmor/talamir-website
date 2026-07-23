'use client';

import { useId, useState, type ReactNode } from 'react';

/**
 * Accordion / FAQ disclosure.
 *
 * Built on a real button with `aria-expanded` and `aria-controls` rather than
 * `<details>`, because `<details>` cannot animate its height and its open state
 * is invisible to a controlled group.
 *
 * The height transition uses `grid-template-rows: 0fr -> 1fr`, which animates
 * to the content's natural height without measuring it in JS — no layout
 * thrash, and correct when the content reflows at a different breakpoint.
 */
export function Disclosure({
  question,
  children,
  defaultOpen = false,
}: {
  question: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="border-b border-border">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 py-4 text-start text-body font-medium text-text transition-colors duration-fast ease-standard hover:text-accent"
        >
          <span>{question}</span>
          <span
            aria-hidden="true"
            className="shrink-0 text-text-muted transition-transform duration-base ease-standard"
            style={{ transform: open ? 'rotate(45deg)' : 'none' }}
          >
            {/* A plus that becomes an x. One glyph, one rotation, no icon set
                dependency — icons are an identity decision that is not made. */}
            +
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        // `grid-template-rows` animates; the inner element clips the overflow.
        className="grid transition-[grid-template-rows] duration-base ease-standard"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {/* Hidden from AT and from tab order while collapsed. */}
          <div className="pb-4 text-body-sm text-text-muted" hidden={!open}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
