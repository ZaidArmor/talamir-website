# 8 — CMS Architecture and Content Governance

> **Schema:** [`src/content/types.ts`](../src/content/types.ts) > **Access boundary:** [`src/content/index.ts`](../src/content/index.ts) > **Guard:** [`scripts/check-claims.ts`](../scripts/check-claims.ts)

---

## 8.1 Why there is no CMS yet — and why that is not a shortcut

Content today lives in typed TypeScript modules. That is a deliberate stage, not
a deferral, for three reasons:

1. **The schema is the hard part.** Choosing a CMS before the content model is
   settled means modelling twice. The model is expressed here in a form the
   compiler checks.
2. **There is very little approved content.** A CMS with three real entries and
   an editorial workflow nobody uses is overhead.
3. **The swap is already designed for.** Pages never import content modules
   directly — they call loaders. Moving to a headless CMS rewrites _one file_.

## 8.2 The access boundary

```
content/products.ts  taxonomies.ts  editorial.ts     ← storage (swappable)
                    ↓
content/index.ts                                     ← THE BOUNDARY
   getProducts()  getProduct(slug)  getDocSections()  getAllRoutableContent()
                    ↓
app/**/page.tsx                                      ← consumers
```

No page imports `products.ts`. Every page calls a loader. Replacing local
modules with CMS fetches means rewriting `content/index.ts` and nothing else.

## 8.3 The content model

| Type        | Purpose                              | Drives                                     |
| ----------- | ------------------------------------ | ------------------------------------------ |
| `Product`   | A portfolio product                  | `/products/{slug}`, nav, sitemap, homepage |
| `Solution`  | A problem shape, product-independent | `/solutions/{slug}`                        |
| `Industry`  | A sector and its pressures           | `/industries/{slug}`                       |
| `Post`      | Blog article                         | `/blog/{slug}`                             |
| `DocPage`   | Documentation page                   | `/documentation/{slug}` + sidebar grouping |
| `Role`      | Open position                        | `/careers/{slug}`                          |
| `PressItem` | Media coverage                       | `/press`                                   |

All share `ContentBase`: `slug`, `title`, `summary`, `claimLevel`, `state`,
`updated`. Everything user-facing is `Localized` (`{ ar, en }`) — bilingualism is
in the type, so a missing translation is a compile error rather than a blank
region on a page.

## 8.4 Publication states

`draft` · `review` · `published` · `archived`

**Drafts render in development and are withheld in production.** One predicate,
[`isVisible`](../src/content/index.ts), enforces it for every type at once.

This is the mechanism that lets unfinished sections exist in the repository
without ever putting unapproved claims in front of the public. All six solution
and industry entries are `draft` today: their routes, layouts and cross-links
are reviewable locally, and production shows a designed empty state.

## 8.5 Claim levels — the governance link

This is the part that connects the website to
`talamir-product-portfolio`, whose register states plainly that no approved
source exists for any commercial, legal, or launch claim, and that no product
may be described as ready, available, or for sale.

A website is exactly where that discipline erodes. Someone writes "trusted by
teams across the region" into a summary field, it reads well, and nobody notices
it is unfounded.

| Level         | Permits                                                                   |
| ------------- | ------------------------------------------------------------------------- |
| `structural`  | Name and category only. No capability, availability or performance claim. |
| `descriptive` | Capabilities described. Still nothing about availability or pricing.      |
| `commercial`  | Commercial statements. **Requires an approved source on file.**           |

Both products are `structural`. VEXORA's category — "Enterprise Resource
Planning" — is the single fact the register confirms. Its lifecycle stage is
`null`, which the page renders as **"Pending owner input"** rather than
inventing a stage. SULTAN carries the one status the register does assert:
_In Development — Demonstration Only_.

### Enforcement

```bash
npm run content:check
```

Scans every entry for commercial language — social proof, market position,
availability, pricing, compliance, service-level and customer-base claims, in
Arabic and English — and fails the build if it appears below `commercial` level.
It also fails any `published` entry sitting at `commercial`, so raising the level
is a deliberate act rather than a quiet edit.

Current result: **9 entries, no unfounded commercial language.**

## 8.6 Empty content is a designed state

`posts`, `roles` and `press` are empty arrays. That is correct:

- a press item implies real coverage;
- a role implies an open requisition;
- a post implies a named author.

Fabricating any of them would put unverifiable claims on a public site.
[`EmptyState`](../src/components/blocks/index.tsx) makes each read as
intentional, and every page names _what is still owed_ via the `pending` field
in [`content/pages.ts`](../src/content/pages.ts) — so an empty page is a work
order, not a gap.

## 8.7 Fixed-page copy

The twelve pages not driven by a registry (About, Contact, Partners, Investors,
Press, Support, and the section landings) read their copy from
[`content/pages.ts`](../src/content/pages.ts). Keeping it out of route files
means the whole site's wording can be reviewed, translated, or handed to a CMS
in one pass.

Twelve of those routes share the [`StaticPage`](../src/components/blocks/StaticPage.tsx)
component. While content is pending they _should_ look identical — a reviewer
then sees the system, rather than twelve half-finished designs. A page that
earns real content stops using the template and gets its own composition.

## 8.8 Migrating to a headless CMS

1. Model the types in §8.3 as CMS collections. `claimLevel` and `state` must
   exist as editor-visible fields — they are governance, not implementation.
2. Rewrite the loaders in `content/index.ts` to fetch. Signatures stay the same;
   they are already shaped for async access.
3. Keep `isVisible` **server-side**. Draft filtering must never be a client
   concern.
4. Keep `check-claims.ts` in CI, running against fetched content. The guard
   matters _more_ once non-engineers can publish, not less.
5. Markdown bodies already render through
   [`lib/markdown.tsx`](../src/lib/markdown.tsx), which emits React elements and
   never raw HTML — so untrusted CMS editors cannot inject markup.

## 8.9 Adding content today

| Task               | Change                                                    | Appears in                                      |
| ------------------ | --------------------------------------------------------- | ----------------------------------------------- |
| New product        | One entry in `products.ts`                                | Route, nav, footer, homepage, sitemap, metadata |
| New doc page       | One entry in `editorial.ts`                               | Route, docs index, sidebar section, sitemap     |
| Publish a solution | Flip `state` to `published`, add copy, raise `claimLevel` | Solutions index, nav, footer, sitemap           |
| New role           | One entry in `roles`                                      | Careers index, route, sitemap                   |

None of these is a code change.
