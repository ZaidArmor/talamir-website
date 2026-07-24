# talamir-website

**TALAMIR — Official website (W01)**
**تالامير — الموقع الرسمي**

Version **0.2.0** · Status: **Approved landing page, not yet indexed** · Date: **2026-07-24**

---

## 1. What this repository is

The official website. It was built **structure-first**: information
architecture, navigation, routing, component library, motion, responsive rules,
SEO architecture and content model came first, on a deliberately neutral
placeholder identity, because none of the visual identity had been approved.

That identity has since been **approved**, and the swap the architecture was
built for has happened. It touched one file — `brand/brand.talamir.ts` — plus
the landing composition that reads from it. No component, page or layout
contains a colour, font, radius or timing of its own; `npm run brand:check`
fails the build if one appears.

The placeholder identity stays registered rather than being deleted: it is the
fixture the swap tests compare against, and the proof that the layer works is
only meaningful while both ends of the swap still exist.

> **Approved brand:** تالامير / TALAMIR.
> The approved tagline is carried by `brand.tagline` and is deliberately not
> quoted here — one source for the wording, including in documentation, so the
> two cannot drift apart. `npm run test` fails if any file outside `brand/`
> reproduces it.

## 2. What this repository is NOT

By explicit constraint, this site does **not**:

- claim any product is ready, available, complete, or for sale;
- state pricing, service levels, compliance certifications, or uptime;
- reference customers, publish testimonials, or display a logo wall;
- assert a legal entity, registration, or copyright holder;
- get indexed by search engines — `noindex` and `robots.txt: Disallow: /` are in
  force until indexing is explicitly enabled, which is now a **separate** owner
  decision from identity approval (see §5 and GOVERNANCE.md §7.3).

Those constraints inherit from `talamir-product-portfolio`, whose register
states that no approved source exists for any commercial, legal, or launch
claim. They are **enforced by a build gate**, not by convention — see §5.

## 3. Stack

Next.js 15.5 (App Router) · React 19 · TypeScript 5.6 (strict) · Tailwind CSS 3.4.
No database, no CMS, no runtime data source — every route is statically
prerendered. Arabic-first, bilingual AR/EN, full RTL.

## 4. Commands

```bash
npm install
npm run dev              # http://localhost:3000 → redirects to /ar
npm run build
npm run format:check     # prettier
npm run lint             # zero errors, zero warnings
npm run typecheck        # zero errors
npm run test             # 326 tests
npm run brand:check      # no literal design values outside brand/
npm run content:check    # no unfounded commercial claims in content
npm run boundary:check   # the workspace is self-contained
npm run scan:secrets     # secrets, personal data, absolute paths
npm run closure:verify   # all of the above, in order
```

`npm run test` requires a prior `npm run build`: the accessibility and
visibility suites assert against the **real prerendered HTML**, not against
source intent. `closure:verify` orders them correctly.

## 5. The four guards

