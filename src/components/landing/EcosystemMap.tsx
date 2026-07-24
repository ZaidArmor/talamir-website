'use client';

import { useRef } from 'react';
import type { EcosystemEntity, LandingCopy } from '@/content/landing';
import type { Locale } from '@/content/types';
import { anchorFor } from './anchors';
import { useSelection } from './SelectionContext';
import { Mark } from './Mark';
import { StatusBadge } from './StatusBadge';

/** The four connector arcs, in the same order the nodes are placed. */
const ARCS = [
  'M350 230 C280 160 220 130 140 110',
  'M350 230 C430 160 480 130 560 110',
  'M350 230 C280 305 220 335 140 355',
  'M350 230 C430 305 480 335 560 355',
];

/**
 * The interactive ecosystem map.
 *
 * Implemented as a WAI-ARIA tablist: each entity is a tab, the detail panel is
 * the tabpanel. That is what the design's structure already implied, and it
 * gives arrow-key navigation, roving focus and a live-announced panel for free
 * rather than as bolted-on `keydown` handling.
 *
 * Arrow keys follow reading direction: in RTL, ArrowLeft advances. Getting that
 * backwards is the single most common RTL keyboard bug, and it is the reason
 * direction is read from the document rather than assumed.
 */
export function EcosystemMap({
  locale,
  copy,
  entities,
}: {
  locale: Locale;
  copy: LandingCopy;
  entities: EcosystemEntity[];
}) {
  const { selected, select } = useSelection();
  const listRef = useRef<HTMLDivElement>(null);

  const current = entities.find((entity) => entity.id === selected) ?? entities[0];

  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const rtl = document.documentElement.dir === 'rtl';
    const index = entities.findIndex((entity) => entity.id === selected);

    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = entities.length - 1;
    else {
      // In RTL the visually "next" node sits to the left.
      const forward =
        event.key === 'ArrowDown' || (rtl ? event.key === 'ArrowLeft' : event.key === 'ArrowRight');
      next = (index + (forward ? 1 : entities.length - 1)) % entities.length;
    }

    const id = entities[next].id;
    select(id);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-id="${id}"]`)?.focus();
  };

  return (
    <>
      <div className="lp-eco">
        <div
          ref={listRef}
          className="lp-eco-map"
          role="tablist"
          aria-label={copy.ecosystem.mapLabel}
          aria-orientation="horizontal"
          data-focused="true"
          onKeyDown={onKeyDown}
        >
          <div className="lp-eco-core" aria-hidden="true">
            <Mark size={64} />
            <span className="lp-brand-word lp-ltr">TALAMIR</span>
          </div>

          <svg
            className="lp-eco-links"
            viewBox="0 0 700 460"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            {entities.map((entity, i) => (
              <path
                key={entity.id}
                d={ARCS[i % ARCS.length]}
                fill="none"
                data-hot={entity.id === selected}
              />
            ))}
          </svg>

          {entities.map((entity) => {
            const isSelected = entity.id === selected;
            return (
              <button
                key={entity.id}
                type="button"
                role="tab"
                id={`eco-tab-${entity.id}`}
                data-id={entity.id}
                className="lp-eco-node"
                aria-selected={isSelected}
                aria-controls="eco-panel"
                tabIndex={isSelected ? 0 : -1}
                onClick={() => select(entity.id)}
              >
                <b className="lp-ltr">{entity.nameEn}</b>
                <span className="lp-mono">{entity.type[locale]}</span>
                <StatusBadge entity={entity} locale={locale} />
              </button>
            );
          })}
        </div>

        <div
          className="lp-eco-panel"
          id="eco-panel"
          role="tabpanel"
          aria-labelledby={`eco-tab-${current.id}`}
          aria-live="polite"
        >
          <span className="lp-p-type">{current.type[locale]}</span>
          <div className="lp-p-name lp-ltr">
            {current.nameAr === current.nameEn
              ? current.nameEn
              : `${current.nameEn} · ${current.nameAr}`}
          </div>
          <span className="lp-endorse">{current.endorsement[locale]}</span>
          <StatusBadge entity={current} locale={locale} />
          <p className="lp-p-desc">{current.description[locale]}</p>
          <a className="lp-btn lp-btn-ghost lp-btn-sm" href={`#${anchorFor(current.id)}`}>
            {current.cta[locale]}
          </a>
        </div>
      </div>

      <p className="lp-mono lp-eco-hint">{copy.ecosystem.hint}</p>
      <p className="lp-boundary">{copy.ecosystem.boundary}</p>
    </>
  );
}
