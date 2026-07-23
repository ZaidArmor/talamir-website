# 5 — Motion and Animation Strategy

> **Tokens:** `motion` in [`brand/brand.types.ts`](../brand/brand.types.ts) > **Primitives:** [`Reveal.tsx`](../src/components/ui/Reveal.tsx) ·
> [`Disclosure.tsx`](../src/components/ui/Disclosure.tsx) ·
> [`globals.css`](../src/styles/globals.css)

---

## 5.1 Position

Motion on this site does three jobs and no others:

1. **Confirm** — the interface acknowledges input (hover, focus, press).
2. **Explain** — a change of state shows where the new thing came from.
3. **Pace** — entrance reveals give the eye a moment to land on new content.

Motion that decorates, demonstrates capability, or fills waiting time is out of
scope. Every animation here is a **CSS transition** or the single scroll-reveal
primitive; there is no animation library, no scroll-jacking, no parallax, no
autoplaying video, no canvas.

This is partly discipline and partly honesty: an unbranded site with no approved
identity should not be performing. When the identity arrives it may justify a
richer motion language — and because motion is **tokenised** (§5.3), raising the
expressiveness is a token change, not a rewrite.

## 5.2 The accessibility floor

`prefers-reduced-motion: reduce` neutralises **everything**, in one block in
`globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .reveal[data-reveal='pending'] {
    opacity: 1;
    transform: none;
  }
}
```

This works only because of a rule enforced elsewhere: **nothing animates via
JS-driven style writes**, which would escape the media query. `Reveal` checks the
preference in JS _as well_, so a reduced-motion user never even enters the
hidden state.

## 5.3 Motion tokens

| Token                | Placeholder                     | Used for                                                                  |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| `--duration-instant` | 80ms                            | Hover, focus, checkbox — feedback the user should not perceive as motion. |
| `--duration-fast`    | 160ms                           | Dropdown, tooltip, tab change.                                            |
| `--duration-base`    | 240ms                           | Accordion, drawer, modal.                                                 |
| `--duration-slow`    | 420ms                           | Scroll reveals only.                                                      |
| `--ease-entrance`    | `cubic-bezier(0.16, 1, 0.3, 1)` | Arriving — decelerate.                                                    |
| `--ease-exit`        | `cubic-bezier(0.4, 0, 1, 1)`    | Leaving — accelerate.                                                     |
| `--ease-standard`    | `cubic-bezier(0.4, 0, 0.2, 1)`  | Both ends on screen.                                                      |
| `--ease-emphasis`    | overshoot                       | Optional; an identity may alias it to `standard`.                         |
| `--stagger`          | 60ms                            | Delay between siblings.                                                   |
| `--motion-distance`  | 16px                            | Maximum reveal travel.                                                    |

**Distance is capped at 16px** on purpose. Long travel reads as a page still
loading. The reveal should feel like the content settling, not arriving.

## 5.4 Scroll reveal — three safety properties

[`Reveal.tsx`](../src/components/ui/Reveal.tsx) is the only entrance animation.

**Fails open.** Content renders _visible_ and is hidden only after the effect
confirms `IntersectionObserver` exists. No JS, a thrown effect, or an old
browser all leave the page fully readable. The common alternative —
`opacity: 0` in CSS, revealed by JS — makes the entire site blank when JS fails.

**Runs once.** The observer disconnects on first intersection. Content never
re-animates on scroll-back; that difference is what separates polish from nausea.

**Stagger is bounded.** `ContentGrid` caps the index at the column count, so a
20-item grid staggers over one row, not over 20 × 60ms = 1.2s of visible delay.

Trigger point is `rootMargin: '0px 0px -10% 0px'` — the transition starts
slightly before the element reaches the viewport edge, so it finishes about when
the reader's eye arrives.

## 5.5 Interactive components

| Component                                                 | Motion                                                   | Notable detail                                                                                                                                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`Disclosure`](../src/components/ui/Disclosure.tsx)       | `grid-template-rows: 0fr → 1fr` over `--duration-base`   | Animates to natural height with **no JS measurement** — no layout thrash, and correct when content reflows at another breakpoint. Content is `hidden` while collapsed, so it leaves the tab order. |
| [`Tabs`](../src/components/ui/Tabs.tsx)                   | Colour + border transition only                          | Full WAI-ARIA pattern: roving `tabindex`, Home/End, and **arrow direction flips in RTL** — in Arabic, ArrowLeft moves to the _next_ tab. Verified in-browser.                                      |
| [`Header`](../src/components/layout/Header.tsx) dropdowns | Opacity + 4px lift, `--duration-fast`, `--ease-entrance` | Opens on hover **and `focus-within`**, so keyboard users get the panel. Uses `invisible`, not `hidden`, to keep links focusable and let opacity transition.                                        |
| Mobile drawer                                             | None (instant)                                           | A drawer that animates in on a phone delays the first tap. Body scroll is locked while open; the drawer closes on navigation.                                                                      |
| [`ThemeToggle`](../src/components/ui/ThemeToggle.tsx)     | None                                                     | Theme changes must be instantaneous. An inline head script applies the stored theme **before first paint** so there is no flash.                                                                   |
| Buttons / cards / links                                   | `--duration-instant` / `--duration-fast`                 | Colour and border only. Cards never scale — scaling shifts neighbouring text.                                                                                                                      |

## 5.6 Rules for future work

1. Never animate `width`, `height`, `top` or `left`. Use `transform`, `opacity`,
   or the `grid-template-rows` technique.
2. Never animate anything above 400ms except a deliberate scroll reveal.
3. Never make motion load-bearing: if the animation does not run, the interface
   must still be fully usable and legible.
4. Never introduce a JS animation loop. It escapes the reduced-motion floor.
5. Never re-trigger an entrance animation on scroll-back.
6. Focus rings never animate — they must appear instantly.
