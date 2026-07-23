# 3 — Component Library

> **Live version:** `/{locale}/system` — renders the _real_ components against
> the _active_ tokens. Switch `NEXT_PUBLIC_BRAND_ID` and it changes with the
> site, which makes it the fastest way to review a candidate identity across
> every component at once. It is `noindex`, permanently.

---

## 3.1 Layers

```
brand/          tokens          — the only literal design values
ui/primitives   containers      — Container, Section, Grid, Prose
ui/primitives   surfaces        — Card, CardLink, Badge, Button, ButtonLink
ui/*.tsx        interactive     — Reveal, Disclosure, Tabs, ThemeToggle  (client)
blocks/         page blocks     — Hero, PageHeader, ContentGrid, EmptyState,
                                  CTASection, Breadcrumbs, PlaceholderRibbon
blocks/         templates       — StaticPage
layout/         chrome          — Header, Footer
brand/          identity        — Mark, Wordmark
```

**Pages compose blocks. Pages do not write layout.** That rule is what keeps
twenty-odd routes visually coherent, and it is why a future product page can
exist without a designer touching it.

## 3.2 Layout primitives

| Component   | Responsibility    | Rule it enforces                                                                                                 |
| ----------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Container` | Horizontal rhythm | One max-width (`1280px`) and one gutter scale. `width="prose"` narrows to a `68ch` reading measure.              |
| `Section`   | Vertical rhythm   | **All** vertical spacing decisions live here, so pages cannot invent margins and drift.                          |
| `Grid`      | Column layout     | Columns are a _maximum_; it steps down at each breakpoint automatically. No page writes responsive column rules. |
| `Prose`     | Long-form text    | Applies measure and rhythm to authored markdown.                                                                 |

Sections separate by **alternating tone** (`canvas` / `surface`) — not by borders
or shadows. Tone survives an identity swap; a hand-placed divider does not.

## 3.3 Surfaces

**`Card`** — a container. `interactive` adds hover affordance, and should be set
_only_ when the whole card is a link.

**`CardLink`** — the entire surface is clickable via
`before:absolute before:inset-0`, but the accessible name comes from the heading
alone. Screen-reader users hear "VEXORA, link", not the card's whole text
content read out as one label. This is the detail card components usually get
wrong.

**`Button` / `ButtonLink`** — separate on purpose. **Navigation is a link,
always.** A `<button>` that navigates breaks middle-click, open-in-new-tab, and
the browser's own affordances.

## 3.4 Interactive components

All four are client components; everything else ships zero JS.

| Component     | Notes                                                                                                                                                                                                                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Reveal`      | Scroll entrance. Fails open, runs once, respects reduced motion. See [05-motion-strategy](05-motion-strategy.md) §5.4.                                                                                                                                                                                            |
| `Disclosure`  | Accordion. `grid-template-rows: 0fr → 1fr` animates to natural height with no JS measurement. Content is `hidden` while collapsed, so it leaves the tab order. Built on a real button with `aria-expanded`/`aria-controls` rather than `<details>`, which cannot animate and whose state is invisible to a group. |
| `Tabs`        | Full WAI-ARIA pattern: roving `tabindex`, Home/End, and **arrow direction flipped in RTL**. Verified in-browser: in Arabic, ArrowLeft advances to the next tab.                                                                                                                                                   |
| `ThemeToggle` | Three real states — light, dark, **system**. "System" is a choice, not the absence of one: a user following the OS should keep following it when the OS changes at sunset. An inline head script applies the stored theme before first paint, so there is no flash.                                               |

## 3.5 Blocks

| Block               | Purpose                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `PageHeader`        | Standard opening of every interior page — eyebrow, `h1`, lede, optional metadata slot.                                    |
| `Hero`              | Homepage only. No screenshot, no logo wall, no metric — each would be an unsupported claim. Typography and space instead. |
| `ContentGrid`       | Lists with bounded stagger (capped at the column count).                                                                  |
| `EmptyState`        | **A designed state, not a fallback.** Most sections here are legitimately empty; this makes that read as deliberate.      |
| `Breadcrumbs`       | Marks the current page with `aria-current="page"`.                                                                        |
| `CTASection`        | Single closing action.                                                                                                    |
| `PlaceholderRibbon` | Site-wide identity warning. Disappears automatically on approval — no flag to remember, no copy to delete.                |
| `StaticPage`        | Template shared by twelve pending routes. See [08-cms-architecture](08-cms-architecture.md) §8.7.                         |

## 3.6 The identity components

**`Mark`** — while `logo.asset` is `null`, renders a _generated geometric
stand-in_: an outlined shape with a diagonal. Deliberately **not a letterform**,
because a glyph would read as a logo proposal. When a real asset is registered
it serves that instead, at exactly the same reserved size — the box is computed
from `logo.minHeight` and `logo.lockupRatio` in both branches, so **layout does
not shift on swap**.

**`Wordmark`** — mark + name lockup. The name reads from `brand.workingName`,
currently `[الاسم قيد التحقق]` / `[WORKING NAME]`.

## 3.7 Rules for new components

1. Semantic tokens only. `bg-surface`, never `bg-slate-800`; `duration-base`,
   never `duration-200`. `npm run brand:check` enforces this.
2. **CSS logical properties only** — `ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`.
   Never `pl-`/`pr-`/`left-`/`right-`. This is what makes RTL free.
3. Server component unless it genuinely needs state or an event handler.
4. Keyboard-complete before it is considered done: focus visible, correct roles,
   correct tab order, and arrow-key direction flipped under RTL.
5. Bilingual by construction — accept `Localized`, or accept resolved strings
   and let the page do the resolving. Never hardcode user-facing text in a
   component.
