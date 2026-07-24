import type { EcosystemEntity } from '@/content/landing';
import type { Locale } from '@/content/types';

/**
 * An entity's status, stated wherever the entity appears.
 *
 * This is the one component on the page that exists for governance rather than
 * for design. Every surface that names an entity also renders this, so nothing
 * in development can be mistaken for something available — and because it reads
 * `entity.status`, that guarantee holds for entities added later without anyone
 * remembering the rule.
 */
export function StatusBadge({
  entity,
  locale,
  block = false,
}: {
  entity: EcosystemEntity;
  locale: Locale;
  block?: boolean;
}) {
  return (
    <span
      className={['lp-badge', block ? 'lp-badge-block' : null].filter(Boolean).join(' ')}
      data-status={entity.status}
    >
      {entity.statusLabel[locale]}
    </span>
  );
}
