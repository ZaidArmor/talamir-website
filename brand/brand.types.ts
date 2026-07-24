/**
 * The brand contract.
 *
 * Components never import colours, fonts, radii or timings directly. They read
 * *semantic* tokens defined here. Swapping the identity therefore means writing
 * one new object that satisfies `BrandDefinition` — no component changes, no
 * rebuild of the site structure.
 *
 * Rule enforced by `npm run brand:check`: while `status` is `"placeholder"`,
 * no asset in this repo may present itself as a final logo or approved palette.
 */

/** How far the identity has been signed off. Gates what the site may render. */
export type BrandStatus =
  /** Exploration only. Wordmark renders as a neutral geometric placeholder. */
  | 'placeholder'
  /** Direction chosen, still internal. Real marks allowed behind a preview flag. */
  | 'candidate'
  /** Signed off by the brand owner. Placeholder scaffolding switches off. */
  | 'approved';

/**
 * A colour *role*, not a colour. Every value is a CSS colour string so a future
 * identity can supply oklch, P3, or a gradient without changing the type.
 */
export interface ColorRoles {
  /** Page background, furthest back. */
  canvas: string;
  /** Raised surfaces: cards, panels, menus. */
  surface: string;
  /** A surface on a surface: inputs, code blocks, table stripes. */
  surfaceMuted: string;
  /** A surface lifted toward the viewer: card hover, active panel. */
  surfaceRaised: string;
  /** Hairlines and dividers. */
  border: string;
  /** A quieter hairline than `border` — panel seams, node outlines. */
  borderSubtle: string;
  /** Border under focus/hover emphasis. Bounds controls, so >= 3:1 non-text. */
  borderStrong: string;
  /** Primary reading text. Must hit >= 4.5:1 on `canvas` and `surface`. */
  text: string;
  /** Secondary text, captions, metadata. >= 4.5:1 for body sizes. */
  textMuted: string;
  /** Tertiary text: eyebrow tags, hints, footnotes. Still >= 4.5:1. */
  textSubtle: string;
  /** Text placed on top of `accent`. */
  textOnAccent: string;
  /**
   * The single expressive colour. Budgeted at <= 10% of any viewport — see
   * `docs/03-design-tokens.md`. Interaction and emphasis only.
   */
  accent: string;
  /** Hover/active state of accent. */
  accentHover: string;
  /** The recessive end of the accent family: inactive rails, connector lines. */
  accentDeep: string;
  /** Low-opacity accent wash for selected rows, badges, focus halos. */
  accentSubtle: string;
  /** Focus ring. Kept separate from accent so it can stay high-contrast. */
  focus: string;
  /** Status colours are *derived from* the identity, never part of it. */
  success: string;
  warning: string;
  danger: string;
  info: string;
}

/** Both schemes are mandatory. An identity that only works in one is rejected. */
export interface ColorTokens {
  light: ColorRoles;
  dark: ColorRoles;
}

export interface TypographyTokens {
  /** Arabic-first stack. Arabic is the primary reading experience. */
  fontArabic: string;
  /** Latin stack for English pages and code-adjacent UI. */
  fontLatin: string;
  /** Monospace for documentation, API references, identifiers. */
  fontMono: string;
  /**
   * Type scale in rem, keyed by role. Fluid clamps live in CSS; these are the
   * anchors the clamps interpolate between.
   */
  scale: {
    display: string;
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    bodyLg: string;
    body: string;
    bodySm: string;
    caption: string;
  };
  weight: { regular: number; medium: number; semibold: number; bold: number };
  leading: { tight: string; snug: string; normal: string; relaxed: string };
  /** Arabic tolerates far less letter-spacing than Latin. Kept per-script. */
  trackingLatin: { tight: string; normal: string; wide: string };
}

export interface ShapeTokens {
  radius: { none: string; sm: string; md: string; lg: string; xl: string; pill: string };
  /** Shadows are identity-bearing: a flat identity supplies `none` values. */
  elevation: { none: string; sm: string; md: string; lg: string };
  /** Hairline width. Some identities want 1px, some want 2px. */
  borderWidth: string;
}

/**
 * Motion is a brand property, not a component detail. A restrained identity
 * ships shorter durations and flatter easing; both stay inside the
 * accessibility rules in `docs/05-motion-strategy.md`.
 */
export interface MotionTokens {
  duration: {
    /** State feedback: hover, focus, checkbox. */
    instant: string;
    /** Local transitions: dropdown, tooltip, tab. */
    fast: string;
    /** Component-level: accordion, drawer, modal. */
    base: string;
    /** Entrance choreography, scroll reveals. */
    slow: string;
  };
  easing: {
    /** Element entering the screen — decelerate. */
    entrance: string;
    /** Element leaving — accelerate. */
    exit: string;
    /** Both ends anchored — moving between two on-screen states. */
    standard: string;
    /** Deliberate overshoot. Optional; an identity may set this to `standard`. */
    emphasis: string;
  };
  /** Delay between siblings in a staggered reveal. */
  stagger: string;
  /** Max travel distance for reveal transforms. Keeps motion subtle. */
  distance: string;
}

/**
 * How the mark is drawn while no logo exists. Once `status` is `"approved"`,
 * `asset` is supplied and the generated placeholder is never rendered.
 *
 * `placeholderShape` stays required after approval: it is what the generated
 * fallback draws if the asset ever fails to load, so the lockup box never
 * collapses.
 */
export interface LogoTokens {
  /** Path under /public. `null` while placeholder — nothing to serve yet. */
  asset: string | null;
  /** Shape of the generated stand-in mark. */
  placeholderShape: 'square' | 'rounded' | 'circle' | 'hexagon';
  /** Aspect ratio of the lockup box, so layout never shifts on swap. */
  lockupRatio: number;
  /** Minimum rendered height in px. Reserved space is identical pre/post swap. */
  minHeight: number;
}

export interface BrandDefinition {
  /** Stable id used by `BRAND_ID` to select this definition. */
  id: string;
  /**
   * The trading name. Every surface reads this token, so a name change lands
   * in one place — that property is what let the site run for a whole phase
   * without one.
   */
  workingName: { ar: string; en: string };
  status: BrandStatus;
  /** Free text shown in the placeholder ribbon while status !== 'approved'. */
  notice: { ar: string; en: string } | null;
  /**
   * The brand line. `null` until an identity has one approved for public use —
   * an unapproved tagline must not reach a rendered page.
   */
  tagline: { ar: string; en: string } | null;
  colors: ColorTokens;
  typography: TypographyTokens;
  shape: ShapeTokens;
  motion: MotionTokens;
  logo: LogoTokens;
}
