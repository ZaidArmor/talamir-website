# Governance and Status Register — TALAMIR Website

**Status of this document:** APPROVED GOVERNANCE DECISION (record of decisions made
elsewhere) · **Version** 0.1.0 · **Date** 2026-07-23

This is an **implementation note**. It records how this repository complies with
owner decisions taken elsewhere. It **does not** create, amend, supersede, or
reinterpret any owner-decision record. Where an owner decision and this
repository appear to disagree, **the owner decision governs**.

---

## 1. Governing status of this website

| Statement                          | Status                                           |
| ---------------------------------- | ------------------------------------------------ |
| Public launch authorized           | **NO**                                           |
| Search-engine indexing enabled     | **NO** — `noindex` + `robots.txt: Disallow: /`   |
| Commercial content permitted       | **NO** — blocked and enforced by `content:check` |
| Final visual identity approved     | **NO** — deferred under OD-23                    |
| Final logo approved                | **NO**                                           |
| Final colour system approved       | **NO**                                           |
| Final typography system approved   | **NO**                                           |
| TALAMIR name legally cleared       | **NO** — see §2                                  |
| Any product commercially available | **NO**                                           |

## 2. Name status — validation is not legal clearance

**TALAMIR is a working / candidate name. It is not legally cleared.**

Name validation, brand-name selection, and legal clearance are **three different
things**. Nothing in this repository asserts the second or third.

Per **OD-19** (preliminary name/mark search — approved as read-only, no filing,
no fee), the governing facts are:

- trademark status is `UNKNOWN — OWNER INPUT REQUIRED`;
- no protection may be assumed;
- the mandatory formula is **"Brand name pending legal registration"**;
- **®** and **™** must not be used;
- the site must not describe TALAMIR as a registered company or registered mark.

**Compliance in this repository:** verified — no `®`, no `™`, and no
registration claim appears in any source file, content entry, document, or
rendered page. The trading name is rendered from a single token, currently
`[الاسم قيد التحقق]` / `[WORKING NAME]`.

## 3. Classification of every material decision

Exactly one class per item.

### 3.1 APPROVED GOVERNANCE DECISION

Decisions taken by the owner, or direct and necessary consequences of them.

| Item                                                                                                          | Basis                                                   |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Corporate website is an **independent surface**, separate from the Commercial Portal and from product portals | OD-21 (approved, option A)                              |
| No Commercial Portal implementation in this repository                                                        | OD-21                                                   |
| SULTAN presented as _In Development_ / _Demonstration Only_, never commercially available                     | OD-18 controls 2–4                                      |
| No market, segment, sizing, competitor, or research-backed positioning claim                                  | OD-22 (approved — deferred)                             |
| Visual identity deferred; internal exploration permitted under a mandatory label                              | OD-23                                                   |
| Site withheld from public indexing until identity approval                                                    | This repository's implementation of the OD-23 deferral  |
| Product facts inherited from the portfolio register, including its `UNKNOWN` entries                          | `talamir-product-portfolio` register                    |
| Claim-level policy (`structural` / `descriptive` / `commercial`) and its build guard                          | Implementation of OD-22 + portfolio-register discipline |
| Arabic-first, bilingual AR/EN, full RTL                                                                       | Product direction                                       |
| Two-level IA; documentation the sole exception                                                                | IA decision, §1 of docs/01                              |

### 3.2 INTERNAL PLACEHOLDER

Deliberately temporary. Must be replaced, and must never be presented as
approved.

| Item                                                                                | Location                        |
| ----------------------------------------------------------------------------------- | ------------------------------- |
| Placeholder colour roles (neutral greys + one desaturated blue)                     | `brand/brand.placeholder.ts`    |
| Placeholder type stacks (system fonts only — no typeface is licensed)               | `brand/brand.placeholder.ts`    |
| Placeholder shape, elevation, motion values                                         | `brand/brand.placeholder.ts`    |
| Generated geometric mark (outlined shape + diagonal, deliberately not a letterform) | `src/components/brand/Mark.tsx` |
| Working name token `[الاسم قيد التحقق]` / `[WORKING NAME]`                          | `brand.workingName`             |
| Placeholder ribbon shown site-wide                                                  | `PlaceholderRibbon`             |
| Pending-copy text on all fixed pages                                                | `src/content/pages.ts`          |

### 3.3 INTERNAL CONCEPT — NOT APPROVED

Exploratory. Not a proposal, not a decision, not for external use.

