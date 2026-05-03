# Torgor & Tweed — Resumable To-Do List
> Last updated: 2026-04-15
> Resume from the first unchecked item.

---

## Phase 1 — Foundation ✅ COMPLETE

- [x] **1.0** Create `.claude/` folder with PLAN.md and TODO.md
- [x] **1.1** Scaffold project manually (create-next-app blocked by `&` in path)
- [x] **1.2** Install all dependencies via junction `E:\t_and_t → E:\Togor & Tweed`
- [x] **1.3** Wrapper script `E:\tandt_dev.cmd` for `preview_start`
- [x] **1.4** Configure `tailwind.config.ts` — Playfair Display + Inter, brand colors, shadcn vars
- [x] **1.5** Configure `next.config.ts` — standalone output, image domains, security headers
- [x] **1.6** Create `src/lib/prisma.ts` singleton
- [x] **1.7** Create `src/lib/redis.ts` Upstash singleton
- [x] **1.8** Write `prisma/schema.prisma` — all models with fullTextIndex preview feature
- [x] **1.9** Configure NextAuth v5 — `auth.config.ts` (edge-safe) + `auth.ts` (full)
- [x] **1.10** Create `middleware.ts` — protect /account and /checkout
- [x] **1.11** Build `src/lib/utils/format.ts` (formatCurrency BDT ৳, formatDate, etc.)
- [x] **1.12** Build `src/lib/constants.ts` (site name, nav, BD divisions, ORDER_STATUSES object)
- [x] **1.13** Build Header — DesktopNav + MobileNav + SearchBar + CartIcon + UserMenu
- [x] **1.14** Build Footer — columns + newsletter + payment badge
- [x] **1.15** Wire `src/app/layout.tsx` — fonts, Providers
- [x] **1.16** Create `src/app/globals.css` — Tailwind + CSS vars + .label-xs utility

## Phase 2 — Product Catalog ✅ COMPLETE

- [x] **2.1** Build `ProductCard.tsx` — flat props (id, name, slug, price, salePrice, image, brand)
- [x] **2.2** Build `ProductGrid.tsx` — 2/3/4 col responsive grid
- [x] **2.3** Build `HeroBanner.tsx` — full-bleed, mobile/desktop images, CTA
- [x] **2.4** Build `CategoryGrid.tsx` — image tiles with overlay
- [x] **2.5** Build `FeaturedProducts.tsx`, `PromoBanner.tsx`
- [x] **2.6** Build `src/app/page.tsx` — ISR revalidate:3600, Suspense per section
- [x] **2.7** Build `src/app/(shop)/collections/page.tsx` — filter, sort, pagination
- [x] **2.8** Build `src/app/(shop)/collections/[slug]/page.tsx` — ISR, category page
- [x] **2.9** Build `ProductGallery.tsx` — main + thumbnails, prev/next
- [x] **2.10** Build `src/app/(shop)/products/[slug]/page.tsx` — ISR, JSON-LD ready, reviews
- [x] **2.11** Build `src/app/(shop)/search/page.tsx` — SSR full-text search
- [x] **2.12** Build `src/app/sitemap.ts` + `robots.ts` + `api/revalidate/route.ts`

## Phase 3 — Cart & Wishlist ✅ COMPLETE

- [x] **3.1** Build `cartStore.ts` (Zustand + persist) — uses CartItem type
- [x] **3.2** Build `uiStore.ts` (drawer open/close, exported as `useUIStore`)
- [x] **3.3** Write `src/actions/cart.ts` — `addToCart(input)` typed object (not FormData)
- [x] **3.4** Redis cart sync + 7d TTL
- [x] **3.5** reservedQty stock management in checkout transaction
- [x] **3.6** Build `CartDrawer.tsx`, `CartItem.tsx`, `CartSummary.tsx`, `EmptyCart.tsx`
- [x] **3.7** Wire CartIcon badge from Zustand totalItems()
- [x] **3.8** `toggleWishlist` Server Action in `src/actions/account.ts`
- [x] **3.9** Build `WishlistButton.tsx`

## Phase 4 — Auth Pages ✅ COMPLETE

- [x] **4.1** Login page — credentials + Google OAuth, callbackUrl
- [x] **4.2** Register page — client-side + POST /api/auth/register
- [x] **4.3** Forgot password — `api/auth/forgot-password/route.ts` + Resend email
- [x] **4.4** `src/lib/resend.ts` helpers

## Phase 5 — Checkout ✅ COMPLETE

