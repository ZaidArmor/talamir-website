import Link from 'next/link';
import { defaultLocale, href, t, ui } from '@/lib/i18n';
import { Container, Section } from '@/components/ui/primitives';

/**
 * 404. Rendered inside the locale layout, so it keeps the header, footer and
 * language switch — a visitor who lands here can still navigate out.
 *
 * The locale is not available to this file (Next renders not-found outside the
 * params contract), so it falls back to the default locale's strings.
 */
export default function NotFound() {
  return (
    <Section spacing="loose">
      <Container width="prose">
        <h1 className="text-h1 font-bold">{t(ui.notFoundTitle, defaultLocale)}</h1>
        <p className="mt-4 text-body-lg text-text-muted">{t(ui.notFoundBody, defaultLocale)}</p>
        <p className="mt-8">
          <Link
            href={href(defaultLocale, '/')}
            className="text-accent underline underline-offset-2"
          >
            {t(ui.goHome, defaultLocale)}
          </Link>
        </p>
      </Container>
    </Section>
  );
}