| Item                                        | Note                                                                                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brand/brand.swap-test.ts`                  | A **verification fixture**, not a candidate identity. Exists solely to prove the token swap. Carries `status: 'candidate'`, which does **not** lift any gate. |
| Draft Solutions entries (3)                 | `state: 'draft'`, withheld from production                                                                                                                    |
| Draft Industries entries (3)                | `state: 'draft'`, withheld from production                                                                                                                    |
| `/system` component-library route           | Internal review surface. Permanently `noindex`.                                                                                                               |
| The external brand-exploration document set | Maintained outside this repository under the OD-23 label `INTERNAL CONCEPT / NOT APPROVED / SUBJECT TO NAME VALIDATION`. Not modified or assessed here.       |

### 3.4 REQUIRED BEFORE PUBLIC RELEASE

Known and open. None is claimed as done.

| Item                                                       | Owner surface                            |
| ---------------------------------------------------------- | ---------------------------------------- |
| Final visual identity approval                             | OD-23 reopening                          |
| Legal clearance of the TALAMIR name and mark               | Legal                                    |
| Approved vision, mission and values text on the About page | OD-17                                    |
| Decision on public tagline use                             | OD-16 (currently blocked — see §4)       |
| Approved contact channels                                  | Owner                                    |
| Legal entity, registration details, footer legal line      | `talamir-legal-compliance`               |
| Approved product capability and availability copy          | `talamir-product-portfolio`              |
| Market/positioning content                                 | OD-22 reopening                          |
| **Manual screen-reader testing** (NVDA / JAWS / VoiceOver) | Accessibility                            |
| Third-party accessibility audit                            | Accessibility                            |
| Lifting `noindex` / `robots.txt`                           | Deliberate act tied to identity approval |

## 4. Specific owner-decision compliance

### OD-16 — Tagline (APPROVED, option T3)

The tagline is approved verbatim, **for internal design drafts only. Public use
remains blocked.**

**Compliance:** the approved tagline appears **nowhere** in this repository —
not in content, not in metadata, not in the hero, not in documentation. This is
deliberate. A corporate website is public-facing material, and the approval does
not extend to it. Verified by search.

### OD-17 — Vision, Mission & Values (APPROVED AS AMENDED)

Seven values adopted unchanged; vision and mission wording amended by the owner.

**Compliance:** this repository publishes **no** vision, mission, or values text.
The About page records them as required-and-pending. Publishing them requires
the amended OD-17 text verbatim from the governing record, not a paraphrase.
A crosswalk conflict (CF-01/02/03) is open between OD-17 and the corporate
foundation documents; this website must not adopt either wording until that is
resolved.

### OD-18 — SULTAN (APPROVED)

Controls 2–4: no readiness claim; _In Development_; _Demonstration Only_.

**Compliance:** `src/content/products.ts` renders exactly
`In Development — Demonstration Only` / `قيد التطوير — عرض توضيحي فقط`, at
`claimLevel: 'structural'`. No availability, pricing, or readiness claim exists.

### OD-21 — Website / Commercial Portal / product portals (APPROVED, option A)

Three independent surfaces. Control 4 requires a unified visual identity and a
clear transition experience.

**Compliance:** this repository implements the **corporate website only**. It
contains no portal authentication, no account surface, no commercial
transaction, and no portal code.

**Open dependency, recorded honestly:** OD-21 control 4 requires a _unified
visual identity_ across the surfaces. That cannot be satisfied while OD-23 is
deferred and no identity exists. The token architecture is the mechanism by
which it will be satisfiable — a single `BrandDefinition` can be shared across
surfaces — but **unification itself is REQUIRED BEFORE PUBLIC RELEASE**, not
achieved.

### OD-22 — Market and competitive research (APPROVED — DEFERRED)

**Compliance:** no segment, sizing, competitor, market, or research-backed
positioning claim appears anywhere. Enforced mechanically by
`scripts/check-claims.ts`, which fails the build on market-position and social-proof
language in Arabic and English. No content in this repository is offered as
market research, so the label `Internal Working Notes — Not Market Research` is
not applicable to any file here.

### OD-23 — Visual identity (APPROVED — DEFERRED, internal exploration permitted)

**Compliance:** no final logo, colour system, typography system, iconography, or
brand template is defined or claimed. What exists is an explicitly labelled
placeholder that the site itself announces via the placeholder ribbon on every
page. No icon library is used, because an icon set is an identity decision.

## 5. No route implies production or sales availability

Verified across all 23 route entrypoints / 41 prerendered pages:

- no pricing, plan, quote, checkout, trial, or purchase route exists;
- no "available", "buy", "get started", or "sign up" call to action exists;
- no product page asserts availability — both products are `structural`;
- draft Solutions and Industries `{slug}` pages are **not prerendered in
  production** and are unreachable there;
- the only calls to action route to `/contact`, which itself states that no
  contact channel has been approved;
- `Product` JSON-LD is **deliberately never emitted**, because it implies
  commercial availability.

## 6. Relationship to owner-decision records

This repository **does not contain** owner-decision records and **must not**
modify them. Their authoritative location is the corporate-foundation and
organization workspaces.

Two integrity notes carried over from the crosswalk, recorded so this repository
does not overstate its own basis:

- the crosswalk reports that **no authoritative OD-18 text and no authoritative
  OD-23 text were found on disk**; both are referenced through their crosswalk
  entries and dependent records;
- **two distinct OD numbering series exist** across the workspaces (an English
  corporate-foundation series and an Arabic series in another workstream). Every
  OD reference in this document is to the **corporate-foundation series** — the
  one whose OD-16/17/18/21/22/23 subjects match the governance instructions
  given to this repository.

If either point is resolved differently by the owner, this document — not the
owner record — is what changes.