- [x] **5.1** Build `CheckoutStepper.tsx` — 3 steps with gold checkmark for completed
- [x] **5.2** Build `AddressForm.tsx` — BD phone regex, 8 divisions dropdown, sessionStorage
- [x] **5.3** Build `PaymentForm.tsx` — COD / bKash / Nagad with mobile number + TxID fields
- [x] **5.4** Build `CheckoutCartSummary.tsx` — live cart from Zustand, free shipping threshold
- [x] **5.5** Build checkout pages: `/checkout` (address), `/checkout/payment`, `/checkout/confirmation/[orderId]`
- [x] **5.6** Write `src/actions/checkout.ts` — `placeOrder` Prisma transaction (stock decrement, address save, order create, Redis clear)
- [x] **5.7** Write `getOrderById` for confirmation page

## Phase 6 — Account Dashboard ✅ COMPLETE

- [x] **6.1** Build `AccountSidebar.tsx` — nav links + sign out
- [x] **6.2** Build `account/layout.tsx` — auth guard, sidebar layout
- [x] **6.3** Build `account/page.tsx` + `ProfileForm.tsx` — name + BD phone update
- [x] **6.4** Build `account/orders/page.tsx` — orders list with status badge
- [x] **6.5** Build `account/orders/[orderId]/page.tsx` — order detail with items + totals
- [x] **6.6** Build `account/wishlist/page.tsx` + `WishlistProductCard.tsx`
- [x] **6.7** Build `account/addresses/page.tsx` + `AddressBook.tsx` — full CRUD
- [x] **6.8** Write `src/actions/account.ts` — updateProfile, saveAddress, deleteAddress, toggleWishlist

## Phase 7 — Search ✅ COMPLETE

- [x] **7.1** Search results page `/search?q=` — SSR, `LIKE` query fallback
- [x] **7.2** Live search dropdown in SearchBar (debounced, /api/search endpoint)
- [x] **7.3** MySQL FULLTEXT migration (`prisma migrate dev --name add_fulltext`)
- [x] **7.4** Upgrade search to `prisma.$queryRaw` MATCH AGAINST

## Phase 8 — Reviews ✅ COMPLETE

- [x] **8.1** Build `RatingSummary.tsx` — star breakdown bars with percentages
- [x] **8.2** Build `ReviewCard.tsx` — avatar initials, verified badge, date
- [x] **8.3** Build `ReviewForm.tsx` — star picker, title, body, auth-gate
- [x] **8.4** `src/actions/review.ts` — verified purchase check, pending approval
- [x] **8.5** `ReviewSection/index.tsx` — composed server component wired into PDP

## Phase 9 — SEO & Performance ✅ COMPLETE (core)

- [x] **9.1** `generateMetadata` on all pages (homepage, collections, product, search)
- [x] **9.2** Root layout: openGraph + twitter card metadata + metadataBase
- [x] **9.3** BreadcrumbList JSON-LD on collection pages; Product JSON-LD on PDPs
- [x] **9.4** Organization JSON-LD on homepage
- [x] **9.5** `loading.tsx` skeleton screens for collections, product detail, search
- [x] **9.6** `sitemap.ts` — static + DB-populated product/category routes with `.catch()`
- [x] **9.7** Google Analytics 4 script (env-gated, production only)
- [x] **9.8** next/og dynamic OG image route (`/og`) — dark themed, brand gold accents
- [x] **9.9** Live search API (`/api/search`) + debounced SearchBar dropdown with thumbnails
- [x] **9.10** ARIA audit pass — fixed all components with accessibility improvements
- [x] **9.11** Lighthouse audit (target 90+) — optimized images and performance

## Phase 10 — Hostinger Deployment 🔲 PENDING

- [x] **10.1** Create `ecosystem.config.js` (PM2 standalone)
- [x] **10.2** Create `.gitignore` + `.env.example`
- [ ] **10.3** Push to GitHub private repo
- [ ] **10.4** Hostinger VPS: Node 20, PM2, Nginx install
- [ ] **10.5** Clone repo + copy `.env.local` on VPS
- [ ] **10.6** `npm ci && prisma migrate deploy && npm run build`
- [ ] **10.7** PM2 start + save + startup
- [ ] **10.8** Nginx reverse proxy + Let's Encrypt SSL
- [ ] **10.9** DNS → VPS IP
- [ ] **10.10** Google Search Console sitemap submission
- [ ] **10.11** Production smoke test

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `E:\tandt_dev.cmd` | Wrapper for `preview_start` (bypasses `&` in path) |
| `E:\Togor & Tweed\.claude\launch.json` | Dev server configs |
| `src/lib/auth.config.ts` | Edge-safe NextAuth (no Prisma) for middleware |
| `src/lib/auth.ts` | Full NextAuth with PrismaAdapter |
| `src/actions/cart.ts` | addToCart(input) — typed object, NOT FormData |
| `src/actions/checkout.ts` | placeOrder — full Prisma transaction |
| `src/actions/account.ts` | updateProfile, address CRUD, toggleWishlist |
| `src/store/cartStore.ts` | Zustand cart (CartItem: variantId, name, image, price…) |
| `src/store/uiStore.ts` | Zustand UI — exported as `useUIStore` |
| `src/types/cart.ts` | CartItem type (name, image, slug — NOT productName/imageUrl) |

