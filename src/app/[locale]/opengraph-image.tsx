import { ImageResponse } from 'next/og';
import { brand } from '@brand/index';
import { landingCopy } from '@/content/landing';
import { isLocale } from '@/lib/i18n';

/**
 * The social sharing card.
 *
 * Generated at build time by `next/og` rather than committed as a PNG, so the
 * card cannot drift from the identity: the colours come from the same brand
 * tokens the site renders, and the mark is the same geometry.
 *
 * Latin only, deliberately. `ImageResponse` needs a font file for every script
 * it draws, and shipping an Arabic face into the image renderer to set one line
 * is a poor trade — the Arabic card would also be the one most likely to break
 * silently at build time. The wordmark and English tagline carry it instead.
 */
export const alt = 'TALAMIR';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const copy = landingCopy(isLocale(locale) ? locale : 'ar');
  const c = brand.colors.dark;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: c.canvas,
          color: c.text,
          padding: '90px',
        }}
      >
        <svg width="104" height="104" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="34"
            fill="none"
            stroke={c.accent}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray="168 46"
          />
          <circle cx="50" cy="50" r="12" fill={c.accent} />
          <circle cx="87.6" cy="36.3" r="5" fill={c.accentHover} />
        </svg>

        <div style={{ fontSize: 62, letterSpacing: 18, marginTop: 44, fontWeight: 700 }}>
          TALAMIR
        </div>

        <div style={{ fontSize: 34, color: c.accent, marginTop: 20 }}>
          {brand.tagline?.en ?? ''}
        </div>

        <div style={{ fontSize: 26, color: c.textMuted, marginTop: 26, maxWidth: 900 }}>
          {copy.hero.kicker}
        </div>
      </div>
    ),
    size,
  );
}
