# 2 — Design Tokens and the Identity Swap

> **The contract:** [`brand/brand.types.ts`](../brand/brand.types.ts) > **The current values:** [`brand/brand.placeholder.ts`](../brand/brand.placeholder.ts) > **The registry (swap point):** [`brand/index.ts`](../brand/index.ts)

---

## 2.1 The promise

> Swapping the identity touches **one file**. No component, page, or layout changes.

This is verifiable, not aspirational — see §2.6.

## 2.2 How it works

```
brand/brand.placeholder.ts     BrandDefinition  — the only literal values
        ↓
brand/index.ts                 registry, selected by NEXT_PUBLIC_BRAND_ID
        ↓
src/lib/tokens.ts              serialises to CSS custom properties
        ↓
app/[locale]/layout.tsx        emits one <style> block
        ↓
tailwind.config.ts             every utility resolves to var(--…)
        ↓
components                     bg-surface, text-muted, duration-base, rounded-lg
```

Components name a **role**, never a value. `bg-surface`, not `bg-slate-800`.
`duration-base`, not `duration-200`.

## 2.3 Why Tailwind's default palette is deleted

`tailwind.config.ts` replaces `colors` wholesale rather than extending it. If
`bg-slate-800` still resolved, a component could use it, it would survive an
identity swap, and the site would end up half-swapped in a way nobody notices
until a stakeholder review. Deleting the defaults turns that silent failure into
a build error.

## 2.4 Token groups

| Group        | Count                                     | Notes                                                                                              |
| ------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Colour roles | 16 × 2 schemes                            | Light and dark are both **mandatory**. An identity that only works in one is rejected by the type. |
| Typography   | 3 stacks, 9 sizes, 4 weights, 4 leadings  | Arabic and Latin stacks are separate.                                                              |
| Shape        | 6 radii, 4 elevations, 1 border width     | A flat identity supplies `none` elevations — flatness is a token, not a code change.               |
| Motion       | 4 durations, 4 easings, stagger, distance | Motion is a brand property. See [05-motion-strategy](05-motion-strategy.md).                       |
| Logo         | asset, shape, ratio, min height           | Reserved box is identical before and after swap, so layout never shifts.                           |

### Deliberate constraints in the type system

- **No Arabic letter-spacing token.** Arabic letterforms connect; tracking them
  damages legibility. The token simply does not exist, so a component cannot
  reach for it.
- **`focus` is independent of `accent`.** A future identity may pick a pale
  accent; the focus ring must stay high-contrast regardless.
- **Status colours are derived from the identity, never part of it.**
  Success/warning/danger/info live in the role set but are documented as
  downstream of the palette, matching the rule already established in
  `docs/brand-exploration/03-color-systems.md`.

## 2.5 The placeholder values are not a proposal

The current palette is **neutral greys plus one desaturated blue**. It is
deliberately _none of_ the three exploration directions — Deep Graphite, Thermal
Split, Precision Light — recorded in
`docs/brand-exploration/03-color-systems.md`.

Shipping one of those candidates would read as a decision, and no decision has
been made. Judge the layout, rhythm and hierarchy of this build; ignore the hues.

The name is likewise a token: `[الاسم قيد التحقق]` / `[WORKING NAME]`. The
brackets are the point — the trading name is under validation and lands in one
place when it is settled.

## 2.6 Verifying a swap

A fixture identity ships with the repo for exactly this purpose:
[`brand/brand.swap-test.ts`](../brand/brand.swap-test.ts). It is **not** a design
proposal — it is engineered to be as different as the contract permits.

```bash
NEXT_PUBLIC_BRAND_ID=swap-test npm run dev
```

**Result of the verification run on this build:**

| Property                   | `placeholder`        | `swap-test`          | Changed |
| -------------------------- | -------------------- | -------------------- | ------- |
| `--color-canvas` (dark)    | `#0F1012`            | `#191207`            | ✅      |
| `--color-accent` (dark)    | `#93A6C7`            | `#E08A5A`            | ✅      |
| `--radius-lg`              | `12px`               | `0px`                | ✅      |
| `--border-width`           | `1px`                | `2px`                | ✅      |
| `--duration-base`          | `240ms`              | `160ms`              | ✅      |
| Body font                  | sans-serif stack     | serif stack          | ✅      |
| Mark geometry              | rounded square       | hexagon              | ✅      |
| Wordmark                   | `[الاسم قيد التحقق]` | `[اختبار الاستبدال]` | ✅      |
| **Component files edited** | —                    | —                    | **0**   |

If a future change breaks this, `npm run brand:check` catches the usual cause: a
literal colour or timing that crept into `src/`.

## 2.7 Introducing the real identity

1. Add `brand/brand.talamir.ts` exporting a `BrandDefinition`.
2. Register it in `brand/index.ts`.
3. Set `NEXT_PUBLIC_BRAND_ID=talamir`.
4. Set `status: 'approved'` **only when it genuinely is** — that flag also lifts
   the site-wide `noindex` and the `robots.txt` disallow. See
   [07-seo-architecture](07-seo-architecture.md).

Nothing else changes. An unknown `BRAND_ID` throws at startup rather than
silently falling back to the placeholder, so a typo cannot masquerade as a
successful swap.

## 2.8 Guard

```bash
npm run brand:check
```

Fails the build on any hardcoded hex, `rgb()/hsl()/oklch()`, or literal
transition timing anywhere under `src/`. Comments are exempt (prose may mention
a value); `globals.css` is exempt for the one literal it needs — the `0.01ms`
reduced-motion floor.
