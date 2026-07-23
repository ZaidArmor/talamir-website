# 7 — SEO Architecture

> **Implementation:** [`src/lib/seo.ts`](../src/lib/seo.ts) ·
> [`app/sitemap.ts`](../src/app/sitemap.ts) · [`app/robots.ts`](../src/app/robots.ts) ·
> [`middleware.ts`](../src/middleware.ts)

---

## 7.1 The gate

**While the identity is unapproved, the entire site is `noindex` and
`robots.txt` disallows everything.**

This is not caution for its own sake. The trading name is under validation. If
the site is indexed under a name that is later rejected, that name enters search
results, caches and knowledge graphs — all of which are slow to correct, and all
of which would prejudice the validation decision itself.

The gate is a **mechanism, not a checklist item**:

```ts
isPlaceholderIdentity; // brand.status !== 'approved'
```

One flag drives three things at once:

| Surface                | Placeholder                  | Approved                       |
| ---------------------- | ---------------------------- | ------------------------------ |
| `<meta name="robots">` | `noindex, nofollow, nocache` | `index, follow`                |
| `/robots.txt`          | `Disallow: /`                | `Allow: /` + sitemap reference |
| `/sitemap.xml`         | empty urlset                 | full URL set                   |
| Organisation JSON-LD   | not emitted                  | emitted                        |

Verified on this build: `robots.txt` returns `Disallow: /`, `sitemap.xml` is an
empty urlset, and product pages carry `noindex, nofollow, nocache`.

Note the deliberate consistency: an empty sitemap rather than a populated one.
Advertising URLs while telling crawlers not to index them is a contradiction;
the honest form of "not yet" is to advertise nothing.

Organisation JSON-LD is withheld for the same reason — structured data is
precisely the mechanism that puts a name into a knowledge graph.
`breadcrumbSchema` exists in [`src/lib/seo.ts`](../src/lib/seo.ts) as a
ready-to-use export, but it is **not currently wired into any route** — no
page imports it. Wiring it up is deferred to an approved SEO phase; until
then, no `BreadcrumbList` structured data is emitted anywhere and no indexing
behavior is affected by its presence in the codebase.

## 7.2 Canonicals and hreflang

Every page declares:

- **one canonical** — `{origin}/{locale}{path}`;
- **hreflang alternates for every locale**, plus `x-default` → Arabic.

Locale-less URLs are **redirected**, never rewritten
([`middleware.ts`](../src/middleware.ts)). A rewrite would leave `/products` and
`/ar/products` both serving content — the classic duplicate-content mistake.
A redirect leaves exactly one canonical URL per page.

`x-default` points at Arabic because this is an Arabic-first company, and the
default should reflect that rather than defaulting to English out of habit.

## 7.3 Metadata provenance

Titles and descriptions come from **content**, never from hardcoded strings:

```ts
pageMetadata({ locale, path, title: entry.title, description: entry.summary });
```

Consequences worth naming:

- a new product gets correct metadata with no metadata work;
- translating a title translates the `<title>`, OG tag and Twitter card at once;
- there is no drift between the `<h1>` a visitor reads and the title a crawler
  indexes, because both read the same field.

## 7.4 URL design

| Rule                                 | Reason                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| Slugs are stable and lowercase-kebab | A changed slug needs a redirect entry; the `slug` field is documented as stable. |
| No dates in URLs                     | A blog post's URL should survive a re-publish.                                   |
| No IDs or query parameters           | Every page is addressable and shareable as a clean path.                         |
| Section landings always exist        | `/products` is a real page, so `/products/vexora` never has a 404 parent.        |
| Locale is the first segment          | Simple, cache-friendly, and unambiguous to crawlers.                             |

## 7.5 Sitemap generation

[`app/sitemap.ts`](../src/app/sitemap.ts) derives from the _same_ sources the
site renders from — `footerNav()` and the content registries. There is no second
list to maintain, which is the usual reason sitemaps go stale.

Each entry carries `alternates.languages`, so search engines treat the Arabic
and English versions as one page in two languages rather than as duplicates.

`lastModified` comes from each entry's `updated` field, not from build time —
so rebuilding the site does not falsely claim every page changed.

## 7.6 Rendering and performance

Every route is **statically prerendered** (`●` SSG or `○` static in the build
output). There is no database and no request-time rendering, so:

- crawlers always receive complete HTML, never a JS shell;
- shared first-load JS is ~103 kB;
- the only client components are `Header`, `Reveal`, `Disclosure`, `Tabs` and
  `ThemeToggle` — everything else ships zero JS.

Fonts are **system stacks**. No webfont is loaded, so there is no
render-blocking font request and no layout shift from font swap. Licensing a
typeface is an identity decision that has not been made; when it is, it becomes
a token change in `brand/`.

## 7.7 Structured data

| Schema                 | Status                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `BreadcrumbList`       | Exported (`breadcrumbSchema`) but not wired into any route yet. Deferred to an approved SEO phase — not emitted today.     |
| `Organization`         | Withheld until identity approval.                                                                                          |
| `Article` (blog)       | Ready to add; withheld while no posts exist and no author identities are real.                                             |
| `JobPosting` (careers) | Ready to add; withheld while no approved requisitions exist.                                                               |
| `Product`              | **Deliberately withheld indefinitely.** Product schema implies commercial availability, which no approved source supports. |

## 7.8 Launch checklist

When identity approval lands:

1. Set `status: 'approved'` in the brand definition — this alone lifts the gate.
2. Set `NEXT_PUBLIC_SITE_URL` to the real origin (currently `https://example.invalid`).
3. Confirm `/robots.txt` now allows and references the sitemap.
4. Confirm `/sitemap.xml` is populated.
5. Keep `/system` `noindex` — it is an internal review surface, and its own
   `pageMetadata` call already forces this independently of the gate.
