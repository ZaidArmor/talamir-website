import Link from 'next/link';
import { brand } from '@brand/index';
import type { Locale } from '@/content/types';
import { href, t } from '@/lib/i18n';
import { Mark } from './Mark';

/**
 * Mark + name lockup, used in the header and footer.
 *
 * The name is read from `brand.workingName`, which currently resolves to
 * `[الاسم قيد التحقق]` / `[WORKING NAME]`. The brackets are the point: the
 * trading name is under validation, and every surface that shows it will pick
 * up the validated name from one token.
 */
export function Wordmark({ locale, size = 28 }: { locale: Locale; size?: number }) {
  const name = t(brand.workingName, locale);

  return (
    <Link
      href={href(locale, '/')}
      className="inline-flex items-center gap-3 text-text no-underline transition-colors duration-fast ease-standard hover:text-accent"
      aria-label={name}
    >
      <Mark size={size} />
      <span className="text-h4 font-semibold tracking-tight">{name}</span>
    </Link>
  );
}
