# 6 — Accessibility

Accessibility decisions are recorded here because several of them shaped the
component APIs, and would otherwise look like arbitrary implementation details.

---

## 6.1 Focus

One treatment for the entire site, in `globals.css`:

```css
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
:focus:not(:focus-visible) {
  outline: none;
}
```

`--color-focus` is a **role of its own**, deliberately independent of `accent` in
the brand contract. A future identity may choose a pale accent; the focus ring
must stay high-contrast regardless. Making it a separate token means that cannot
regress silently.

Focus rings never animate — they must appear instantly.

## 6.2 Skip link

Every page carries a skip link to `#main` as the first focusable element. It is
positioned off-screen and slides in on focus. `<main id="main">` is in the root
layout, so no page can forget it.

## 6.3 Landmarks

`header` / `nav` / `main` / `footer` on every page. Each `nav` has an
`aria-label` (main, footer, docs, breadcrumb), because multiple unlabelled
navigation landmarks are indistinguishable in a screen reader's landmark list.

## 6.4 Keyboard behaviour

| Surface          | Behaviour                                                                                                                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header dropdowns | Open on hover **and `focus-within`**. `invisible`, not `hidden`, so links stay focusable and opacity can transition.                                                                                                                     |
| Mobile drawer    | `aria-expanded` + `aria-controls`; closes on navigation; body scroll locked while open.                                                                                                                                                  |
| `Tabs`           | Roving `tabindex` — only the active tab is tabbable, so Tab moves _out_ of the tablist. Arrows move between tabs; Home/End jump to the ends; **arrow direction inverts in RTL**. Panels are focusable so keyboard users land on content. |
| `Disclosure`     | Real `<button>` with `aria-expanded`/`aria-controls`. Collapsed content is `hidden`, so it leaves the tab order entirely — animating height alone would leave invisible focusable content behind.                                        |
| `CardLink`       | The whole surface is clickable, but only the heading link is focusable, and it is the accessible name.                                                                                                                                   |

## 6.5 Motion

`prefers-reduced-motion: reduce` neutralises every animation in one block, and
`Reveal` additionally checks the preference in JS so a reduced-motion user never
enters the hidden state. Full reasoning in
[05-motion-strategy](05-motion-strategy.md) §5.2.

`Reveal` **fails open** — content renders visible and is hidden only once JS
confirms it can reveal it again. No JS, or a failed observer, leaves the page
fully readable rather than blank.

## 6.6 Language and direction

- `lang` and `dir` on `<html>`, derived from the locale.
- The language switcher carries `hrefLang` and `lang` on the link, so a screen
  reader announces "English" in English rather than reading it with Arabic
  phonetics.
- `.force-ltr` with `unicode-bidi: isolate` for code, dates and identifiers
  inside Arabic text.

## 6.7 Contrast

The brand contract documents the requirement on the colour roles: body text
≥ 4.5:1 against `canvas` and `surface`; interface elements ≥ 3:1. Both schemes
must satisfy it — an identity that only works in one is rejected by the type.

This is **enforced automatically** for every registered brand and both schemes —
see §6.9. A candidate identity that fails it cannot pass the build.

## 6.8 Images and icons

The generated `Mark` is `aria-hidden` with `role="presentation"` — it is
decorative, and the `Wordmark` link carries the accessible name. Icon-only
buttons (theme, menu) carry `aria-label`, and their glyphs are `aria-hidden`.

No icon library is used; icons are single characters or inline SVG. An icon set
is an identity decision that has not been made.

## 6.9 Automated coverage

Two gaps recorded in the first build are now **closed**.

### Accessibility gate — `tests/dom/accessibility.test.ts`

axe-core runs against the **real prerendered HTML** from `next build`, parsed in
jsdom. No browser download, no dev server, so the suite runs from any session.

Covered: Arabic home, English home, the component-system route in both locales,
products index, a product detail page, a documentation page, two empty-state
pages, and the sitemap page. Assertions span landmarks, heading order,
accessible names on every link and button, document language and direction, the
skip link, navigation labelling, the locale switcher, and the decorative mark.

The gate **fails on `serious` and `critical` impacts**. No rule is globally
suppressed. Two narrowly scoped exclusions, each justified in the file:

| Rule             | Why excluded                                                                                                                                                                  | Requirement still met by                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `region`         | The skip link is intentionally the first focusable element _before_ `<header>` — the documented WCAG 2.4.1 bypass-block pattern. Moving it inside a landmark would defeat it. | Landmark assertions in the same file.           |
| `color-contrast` | jsdom performs no layout or cascade resolution, so the rule cannot produce a meaningful result.                                                                               | The contrast suite below — which is _stricter_. |

### Contrast gate — `tests/contrast.test.ts`

WCAG 2.1 relative-luminance maths applied to the **design tokens themselves**:
every colour-role pair, in every registered brand, in both light and dark
schemes. 4.5:1 for text, 3:1 for non-text UI.

Token-level assertion is deliberately stronger than a rendered check: it catches
a failing palette the moment it is written, before any page uses it, and cannot
be fooled by a pair that no component happens to render yet.

**It found a real defect on first run.** `borderStrong` failed 3:1 against
`canvas`, `surface` and `surfaceMuted` in both brands and both schemes — it
bounds interactive controls, so WCAG 1.4.11 applies. Values were corrected in
the brand definitions, not in the test.

A colour format the checker cannot interpret (`oklch()`, for example) throws
rather than silently scoring — the signal to extend the checker, never to skip it.

### Interaction gate — `tests/dom/interaction.test.tsx`

Roving tabindex, Home/End, `aria-controls`/`aria-labelledby` wiring, collapsed
disclosure content leaving the tab order, `Reveal` failing open with no
observer, and reduced-motion behaviour. **RTL arrow-key direction is asserted
explicitly**: in Arabic, ArrowLeft advances to the next tab and wraps correctly.

## 6.10 Remaining gaps

Stated plainly rather than implied as solved:

- **Screen-reader testing has not been performed.** Roles and keyboard behaviour
  follow the WAI-ARIA patterns and are now verified automatically, but that is
  not the same as testing with NVDA, JAWS or VoiceOver. This remains
  **REQUIRED BEFORE PUBLIC RELEASE**.
- **No third-party accessibility audit.** Automated tooling catches a minority
  of real barriers; nothing here constitutes certification or a conformance
  claim.
- **No contrast check on rendered composites** — for example text over a
  translucent backdrop. The header uses `bg-canvas/85`; its computed contrast is
  not asserted, only the underlying token pair.