| Command          | Protects                | Fails on                                                                                                                                                                              |
| ---------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brand:check`    | The identity swap       | Hardcoded hex, colour functions, Tailwind default-palette classes, arbitrary colour/radius/duration classes, font declarations, or component-level logo assumptions outside `brand/`. |
| `content:check`  | The governance boundary | Commercial language (social proof, market position, availability, pricing, compliance, SLA, customer claims — AR and EN) on any entry below `commercial` claim level.                 |
| `boundary:check` | Workspace isolation     | A parent or nested repository, a reference to a forbidden project tree, or an absolute path in any npm script.                                                                        |
| `scan:secrets`   | Disclosure              | Credentials, keys, tokens, connection strings, email addresses, phone numbers, or absolute filesystem paths.                                                                          |

These promises decay silently without enforcement. One hardcoded colour and the
next designer has to hunt; one confident sentence in a summary field and the site
is making a claim the register does not support.

The test suite carries the rest: **246 tests** across brand contract, swap proof,
contrast, governance controls, accessibility, RTL keyboard behaviour, reduced
motion, production visibility, route integrity and internal links.

## 6. Swapping the identity

```bash
NEXT_PUBLIC_BRAND_ID=swap-test npm run dev
```

`brand/brand.swap-test.ts` is a **verification fixture, not a design proposal** —
engineered to be as different from the placeholder as the contract permits
(warm instead of cool, sharp instead of rounded, serif, hexagon mark, faster
motion). It exists so the swap can be _proven_ rather than assumed.

Verified on this build: colours, radii, border width, motion durations, font
stacks, mark geometry and the wordmark all changed. **Zero component files
edited.** Full result table in [docs/02-design-tokens.md](docs/02-design-tokens.md) §2.6.

To introduce the real identity: add a `BrandDefinition`, register it in
`brand/index.ts`, set `NEXT_PUBLIC_BRAND_ID`. Set `status: 'approved'` only when
it genuinely is — that flag also lifts the search-engine gate.

## 7. Documentation

| Topic                                   | File                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------- |
| IA, navigation, sitemap, user journeys  | [docs/01-information-architecture.md](docs/01-information-architecture.md) |
| Design tokens and the identity swap     | [docs/02-design-tokens.md](docs/02-design-tokens.md)                       |
| Component library                       | [docs/03-component-library.md](docs/03-component-library.md)               |
| Responsive rules and RTL                | [docs/04-responsive-rules.md](docs/04-responsive-rules.md)                 |
| Motion and animation strategy           | [docs/05-motion-strategy.md](docs/05-motion-strategy.md)                   |
| Accessibility (including known gaps)    | [docs/06-accessibility.md](docs/06-accessibility.md)                       |
| SEO architecture                        | [docs/07-seo-architecture.md](docs/07-seo-architecture.md)                 |
| CMS architecture and content governance | [docs/08-cms-architecture.md](docs/08-cms-architecture.md)                 |

A **living component library** renders at `/{locale}/system` against the active
tokens. It is `noindex`, permanently — it is an internal review surface.

## 8. Layout

```
brand/            the identity contract and its implementations — THE swap point
src/app/[locale]/ routes (App Router)
src/components/   ui/ (primitives, interactive) · blocks/ · layout/ · brand/
src/content/      content registries, navigation tree, fixed-page copy
src/lib/          tokens, i18n, seo, markdown
scripts/          the four guards
tests/            326 tests — contract, contrast, governance, a11y, routes
docs/             architecture and strategy documents
GOVERNANCE.md     status classification and owner-decision compliance
```

## 9. Relationship to other workspaces

- **`talamir-product-portfolio`** — the authoritative source for product facts.
  `src/content/products.ts` inherits from its register, including its
  `UNKNOWN — OWNER INPUT REQUIRED` entries, which render honestly as
  _"Pending owner input"_ rather than being filled in.
- **The internal brand-exploration document set** (`docs/brand-exploration/`,
  maintained in a separate workspace outside this repository) — marked
  `INTERNAL CONCEPT — NOT APPROVED`. It preceded the approved identity and is
  superseded by it; the placeholder palette that shipped during exploration was
  deliberately none of its candidate directions, so no build before approval
  could be mistaken for a decision.

This repository holds **no absolute filesystem path** to any other workspace, and
no build step, script, import, or configuration value resolves outside it. The
relationships above are editorial provenance only.

## 10. Status

| Area                              | State                                                              |
| --------------------------------- | ------------------------------------------------------------------ |
| IA, navigation, routing           | Complete — 24 route entrypoints → 45 static pages, all prerendered |
| Component library                 | Complete                                                           |
| Design tokens / swap mechanism    | Complete and verified                                              |
| Motion, responsive, RTL           | Complete                                                           |
| SEO architecture                  | Complete — production domain, OG image; gated `noindex`            |
| Content model + governance guards | Complete                                                           |
| **Visual identity**               | **Approved — `brand/brand.talamir.ts`, swapped in one file**       |
| Landing page (`/ar`, `/en`)       | Complete — approved design, 22 sections, both locales              |
| Automated a11y / contrast testing | Complete — axe over prerendered HTML + token-level WCAG contrast   |
| Governance record                 | Complete — see [GOVERNANCE.md](GOVERNANCE.md)                      |
| Screen-reader testing             | **Not performed** — REQUIRED BEFORE PUBLIC RELEASE, docs/06 §6.10  |
| Third-party accessibility audit   | **Not performed** — docs/06 §6.10                                  |
| Inner-site page copy              | **Pending — no approved source for commercial content**            |
| **Public indexing**               | **OFF — separate owner decision, see GOVERNANCE.md §7.3**          |
| **Public launch**                 | **Not authorized**                                                 |

Governance classification of every material decision, and compliance with owner
decisions OD-16/17/18/19/21/22/23, is recorded in [GOVERNANCE.md](GOVERNANCE.md).
