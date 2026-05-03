/**
 * TC-021 Navigation
 * TC-022 Mobile Responsiveness
 * TC-023 Tablet Responsiveness
 * TC-024 Accessibility – Keyboard Navigation
 * TC-025 Accessibility – Alt Text
 * TC-026 Form Validation
 * TC-027 Error Handling
 * TC-028 Multi-language Support (NOT PLANNED — documented here)
 */
import { test, expect } from '@playwright/test';

test.describe('UI / UX', () => {

  // TC-021 ─────────────────────────────────────────────────────────────────
  test('TC-021 | Navigation — all top-level links reachable', async ({ page }) => {
    await page.goto('/');
    const navLinks = page.locator('nav a');
    const hrefs = await navLinks.evaluateAll(els => els.map(e => (e as HTMLAnchorElement).href));
    expect(hrefs.length).toBeGreaterThan(0);

    // Verify each nav link returns 200
    for (const href of hrefs.slice(0, 8)) {
      const res = await page.request.get(href);
      expect(res.status(), `Nav link ${href} returned ${res.status()}`).toBeLessThan(400);
    }
  });

  test('TC-021b | Navigation — logo leads back to homepage', async ({ page }) => {
    await page.goto('/products');
    await page.click('[data-testid="site-logo"]');
    await expect(page).toHaveURL('/');
  });

  test('TC-021c | Navigation — footer links present', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').scrollIntoViewIfNeeded();
    const footerLinks = page.locator('footer a');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(4);
  });

  // TC-022 ─────────────────────────────────────────────────────────────────
  test('TC-022 | Mobile Responsiveness — 390px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    await page.goto('/');

    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390 + 2); // 2px tolerance

    // Mobile nav (hamburger) visible, desktop nav hidden
    await expect(page.locator('[data-testid="mobile-menu-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();

    // Product grid stacks to 1 or 2 columns
    const card = page.locator('[data-testid="product-card"]').first();
    await page.goto('/products');
    await card.waitFor();
    const cardWidth = await card.evaluate(el => el.getBoundingClientRect().width);
    expect(cardWidth).toBeLessThanOrEqual(200); // stacked layout
  });

  // TC-023 ─────────────────────────────────────────────────────────────────
  test('TC-023 | Tablet Responsiveness — 768px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(768 + 2);

    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    const cards = await page.locator('[data-testid="product-card"]').count();
    expect(cards).toBeGreaterThan(0);
  });

  // TC-024 ─────────────────────────────────────────────────────────────────
  test('TC-024 | Accessibility – Keyboard Navigation', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');
    const focused1 = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A','BUTTON','INPUT','SELECT','TEXTAREA']).toContain(focused1);

    // Tab through several elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Check focus is visible (not trapped)
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return el ? el.tagName : 'BODY';
    });
    expect(focused).not.toBe('BODY');
  });

  test('TC-024b | Keyboard — modal can be closed with Escape', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="search-btn"]');
    await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="search-modal"]')).not.toBeVisible();
  });

  test('TC-024c | Keyboard — cart drawer focusable', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    // Tab until cart icon is focused, then activate
    let found = false;
    for (let i = 0; i < 20; i++) {
      const tag = await page.evaluate(() => (document.activeElement as HTMLElement)?.getAttribute('data-testid'));
      if (tag === 'cart-icon') { found = true; break; }
      await page.keyboard.press('Tab');
    }
    if (found) {
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    }
  });

  // TC-025 ─────────────────────────────────────────────────────────────────
  test('TC-025 | Alt Text — all product images have non-empty alt', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');

    const images = await page.locator('[data-testid="product-card"] img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt, 'Image missing alt attribute').not.toBeNull();
      expect(alt!.trim(), 'Image has empty alt text').not.toBe('');
    }
  });

  test('TC-025b | Alt Text — PDP images all have alt text', async ({ page }) => {
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.waitForSelector('[data-testid="product-images"]');

    const images = await page.locator('[data-testid="product-images"] img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
      expect(alt!.trim()).not.toBe('');
    }
  });

  // TC-026 ─────────────────────────────────────────────────────────────────
  test('TC-026 | Form Validation — registration empty submit', async ({ page }) => {
    await page.goto('/auth/register');
    await page.click('[type="submit"]');

    const errors = page.locator('[data-testid^="field-error"]');
    expect(await errors.count()).toBeGreaterThan(0);
  });

  test('TC-026b | Form Validation — checkout empty submit', async ({ page }) => {
    await page.goto('/checkout');
    const placeBtn = page.locator('[data-testid="place-order-btn"]');
    if (await placeBtn.isVisible()) {
      await placeBtn.click();
      const errors = page.locator('[data-testid^="field-error"]');
      expect(await errors.count()).toBeGreaterThan(0);
    }
  });

  test('TC-026c | Form Validation — invalid email format rejected', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('[name="email"]', 'not-an-email');
    await page.click('[type="submit"]');
    await expect(page.locator('[data-testid="field-error-email"]')).toBeVisible();
  });

  // TC-027 ─────────────────────────────────────────────────────────────────
  test('TC-027 | Error Handling — invalid coupon shows clear error', async ({ page }) => {
    await page.goto('/checkout');
    await page.fill('[data-testid="coupon-input"]', 'BADCODE');
    await page.click('[data-testid="apply-coupon-btn"]');
    await expect(page.locator('[data-testid="coupon-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="coupon-error"]')).toContainText(/invalid|not.*valid/i);
  });

  test('TC-027b | Error Handling — 404 page shown for bad URLs', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist-xyz');
    expect(res?.status()).toBe(404);
    await expect(page.locator('[data-testid="not-found-heading"]')).toBeVisible();
  });

  test('TC-027c | Error Handling — out-of-stock product shows correct state', async ({ page }) => {
    // If a product is out of stock, Add to Cart should be disabled
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');

    const outOfStockCard = page.locator('[data-testid="product-card"][data-out-of-stock="true"]').first();
    const exists = await outOfStockCard.count();

    if (exists > 0) {
      const addBtn = outOfStockCard.locator('[data-testid="add-to-cart-btn"]');
      await expect(addBtn).toBeDisabled();
    }
  });

  // TC-028 — NOT PLANNED ────────────────────────────────────────────────────
  test.skip('TC-028 | Multi-language Support — NOT IN SCOPE', async () => {
    // Target market: Bangladesh (Bengali + English)
    // Multi-language toggle not planned in PLAN.md Phase 1–10
    // Revisit if international expansion is planned
  });
});
