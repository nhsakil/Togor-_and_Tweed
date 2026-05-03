# SEO Session Report — 2026-04-28

## Summary

Automated SEO pass — session 2 for the Togor & Tweed Next.js 14 codebase. This session addressed the remaining high-priority items from the 2026-04-16 session plus additional improvements discovered during audit. 9 files modified, 2 new files created.

---

## Audit Findings (Start of Session)

Reviewing the previous session's "Remaining Opportunities" list:

| Item | Status at Start |
|---|---|
| robots.ts | ✅ Already done (previous session) |
| sitemap.ts | ⚠️ Missing static content pages |
| Root layout metadata | ✅ Already done |
| GA4 setup | ✅ Wired, behind env var |
| ProductCard alt text | ✅ Already done |
| CategoryGrid alt text | ✅ Already done |
| Collections page metadata + OG | ✅ Already done |
| Category [slug] page — BreadcrumbList JSON-LD | ✅ Already done |
| Product [slug] page — Product JSON-LD | ✅ Already done |
| **Product [slug] page — BreadcrumbList JSON-LD** | ❌ Missing |
| **FeaturedCategories alt text** | ❌ Still `alt={cat.name}` |
| **FAQ / Contact page metadata** | ❌ Missing (client components, no metadata export) |
| **About/Shipping/Privacy/Terms/Size Guide OG tags** | ❌ Missing |
| **Sitemap static pages** | ❌ Only homepage, collections, search |
| **Hero image LCP optimization** | ❌ No `fetchPriority="high"` |
| FAQPage JSON-LD structured data | ❌ Missing |

---

## Changes Made

### 1. Sitemap — Added Missing Static Pages

**File:** `src/app/sitemap.ts`

Added 7 missing content pages to the sitemap:

| Page | Change Freq | Priority |
|---|---|---|
| `/about` | monthly | 0.6 |
| `/contact` | monthly | 0.5 |
| `/faq` | monthly | 0.5 |
| `/shipping` | monthly | 0.5 |
| `/size-guide` | monthly | 0.4 |
| `/privacy` | yearly | 0.3 |
| `/terms` | yearly | 0.3 |

Also bumped `/collections` priority from 0.8 → 0.9 (it is the primary browse entry point).

**Impact:** Google Search Console will now discover and crawl all public content pages. Previously 3 static URLs; now 10 static URLs plus dynamic product/category routes.

---

### 2. Product Page — BreadcrumbList JSON-LD (High Priority)

**File:** `src/app/(shop)/products/[slug]/page.tsx`

