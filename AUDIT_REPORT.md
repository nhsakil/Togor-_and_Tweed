# Togor & Tweed — Functionality Audit Report
**Date:** April 17, 2026  
**Auditor:** Senior Dev Agent (automated session)  
**Reference:** snitch.com (competitor benchmark)

---

## Summary

This report documents the full functionality audit of the Togor & Tweed (T&T) Next.js storefront compared against the snitch.com benchmark, the bugs fixed, features implemented, and outstanding items.

---

## Fixes Completed This Session

### 1. CollectionSidebar — Fixed-Position Scroll Behavior
**Status:** ✅ Fixed

**Problem:** The sidebar used `sticky top-[88px]` which did not account for the full 128px header stack (32px announcement bar + 56px desktop nav + 40px category strip). It also relied on sticky positioning which requires specific parent overflow behaviour.

**Fix:** Rewrote `src/components/collection/CollectionSidebar.tsx` using `position: fixed` with `top: 128px` and `height: calc(100vh - 128px)`, matching the Snitch.com pattern exactly. An invisible flex spacer div (`w-64`) maintains layout flow. Added `role="dialog"` + `aria-modal="true"` to the mobile drawer, `aria-expanded` to all accordion buttons, and replaced the `onChange → window.location.href` price filter with a `useRef` + Apply button pattern.

---

### 2. Google OAuth Sign-In
**Status:** ✅ Fixed

**Problem:** `Google({ clientId: process.env.GOOGLE_CLIENT_ID! })` — the non-null assertion does not prevent a runtime crash when the env var is absent. NextAuth threw on startup in environments where Google credentials weren't configured.

**Fix:** Applied conditional provider array pattern to both `src/lib/auth.ts` and `src/lib/auth.config.ts`:
```typescript
const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [Google({ ... })]
    : []
```
Added `NEXT_PUBLIC_GOOGLE_ENABLED=true` gate on the login page button. Full setup instructions added to `.env.local`.

---

### 3. Featured Category Slugs
**Status:** ✅ Fixed

**Problem:** `prisma/seed.ts` created categories with slugs like `mens-clothing`, `womens-clothing`, `accessories` — none of which matched the `PRODUCT_CATEGORY_LINKS` slugs (`shirts`, `panjabi`, `t-shirt`, `polo`, `trousers`). Every category page link was a 404.

**Fix:** Rewrote the seed to use the correct 5 slugs, added 10 Bangladesh-appropriate products (2 per category) with BDT pricing, and exported `FEATURED_CATEGORY_SLUGS` constant from `src/lib/constants.ts`.

---

### 4. Seven Missing Static Pages
**Status:** ✅ Fixed

All seven footer links were 404. Pages created under `src/app/(shop)/` so they inherit the Header/Footer layout:

| Route | Page |
|---|---|
| `/about` | Brand story, philosophy, Made in Bangladesh |
| `/contact` | Contact form + office info + business hours |
| `/faq` | Accordion FAQ across 4 sections (Orders, Returns, Payments, Products) |
| `/shipping` | Delivery table by division, charges, return policy, exchange process |
| `/size-guide` | Measurement tables for Tops, Panjabi, and Trousers |
| `/privacy` | Full privacy policy (10 sections, GDPR-style) |
| `/terms` | Terms & conditions (13 sections, Bangladesh law) |

---

### 5. Coupon / Promo Code System
**Status:** ✅ Implemented

**Gap:** The `Order` schema had `couponCode` and `discountAmount` fields but no UI, no validation logic, and no `Coupon` model.

