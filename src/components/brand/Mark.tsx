import { brand } from '@brand/index';

/**
 * The mark.
 *
 * While `logo.asset` is null this renders a *generated geometric stand-in* —
 * deliberately anonymous, so nobody mistakes it for a proposal. The moment a
 * real asset is registered in the brand definition, this component serves it
 * instead, at exactly the same reserved size. Layout does not shift on swap,
 * because the box is sized from `logo.minHeight` and `logo.lockupRatio` in
 * both branches.
 */

const shapeRadius: Record<typeof brand.logo.placeholderShape, string> = {
  square: '0',
  rounded: '18%',
  circle: '50%',
  hexagon: '0',
};

export function Mark({ size = brand.logo.minHeight }: { size?: number }) {
  const width = size * brand.logo.lockupRatio;

  if (brand.logo.asset) {
    // A plain <img> is deliberate: the asset path is arbitrary and
    // brand-supplied, and next/image would demand build-time configuration that
    // changes with every identity swap — the exact coupling this file avoids.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brand.logo.asset}
        alt=""
        width={width}
        height={size}
        style={{ height: size, width }}
      />
    );
  }

  const hexagon = brand.logo.placeholderShape === 'hexagon';

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 100 100"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      {hexagon ? (
        <polygon
          points="50,4 91,27 91,73 50,96 9,73 9,27"
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
        />
      ) : (
        <rect
          x={4}
          y={4}
          width={92}
          height={92}
          rx={shapeRadius[brand.logo.placeholderShape]}
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
        />
      )}
      {/* A diagonal, not a letterform. A glyph here would read as a logo idea. */}
      <line x1={4} y1={96} x2={96} y2={4} stroke="currentColor" strokeWidth={8} />
    </svg>
  );
}