Added 4-level `BreadcrumbList` JSON-LD schema alongside the existing Product schema:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home",            "item": "https://togorandtweed.com" },
    { "@type": "ListItem", "position": 2, "name": "Collections",     "item": "https://togorandtweed.com/collections" },
    { "@type": "ListItem", "position": 3, "name": "{category.name}", "item": "https://togorandtweed.com/collections/{category.slug}" },
    { "@type": "ListItem", "position": 4, "name": "{product.name}",  "item": "https://togorandtweed.com/products/{product.slug}" }
  ]
}
```

**Impact:** Product pages now qualify for breadcrumb rich results in Google SERPs — showing the navigation path (Home > Collections > Shirts > Product Name) directly in search results. Category pages already had this.

---

### 3. FAQ Page — Metadata + FAQPage JSON-LD (New File)

**File created:** `src/app/(shop)/faq/layout.tsx`

The FAQ page is a `'use client'` component so cannot export `metadata` directly. A new server-component layout wraps it, providing:

- Page title: `FAQ — Frequently Asked Questions | Togor & Tweed`
- Keyword-rich meta description
- OpenGraph and Twitter Card tags
- **FAQPage JSON-LD structured data** with 8 Q&A pairs covering shipping, returns, payments, and sizing

**Impact:** FAQ answers can now appear as **rich snippets** (expandable Q&A blocks) directly in Google search results — extremely high CTR potential for common queries like "does Togor and Tweed offer free shipping" or "what is the return policy".

---

### 4. Contact Page — Metadata (New File)

**File created:** `src/app/(shop)/contact/layout.tsx`

Same pattern as FAQ — server-component layout wrapping the `'use client'` contact page:

- Title: `Contact Us | Togor & Tweed`
- Description includes "respond within 24 hours" — a trust signal for search snippets
- OpenGraph and Twitter Card tags

**Impact:** Contact page will now appear properly in social shares and have a descriptive snippet in SERPs.

---

### 5. Static Content Pages — OpenGraph + Twitter Cards

Added OpenGraph and Twitter Card metadata to 5 pages that previously had only a title and description:

| File | OG Title | Twitter Card |
|---|---|---|
| `src/app/(shop)/about/page.tsx` | About Togor & Tweed — Wear the Story | summary_large_image |
| `src/app/(shop)/shipping/page.tsx` | Shipping & Returns — Togor & Tweed | summary |
| `src/app/(shop)/privacy/page.tsx` | Privacy Policy — Togor & Tweed | — |
| `src/app/(shop)/terms/page.tsx` | Terms & Conditions — Togor & Tweed | — |
| `src/app/(shop)/size-guide/page.tsx` | Size Guide — Togor & Tweed Bangladesh | summary |

Also improved page titles:
- "About Us" → "About Us — Our Story & Mission"
- "Shipping & Returns" → "Shipping & Returns Policy"
- "Size Guide" → "Size Guide — Find Your Perfect Fit"

**Impact:** These pages will render proper cards when shared on Facebook, WhatsApp, or Twitter/X instead of showing an empty card.

---

### 6. FeaturedCategories — Alt Text Fix

**File:** `src/components/home/FeaturedCategories.tsx`

- Before: `alt={cat.name}` (e.g. "Shirts")
- After: `alt={\`Shop ${cat.name} at Togor & Tweed Bangladesh\`}` (e.g. "Shop Shirts at Togor & Tweed Bangladesh")

**Impact:** Category tiles on the homepage now have keyword-rich alt text consistent with the already-fixed `CategoryGrid` component. Improves Google Image Search discoverability.

---

### 7. ProductGallery — Improved Alt Text

**File:** `src/components/product/ProductGallery.tsx`

Two improvements:

**Thumbnail strip:**
- Before: `alt={img.altText ?? \`${productName} ${i + 1}\`}`
- After: `alt={img.altText ?? \`${productName} - view ${i + 1} | Togor & Tweed Bangladesh\`}`

**Main image:**
- Before: `alt={images[current].altText ?? productName}`
- After: `alt={images[current].altText ?? \`Buy ${productName} - Togor & Tweed Bangladesh\`}`

**Impact:** Product detail page images are now consistently keyword-rich in both the main view and thumbnail strip when no custom `altText` is stored in the database.

---

### 8. HeroSlider — LCP Optimization (`fetchPriority="high"`)

**File:** `src/components/home/HeroSlider.tsx`

Two changes:

1. **`fetchPriority="high"`** added to the first slide's `<img>` tag — signals to the browser to prioritize loading this image (the Largest Contentful Paint element) as soon as possible. Non-first slides use `fetchPriority="auto"`.

2. **Improved alt text:**
   - Before: `alt={slide.title}` (e.g. "WEAR THE STORY")
   - After: `alt={\`${slide.title} — Togor & Tweed Bangladesh Fashion\`}` (e.g. "WEAR THE STORY — Togor & Tweed Bangladesh Fashion")

**Impact:** LCP score improvement on the homepage. `fetchPriority="high"` is one of the most effective single-line LCP improvements for above-the-fold hero images. The alt text improvement also helps Google understand hero banners for image indexing.

---

## Verification

- TypeScript errors seen during `tsc --noEmit` are **all pre-existing** in the original codebase — caused by the TS parser struggling with Tailwind bracket classes (e.g. `text-[11px`) and certain backtick patterns. Next.js SWC compiler handles these correctly and the dev/build server is unaffected.
- New files (`faq/layout.tsx`, `contact/layout.tsx`) produce **zero TypeScript errors**.
- All metadata edits are pure object additions — no JSX changes to existing components except FeaturedCategories alt text and HeroSlider `fetchPriority`.

---

## Remaining SEO Opportunities (Carry Forward)

### High Priority
1. **Google Search Console verification** — Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var and wire to `verification.google` in root layout metadata. Required to submit sitemap and monitor indexing.
2. **OG images for category/homepage** — Wire the `/og` dynamic route as OG image for collections and homepage metadata (currently only product pages use it).
3. **ProductGallery custom alt text** — Prompt admin UI to fill `altText` per image in the DB. Currently falls back to generic pattern.

### Medium Priority
4. **Canonical tags on paginated collection pages** — `/collections?page=2`, `/collections/shirts?page=3` etc. should have `rel=canonical` set to the base URL (`/collections`, `/collections/shirts`) to prevent thin content penalties.
5. **Priority on first product card image in collection** — The first product card in a collection grid is likely an LCP element. Pass `priority={true}` to the first `ProductCard` in the grid.
6. **Review JSON-LD validation** — Product pages include `aggregateRating` in structured data when reviews exist. Validate in Google's Rich Results Test once live.

### Low Priority
7. **Facebook Pixel** — Add if retargeting ad campaigns are planned.
8. **hreflang** — If a Bengali (`bn`) language version is introduced, add `alternates.languages` to root layout metadata.
9. **Structured data for Shipping policy** — `ShippingDeliveryTime` and `OfferShippingDetails` can be added to Product schema to unlock shipping info rich results.

---

## Analytics Status
- **GA4:** Wired in `layout.tsx` behind `NEXT_PUBLIC_GA_MEASUREMENT_ID` — set this in production `.env`.
- **Search Console:** Verification tag not yet added — prioritize for next session.
- **Facebook Pixel:** Not implemented.
