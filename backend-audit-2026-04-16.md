# Backend Audit Report — 2026-04-16

**Project:** Torgor & Tweed (Next.js 14, Prisma, MySQL, NextAuth v5, Upstash Redis)  
**Agent:** Backend Developer Agent (automated scheduled run)

---

## Bugs Fixed This Run

### 1. `revalidateTag` called with wrong number of arguments
**File:** `src/app/api/revalidate/route.ts`  
**Problem:** `revalidateTag(tag, 'layout')` — Next.js's `revalidateTag` accepts only one argument. The extra `'layout'` parameter caused a TypeScript error and would have been silently ignored at runtime.  
**Fix:** Changed to `revalidateTag(tag)`.

---

### 2. `err: any` in `placeOrder` catch block
**File:** `src/actions/checkout.ts`  
**Problem:** `catch (err: any)` violates the project TypeScript rule of no `any`. The error message was also extracted unsafely.  
**Fix:** Changed to `catch (err: unknown)` with proper `err instanceof Error ? err.message : 'Failed to place order'` type narrowing.

---

### 3. `(products as any[])` cast in search route
**File:** `src/app/api/search/route.ts`  
**Problem:** The `RawProduct` interface was already defined in the same scope, but the final `.map()` cast to `any[]` instead of using it.  
**Fix:** Removed the cast — `products` is already typed as `RawProduct[]`.

---

### 4. `updateCartItemQuantity` not adjusting `reservedQty`
**File:** `src/actions/cart.ts`  
**Problem (critical):** When a user changed the quantity of an existing cart item, the `ProductVariant.reservedQty` was never updated. This caused reserved stock to drift from actual cart quantities — users could over-reserve stock by repeatedly adding items or see phantom availability.  
**Fix:** The function now:
- Reads the existing quantity before updating.
- Calculates `delta = newQuantity - existingQuantity`.
- When increasing: validates available stock for the delta, returns a descriptive error if insufficient.
- Applies `reservedQty: { increment: delta }` (works correctly for both positive/negative deltas) to keep the variant's reservation in sync.

---

### 5. `addToCart` existing-item branch not updating `reservedQty`
**File:** `src/actions/cart.ts`  
**Problem:** When adding more quantity to an item already in the cart, `reservedQty` was only incremented in the new-item branch, not the existing-item branch.  
**Fix:** Both branches now increment `reservedQty` by the requested `quantity`.

---

### 6. Order confirmation email never sent
**File:** `src/actions/checkout.ts`  
**Problem:** `sendOrderConfirmation` was defined in `src/lib/resend.ts` but was never called anywhere. Customers received no confirmation email after placing an order.  
**Fix:**
- Imported `sendOrderConfirmation` in `checkout.ts`.
- Modified the `$transaction` to also return `emailItems` (built from `variantDetails` which is only in transaction scope).
- After the transaction and Redis clear, dispatches a fire-and-forget email to `session.user.email` with the order number, total (in BDT ৳), and line items.

---

### 7. Missing `/reset-password` page and API route (critical)
**Problem:** `src/app/api/auth/forgot-password/route.ts` generates reset links pointing to `/reset-password?token=...&email=...`, but neither the page nor the API handler existed. The password reset flow was fully broken — users would receive emails with dead links.  
**New files created:**

- **`src/app/api/auth/reset-password/route.ts`** — POST handler that:
  - Validates `token`, `email`, `password`, `confirmPassword` with `resetPasswordSchema` (already defined in `src/lib/validations/auth.ts`).
  - Looks up the `VerificationToken` record by `identifier` (email) and `token`.
  - Checks expiry (1-hour window set by the forgot-password route).
  - Hashes the new password with bcrypt (cost 12) and updates `User.passwordHash`.
  - Deletes the used token to prevent reuse.

- **`src/app/(auth)/reset-password/page.tsx`** — Client-side page that:
  - Reads `token` and `email` from URL search params.
  - Shows an error if either param is missing (invalid link).
  - Validates the new password client-side (length, uppercase, number, confirm match) before submitting to the API.
  - Shows a success state with auto-redirect to `/login` after 3 seconds.
  - Wraps `useSearchParams` in `<Suspense>` as required for Next.js app router.

---

## Pending Items (No Action Taken This Run)

### FULLTEXT Migration
The migration SQL at `prisma/migrations/add_fulltext/migration.sql` has not been applied to the live DB. The search route has a working LIKE fallback, so this is non-critical but should be applied for production performance:
```bash
cd E:\t_and_t && npx prisma migrate dev --name add_fulltext
```

### `src/app/(auth)/layout.tsx`
Not reviewed this run — should ensure it does not redirect already-authenticated users away from `/reset-password` (the `authConfig.callbacks.authorized` currently redirects logged-in users from auth routes to `/account`, which could block a logged-in user from resetting their password). Consider exempting `/reset-password` from the redirect.

### Admin role check in middleware
`auth.config.ts` allows any logged-in user through to `/admin/*` and defers the ADMIN role check to the layout server component. This is acceptable but means an unauthorized logged-in user hits the layout before being rejected — consider adding the role check in the `authorized` callback for tighter security.

### `reservedQty` drift on session expiry
If a user abandons a cart without checking out, `reservedQty` never decrements. A cron/scheduled cleanup job that decrements `reservedQty` for expired `Cart` records would prevent long-term stock staleness.

---

## Environment Variables Required
All required vars appear to be present in `.env.local` per the skill description:
- `DATABASE_URL`
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL`
- `NEXTAUTH_URL` / `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `REVALIDATION_SECRET`

No new env vars were introduced this run.
