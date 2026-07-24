'use client';

import type { EcosystemEntity, LandingCopy } from '@/content/landing';
import { useSelection } from './SelectionContext';

/**
 * "What do you want to improve?" — the four-way entry into the page.
 *
 * Choosing a path does two things: it points the ecosystem map at the matching
 * entity, and it scrolls that entity's own section into view. The recommendation
 * label under each card is derived from the entity list rather than written into
 * the copy, so it cannot name something the ecosystem no longer contains.
 */
export function PathChooser({
  copy,
  entities,
}: {
  copy: LandingCopy;
  entities: EcosystemEntity[];
}) {
  const { selected, selectAndScroll } = useSelection();

  return (
    <div className="lp-paths">
      {copy.paths.options.map((option, index) => {
        const entity = entities.find((candidate) => candidate.id === option.target);
        return (
          <button
            key={option.target}
            type="button"
            className="lp-path"
            aria-current={selected === option.target}
            onClick={() => selectAndScroll(option.target)}
          >
            <span className="lp-path-n lp-mono lp-ltr">{String(index + 1).padStart(2, '0')}</span>
            <span>{option.label}</span>
            {entity && (
              <span className="lp-path-rec lp-mono">
                {copy.paths.chosen} <span className="lp-ltr">{entity.nameEn}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