**Implementation:**
- **`prisma/schema.prisma`** — Added `Coupon` model with `code`, `discountType` (percentage/fixed), `discountValue`, `minOrderAmount`, `maxDiscount`, `usageLimit`, `usageCount`, `isActive`, `expiresAt`
- **`prisma/migrations/20260417_add_coupons/migration.sql`** — MySQL DDL ready to apply via `npx prisma migrate dev`
- **`src/actions/coupon.ts`** — `validateCoupon(code, subtotal)` server action with full validation (expiry, usage limit, minimum order, percentage cap)
- **`src/components/checkout/CheckoutCartSummary.tsx`** — Coupon input with Apply button, applied coupon chip with remove ×, live discount line in price breakdown, `getAppliedCoupon()` module export for PaymentForm access
- **`src/actions/checkout.ts`** — `PlaceOrderInput` extended with `couponCode?` and `discountAmount?`; both saved to the order record
- **`src/components/checkout/PaymentForm.tsx`** — Reads `getAppliedCoupon()` and passes coupon data to `placeOrder`; total calculation accounts for discount
- **`src/app/admin/coupons/page.tsx`** — Admin page (server component, fetches all coupons)
- **`src/components/admin/CouponManager.tsx`** — Full CRUD UI: create, edit, toggle active/inactive, delete
- **`src/actions/admin-coupons.ts`** — `createCoupon`, `updateCoupon`, `toggleCouponActive`, `deleteCoupon` server actions (admin-only)
- **`src/components/admin/AdminSidebar.tsx`** — Added "Coupons" nav item

**To activate:** Run `npx prisma migrate dev` (or `npx prisma db push`) then create coupons via `/admin/coupons`.

---

### 6. Duplicate Account Route Conflict
**Status:** ✅ Resolved (no action needed)

**Finding:** The `src/app/(account)/account/` route group directories existed as empty shell folders (no `page.tsx`, `layout.tsx`, or `route.ts` files inside). Next.js only registers routes where a `page.tsx` exists, so these empty directories caused zero routing conflicts.

The actual account pages are cleanly in `src/app/account/` and the `(account)` group directories are inert scaffolding. The empty directories could not be deleted (filesystem permission restriction in the sandbox) but pose no functional issue.

---

## Outstanding Gaps vs. snitch.com

These were identified in the audit but are out of scope for this session:

| Feature | Gap | Priority |
|---|---|---|
| **Product Reviews** | Schema + DB tables exist (`Review` model). No UI for submitting reviews on product pages, no display of star ratings/count. | High |
| **Wishlist "Add" button** | Wishlist DB table exists. Product card has a heart icon but no wired-up add/remove action. | High |
| **Recently Viewed** | Snitch shows a "Recently Viewed" section. Not implemented. | Medium |
| **Stock notification ("Notify Me")** | Referenced in FAQ but not implemented. | Medium |
| **Search autocomplete** | `SearchBar` shows results but no category filters or keyboard navigation. | Medium |
| **Order tracking page** | Orders show status in account but no visual timeline (confirmed → processing → shipped → delivered). | Low |
| **Social proof / UGC** | Snitch displays Instagram feed + review counts prominently. | Low |
| **bKash / Nagad live integration** | Payment fields exist but gateway API calls are stubbed. `BKASH_APP_KEY` etc. in `.env.local` are blank. | Depends on launch |
| **Contact form email delivery** | Contact form POSTs to a `setTimeout` mock. Needs `/api/contact` route + Resend wiring. | Low |

---

## How to Apply the Database Migration

```bash
# In the project root:
npx prisma migrate dev --name add_coupons
# OR for a quick push without migration history:
npx prisma db push
```

Then re-seed if needed:
```bash
npx prisma db seed
```

---

## Agent Assignments

| Task | Agent |
|---|---|
| Implement product reviews (UI + API) | Dev Agent |
| Wire wishlist add/remove on product cards | Dev Agent |
| Implement `/api/contact` with Resend | Dev Agent |
| bKash / Nagad live gateway integration | Dev Agent (when keys available) |
| SEO metadata for all new static pages | SEO Agent |
| SEO structured data (breadcrumbs, product schema) | SEO Agent |
| Size guide & FAQ page SEO content | SEO Agent |
