# 4 — Responsive Rules and Bidirectional Layout

> **Config:** `screens` and `maxWidth` in [`tailwind.config.ts`](../tailwind.config.ts) > **Fluid type:** `@layer base` in [`globals.css`](../src/styles/globals.css)

---

## 4.1 Breakpoints

Named after the device situation, not the pixel width.

| Token    | Width   | Situation                                                        |
| -------- | ------- | ---------------------------------------------------------------- |
| _(base)_ | < 480px | Phone, portrait. **The default styles.**                         |
| `sm`     | 480px   | Large phone. Grids go to 2 columns.                              |
| `md`     | 768px   | Tablet portrait. Footer reaches 4 columns.                       |
| `lg`     | 1024px  | Tablet landscape / small laptop. **Desktop navigation appears.** |
| `xl`     | 1280px  | Desktop. Container reaches its max width.                        |
| `2xl`    | 1536px  | Wide desktop. Container stops growing; margins absorb the rest.  |

**Mobile-first, without exception.** Unprefixed classes are the phone layout;
every prefixed class only ever _adds_. There is no `max-width` media query in
the codebase, so styles never fight each other.

`lg` is the one consequential breakpoint: the header switches from drawer to
full navigation. It sits at 1024px rather than 768px because the five-section
nav plus wordmark, language switch and theme toggle does not fit comfortably on
a tablet in portrait.

## 4.2 Fluid type instead of breakpoint stacking

Display sizes interpolate with `clamp()` rather than being redeclared at each
breakpoint:

```css
.text-display {
  font-size: clamp(2.25rem, 1.4rem + 4.2vw, var(--text-display));
}
```

The token is the **desktop anchor**; the clamp interpolates down to mobile. So a
heading needs one class, not four, and an identity swap that changes
`--text-display` automatically rescales the whole curve.

Body text does **not** scale fluidly. Reading size should be constant — a
paragraph that grows with the viewport gets harder to read on a large screen,
not easier.

## 4.3 Measure

`max-w-prose` is **68ch**, below the usual 75ch. Arabic sets wider per character
and reads comfortably at a shorter measure; 68ch serves both scripts without a
per-locale rule.

## 4.4 Grids

`Grid` takes a column _maximum_ and steps down by itself:

| `columns` | base | `sm` | `lg` |
| --------- | ---- | ---- | ---- |
| `2`       | 1    | 2    | 2    |
| `3`       | 1    | 2    | 3    |
| `4`       | 1    | 2    | 4    |

Pages never write responsive column rules. One consequence worth stating: a
grid that looks right on desktop cannot silently break on a phone, because the
phone case is the default and the desktop case is the addition.

## 4.5 Bidirectional layout — the core rule

**No physical direction properties anywhere.** Not in components, not in pages.

| Use                       | Never use                  |
| ------------------------- | -------------------------- |
| `ps-` / `pe-`             | `pl-` / `pr-`              |
| `ms-` / `me-`             | `ml-` / `mr-`              |
| `start-` / `end-`         | `left-` / `right-`         |
| `border-s` / `border-e`   | `border-l` / `border-r`    |
| `text-start` / `text-end` | `text-left` / `text-right` |

`dir` is set once, on `<html>`, derived from the locale in the root layout.
Nothing else in the site knows about direction. Adding a third language — RTL or
LTR — needs **no layout work at all**.

Two places where direction _is_ handled explicitly, because CSS cannot infer it:

1. **`Tabs` arrow keys.** In RTL the visual "next" tab is to the left, so the
   key mapping inverts. Verified in-browser.
2. **`.force-ltr`.** Code, identifiers, dates and version numbers inside Arabic
   pages must not inherit RTL ordering. `globals.css` applies
   `direction: ltr; unicode-bidi: isolate` to `code`, `kbd`, `samp` and the
   `.force-ltr` class. Without `isolate`, a Latin string at the end of an Arabic
   sentence renders with its punctuation in the wrong place.

## 4.6 Touch and viewport

- Interactive targets are ≥ 36px tall; the icon buttons are 36 × 36.
- Mobile drawer is capped at `calc(100dvh - 4rem)` and scrolls internally.
  `dvh`, not `vh` — `vh` is wrong on mobile browsers whose toolbar hides.
- Body scroll is locked while the drawer is open, and released on unmount.
- The drawer closes on navigation. Without that it stays open over the new page
  and reads as a broken link.
- Documentation's sidebar becomes a normal block above the content below `lg`
  rather than a second drawer — one fewer thing to open on a phone.

## 4.7 Theme

Light and dark are **both mandatory** in the brand contract. Dark mode is a
re-declaration of the colour variables, not a second set of classes:

```
:root                                        → light
@media (prefers-color-scheme: dark)          → dark, unless [data-theme='light']
:root[data-theme='dark' | 'light']           → explicit choice wins
```

The explicit choice wins **in both directions** — a user who forces light while
their OS is dark gets light. Verified: with the OS in dark mode, `--color-canvas`
resolved to the dark token and `<body>` painted `rgb(15, 16, 18)`.

## 4.8 Checklist for new work

1. Write the phone layout first, unprefixed.
2. Add `sm:`/`lg:` only to _add_. Never `max-*` queries.
3. Logical properties only.
4. Check both `dir` values — `/ar/…` and `/en/…` render the same page.
5. Check both themes.
6. Long content (tables, code) scrolls inside its own container; the page body
   must never scroll horizontally.