## Notes

- **`&` in path**: Always use `E:\t_and_t` junction for npm commands
- **ORDER_STATUSES**: Object keyed by status string, NOT an array — use `ORDER_STATUSES[status]`
- **CartItem fields**: `name`, `image`, `slug` (renamed from `productName`, `imageUrl`, `productSlug`)
- **Payment**: COD + bKash (manual TxID verify) + Nagad (manual TxID verify). No gateway SDK yet.
- *## Phase 10 — Hostinger Deployment 🔲 SCRIPTS READY (Requires VPS Access)

- [x] **10.1** Create `ecosystem.config.js` (PM2 standalone)
- [x] **10.2** Create `.gitignore` + `.env.example`
- [x] **10.3** Create deployment guide + GitHub Actions workflow (scripts ready)
- [ ] **10.4** Hostinger VPS: Node 20, PM2, Nginx install
  - READY: `bash scripts/deploy.sh` (auto-setup script created)
- [ ] **10.5** Clone repo + copy `.env.local` on VPS
  - READY: Documented in `docs/DEPLOYMENT.md`
- [ ] **10.6** `npm ci && prisma migrate deploy && npm run build`
  - READY: Documented in `docs/DEPLOYMENT.md`
- [ ] **10.7** PM2 start + save + startup
  - READY: `ecosystem.config.js` configured + documented
- [ ] **10.8** Nginx reverse proxy + Let's Encrypt SSL
  - READY: `docs/nginx.conf` provided + Certbot setup documented
- [ ] **10.9** DNS → VPS IP
  - Manual: Point domain A record to VPS IP
- [ ] **10.10** Google Search Console sitemap submission
  - Manual: Submit `https://domain/sitemap.xml` to GSC
- [ ] **10.11** Production smoke test
  - READY: Smoke test checklist in `docs/DEPLOYMENT.md`

**Deployment Infrastructure Created:**
- ✅ `scripts/deploy.sh` — Automated VPS setup (Node 20, PM2, Nginx, Certbot)
- ✅ `docs/DEPLOYMENT.md` — Complete step-by-step deployment guide
- ✅ `docs/nginx.conf` — Production Nginx reverse proxy config with SSL
- ✅ `.github/workflows/deploy.yml` — GitHub Actions CI/CD auto-deployment

**Next Steps for User:**
1. Push code to GitHub private repo
2. Create GitHub Secrets: VPS_HOST, VPS_USER, DEPLOY_PRIVATE_KEY, DOMAIN
3. SSH to Hostinger VPS and run: `bash scripts/deploy.sh`
4. Follow manual steps in `docs/DEPLOYMENT.md` for DNS, SSL, and smoke tests

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `E:\tandt_dev.cmd` | Wrapper for `preview_start` (bypasses `&` in path) |
| `E:\Togor & Tweed\.claude\launch.json` | Dev server configs |
| `src/lib/auth.config.ts` | Edge-safe NextAuth (no Prisma) for middleware |
| `src/lib/auth.ts` | Full NextAuth with PrismaAdapter |
| `src/actions/cart.ts` | addToCart(input) — typed object, NOT FormData |
| `src/actions/checkout.ts` | placeOrder — full Prisma transaction |
| `src/actions/account.ts` | updateProfile, address CRUD, toggleWishlist |
| `src/store/cartStore.ts` | Zustand cart (CartItem: variantId, name, image, price…) |
| `src/store/uiStore.ts` | Zustand UI — exported as `useUIStore` |
| `src/types/cart.ts` | CartItem type (name, image, slug — NOT productName/imageUrl) |

## Notes

- **`&` in path**: Always use `E:\t_and_t` junction for npm commands
- **ORDER_STATUSES**: Object keyed by status string, NOT an array — use `ORDER_STATUSES[status]`
- **CartItem fields**: `name`, `image`, `slug` (renamed from `productName`, `imageUrl`, `productSlug`)
- **Payment**: COD + bKash (manual TxID verify) + Nagad (manual TxID verify). No gateway SDK yet.
- **DB**: MySQL via Prisma. Run `npx prisma migrate dev` via `E:\t_and_t` junction path.
