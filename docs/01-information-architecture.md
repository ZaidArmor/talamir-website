# 1 — Information Architecture, Navigation, Sitemap, User Journeys

> **Single source:** [`src/content/navigation.ts`](../src/content/navigation.ts).
> The header, footer, mobile drawer, `/sitemap` page and `/sitemap.xml` are all
> derived from that one tree. This document explains the _reasoning_; the tree
> itself is the specification.

---

## 1.1 The three arrival questions

Visitors reach a company site with one of three questions. The top level maps
one section to each, and nothing else competes for that space.

| Question                            | Section                       | Why it is top-level                                                     |
| ----------------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| "What do you make?"                 | **Products**                  | The portfolio is the company. Anything that hides it costs conversions. |
| "Can you fix _my_ problem?"         | **Solutions**, **Industries** | Buyers who do not know the product name search by problem or by sector. |
| "Who are you, and can I trust you?" | **Company**                   | Trust decisions happen before product evaluation, not after.            |

**Resources** (documentation, support, blog) is deliberately _not_ one of the
three. It serves people who have already bought or already build — surfacing it
at the same weight as Products would dilute the commercial path for first-time
visitors while saving existing users no clicks at all.

## 1.2 Depth rule

**Two levels everywhere. Three only in Documentation.**

Past two levels visitors stop being able to predict where something lives, and
start using search instead of navigation. Documentation is exempt because
reference material is _browsed_, not journeyed through — it carries its own
sidebar (`section` → `page`) in
[`documentation/layout.tsx`](../src/app/[locale]/documentation/layout.tsx).

Every group is itself a page. There are no dead parent items that only open a
menu — a visitor who clicks "Solutions" gets a Solutions page, not nothing.

## 1.3 Sitemap

```
/{locale}/
├── products/                      Product portfolio index
│   └── {slug}/                    ← one route serves every product, forever
├── solutions/
│   └── {slug}/
├── industries/
│   └── {slug}/
├── documentation/                 Docs index + sidebar shell
│   └── {slug}/
├── support/
├── blog/
│   └── {slug}/
├── about/
├── careers/
│   └── {slug}/                    ← one route per open role
├── partners/                      Partner Program
├── investors/
├── press/
├── contact/
├── sitemap/                       Human-readable sitemap
└── system/                        Living component library (noindex, internal)
```

Plus two generated files at the origin root, outside the locale prefix:
`/robots.txt` and `/sitemap.xml`.

**Locale prefix is mandatory.** Every page lives under `/ar/…` or `/en/…`. A
request without a prefix is _redirected_, never rewritten
([`middleware.ts`](../src/middleware.ts)), so each page has exactly one
canonical URL and no duplicate-content exposure. Arabic is the default for
anyone who does not clearly prefer English.

## 1.4 Scaling to future products

Adding a product is **one entry** in
[`src/content/products.ts`](../src/content/products.ts). From that single entry
the following appear with no further work:

- the detail route (`generateStaticParams` over the registry);
- the card on `/products` and on the homepage;
- the item in the header dropdown and in every footer column;
- the entry in `/sitemap` and in `/sitemap.xml`;
- canonical URL, hreflang alternates, title and description.

This is the concrete meaning of "ready for current and future products". It was
verified by building: VEXORA and SULTAN each produce four static pages (2 locales
× 2 products) without a per-product file existing anywhere.

## 1.5 User journeys

Five journeys were designed for. Each names the entry point, the path, and the
**exit condition** — the thing that must be true for the journey to have worked.

### J1 — Evaluator, problem-first

> "Our workshop scheduling is chaos. Who fixes that?"

`Search / referral` → `/solutions/{slug}` → `/products/{slug}` → `/contact`

The solution page's job is to hand off to a product without the visitor having
learned a product name first. Cross-linking is bidirectional and derived from
the `solutions[]` array on each product, so the two sides cannot disagree.

**Exit condition:** the visitor can name one product and one next action.
**Current blocker:** solution pages are `draft` — no approved source links a
product to an outcome. The route works; the claim does not exist yet.

### J2 — Evaluator, product-first

> "Someone mentioned VEXORA. What is it?"

`Direct / word of mouth` → `/products/vexora` → `/documentation` → `/contact`

**Exit condition:** the visitor knows the category, the lifecycle stage, and
where to ask a question. All three are on the page today — including the
honest `Pending owner input` where the register has no answer.

### J3 — Existing user, task-first

> "How does X work?"

`Search` → `/documentation/{slug}` → sidebar → adjacent page

Never routed through marketing pages. Documentation is reachable in one click
from every page via Resources, and its sidebar keeps the visitor inside the docs.

**Exit condition:** answer found without returning to the homepage.

### J4 — Candidate

> "Are they hiring?"

`/careers` → `/careers/{slug}`

**Exit condition:** the visitor sees either a role or an unambiguous "nothing
open" — never an empty page that reads as broken. This is why `EmptyState`
exists as a designed component rather than a fallback.

### J5 — Partner / investor / press

> "Who do I talk to, and what is the material?"

`/partners` · `/investors` · `/press` → `/contact`

These three are structurally identical and low-traffic, which is exactly why
they share the `StaticPage` template. **Exit condition:** the visitor learns the
current state truthfully rather than finding a page that implies a programme
that does not yet exist.

## 1.6 What is deliberately absent

| Absent                        | Reason                                                    |
| ----------------------------- | --------------------------------------------------------- |
| Customer logo wall            | No approved customer references exist.                    |
| Metrics band ("10,000 users") | No approved figures exist.                                |
| Testimonials                  | Would require fabricated quotes.                          |
| Pricing page                  | No approved commercial model.                             |
| Legal footer / entity details | `talamir-legal-compliance` holds no approved source.      |
| Newsletter capture            | Collects personal data with no owner or retention policy. |

Each is a _route that can be added later_, not a structural gap. The absence is
enforced, not merely observed — see [`scripts/check-claims.ts`](../scripts/check-claims.ts).
