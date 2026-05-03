# SEO Session Report — 2026-04-16

## Summary

Automated SEO pass completed on the Togor & Tweed Next.js 14 codebase. 14 files modified across 7 improvement areas.

---

## 1. Brand Name Fix (Critical)

**Issue:** The brand was consistently misspelled as "Torgor & Tweed" (extra 'r') throughout the entire codebase.

**Files fixed (11 total):**
- `src/lib/constants.ts` — `SITE_NAME` corrected to `'Togor & Tweed'`
- `src/app/layout.tsx` — root metadata titles
- `src/app/(shop)/products/[slug]/page.tsx` — title, meta description, JSON-LD brand
- `src/app/(shop)/search/page.tsx` — page title
- `src/app/checkout/page.tsx` — page title
- `src/app/account/addresses/page.tsx`, `account/orders/page.tsx`, `account/orders/[orderId]/page.tsx`, `account/page.tsx`, `account/wishlist/page.tsx`
- `src/app/checkout/confirmation/[orderId]/page.tsx`, `checkout/payment/page.tsx`
- `src/app/og/route.tsx` — OG image default title
- `src/components/checkout/PaymentForm.tsx` — payment instructions
- `src/components/layout/Header/SearchBar.tsx` — fallback brand label
- `src/lib/resend.ts` — transactional email subjects and body

**Impact:** Correct brand identity in all titles, social shares, emails, and schema markup.

---

## 2. Root Layout Metadata Enrichment

**File:** `src/app/layout.tsx`

**Changes:**
- Expanded `keywords` array from 5 generic terms to 8 Bangladesh-specific terms: `fashion Bangladesh`, `clothing Dhaka`, `panjabi Bangladesh`, `men shirts Dhaka`, `affordable fashion Bangladesh`, `online fashion store Bangladesh`
- Updated `description` to include category keywords: shirts, panjabi, t-shirts, polo, trousers — free delivery hook
- Updated all OG and Twitter card titles/descriptions
- `template` updated to `'%s | Togor & Tweed'`

---

## 3. Image Alt Text Improvements

**Files changed:**
- `src/components/home/CategoryGrid.tsx`
  - Before: `alt={cat.name}` (e.g. "Men")
  - After: `alt={`Shop ${cat.name} collection at Togor & Tweed Bangladesh`}` (e.g. "Shop Men collection at Togor & Tweed Bangladesh")

- `src/components/product/ProductCard.tsx`
  - Before: `alt={name}`
  - After: `alt={`Buy ${name} - Togor & Tweed Bangladesh`}`

- `src/components/home/HeroBanner.tsx`
  - Before: `alt={panel.title}`
  - After: `alt={`${panel.title} — ${panel.label} | Togor & Tweed Bangladesh Fashion`}`

- `src/app/(shop)/collections/[slug]/page.tsx` — category banner image
  - Before: `alt={category.name}`
  - After: `alt={`Shop ${category.name} collection at Togor & Tweed Bangladesh`}`

**Impact:** All product and category images now carry descriptive, keyword-rich alt text for image search indexing.

---

## 4. noindex Added to Private Pages

**Files updated:**
- `src/app/(auth)/layout.tsx` — added `export const metadata: Metadata = { robots: { index: false, follow: false } }`
- `src/app/admin/layout.tsx` — same
- `src/app/account/layout.tsx` — same
- `src/app/checkout/layout.tsx` — same
- `src/app/(shop)/search/page.tsx` — `robots: { index: false, follow: true }`
- `src/app/checkout/page.tsx` — `robots: { index: false, follow: false }`

**Impact:** Search engines will not index login, register, admin, account, or checkout pages — eliminating duplicate/thin content from index and preventing accidental exposure of private pages.

---

## 5. Collections & Category Page Metadata

**`src/app/(shop)/collections/page.tsx`:**
- Expanded description to include product category keywords
- Added `keywords` array with 5 Bangladesh-specific terms
- Added `openGraph` and `twitter` card metadata

**`src/app/(shop)/collections/[slug]/page.tsx` — `generateMetadata`:**
- Richer description fallback: "Shop {Category} at Togor & Tweed — premium quality fashion from Bangladesh. Free delivery on orders over ৳2,000."
- OG image dynamically pulls `category.imageUrl` (when available)
- Twitter card with category image

---

## 6. robots.ts Fix

**File:** `src/app/robots.ts`

**Change:** Added `/admin` to the disallow list.

```
Before: disallow: ['/account', '/checkout', '/api/']
After:  disallow: ['/account', '/admin', '/checkout', '/api/']
```

**Impact:** Admin panel is now blocked from all crawlers.

---

## 7. WebSite Schema + Enhanced Organization Schema

**File:** `src/app/page.tsx`

**Changes:**
- Homepage `metadata.description` updated with keyword-rich copy and ৳2,000 free delivery hook
- Added `alternates.canonical` pointing to `https://togorandtweed.com`
- Added 8 keyword terms to homepage metadata
- Expanded `ORG_JSON_LD`: added `logo` and `facebook` sameAs
- Added new `WEBSITE_JSON_LD` block with `SearchAction` pointing to `/search?q={search_term_string}`
- Both schemas rendered via `<JsonLd>` in the homepage

**Impact:** Google can now discover the site's search functionality via Sitelinks Searchbox. Organization schema is richer for Knowledge Graph eligibility.

---

## Remaining SEO Opportunities (Future Sessions)

### High Priority
1. **Product page description fallback** — products with no `metaDesc` in DB get a generic description. Consider updating product seeding or admin UI to prompt for meta descriptions.
2. **ProductGallery thumbnail alt text** — `alt={img.altText ?? `${productName} ${i + 1}`}` is functional but could be more descriptive (e.g. include color/size if available).
3. **BreadcrumbList schema on product pages** — the product page has a visual breadcrumb nav but no `BreadcrumbList` JSON-LD. Add it alongside the existing Product schema.

### Medium Priority
4. **Google Search Console verification** — add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var and wire up `verification.google` in root layout metadata.
5. **Priority images on category pages** — the first product card image in a collection should have `priority={true}` for LCP improvement.
6. **Structured data for reviews** — product pages already include `aggregateRating` in JSON-LD when reviews exist. Verify this renders correctly in Google's Rich Results Test.
7. **Open Graph images** — `/og` dynamic route exists; wire OG images for collection and homepage using it.

### Low Priority
8. **Canonical tags on paginated collections** — `/collections?page=2` etc. should have `rel=canonical` pointing to `/collections` (or self-referencing with page param) to avoid thin content issues.
9. **hreflang** — if a Bengali (`bn`) language version is planned, add `alternates.languages` in metadata.
10. **Structured data for FAQPage** — add to a future `/faq` page for rich snippets.

---

## Analytics Status
- GA4 is wired in `layout.tsx` behind `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var — **set this in production `.env`**.
- No Google Search Console verification tag yet — add when domain is live.
- Facebook Pixel not yet implemented — add if retargeting ads are planned.
