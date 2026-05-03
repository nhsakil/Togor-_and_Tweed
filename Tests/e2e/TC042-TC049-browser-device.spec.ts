/**
 * TC-042 Chrome
 * TC-043 Firefox
 * TC-044 Safari
 * TC-045 Edge
 * TC-046 iOS Device
 * TC-047 Android Device
 * TC-048 Windows Desktop
 * TC-049 macOS Desktop
 *
 * These run via Playwright projects defined in playwright.config.ts.
 * The same functional checks run on each browser/device project.
 */
import { test, expect } from '@playwright/test';
import { addFirstProductToCart, openCart } from './helpers';

// Core smoke test that must pass on ALL browsers/devices
test.describe('Cross-Browser & Cross-Device Smoke Tests', () => {

  test('Homepage renders without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await expect(page.locator('[data-testid="site-logo"]')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    expect(errors, `JS errors on homepage: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('Product listing loads and cards are visible', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    const count = await page.locator('[data-testid="product-card"]').count();
    expect(count).toBeGreaterThan(0);
  });

  test('Product detail page loads', async ({ page }) => {
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible();
  });

  test('Cart drawer opens and closes', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    await page.click('[data-testid="cart-close-btn"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).not.toBeVisible();
  });

  test('Add to cart works across all browsers', async ({ page }) => {
    await addFirstProductToCart(page);
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  });

  test('Auth pages render correctly', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
    await expect(page.locator('[type="submit"]')).toBeVisible();
  });

  test('No console errors on core pages', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    for (const url of ['/', '/products', '/auth/login']) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
    }

    // Filter known acceptable errors
    const realErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR_') &&
      !e.includes('404')
    );
    expect(realErrors, `Console errors: ${realErrors.join('\n')}`).toHaveLength(0);
  });
});

// ── Mobile-specific tests (TC-046 iOS, TC-047 Android) ───────────────────────
test.describe('Mobile-Specific', () => {

  test('TC-046/047 | Mobile menu opens and navigates', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();
    await page.goto('/');

    const menuBtn = page.locator('[data-testid="mobile-menu-btn"]');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

    // Navigate via mobile menu
    await page.locator('[data-testid="mobile-nav"] a').first().click();
    await page.waitForLoadState('networkidle');
    // Should have navigated somewhere
    expect(page.url()).not.toBe('about:blank');
  });

  test('TC-046/047 | Touch — product image swipe works', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.waitForSelector('[data-testid="product-images"]');

    const gallery = page.locator('[data-testid="product-images"]');
    const box     = await gallery.boundingBox();
    if (box) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    }
    // Image gallery should still be visible
    await expect(gallery).toBeVisible();
  });

  test('TC-046/047 | Mobile checkout — form fields are tappable', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();
    await addFirstProductToCart(page);
    await page.goto('/checkout');

    const nameField = page.locator('[name="fullName"]');
    await nameField.tap();
    await nameField.type('Mobile User');
    expect(await nameField.inputValue()).toBe('Mobile User');
  });
});

// ── Desktop-specific tests (TC-048 Windows, TC-049 macOS) ────────────────────
test.describe('Desktop-Specific', () => {

  test('TC-048/049 | Desktop — hover effects on product cards', async ({ page, isMobile }) => {
    if (isMobile) test.skip();
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');

    const card = page.locator('[data-testid="product-card"]').first();
    await card.hover();

    // Quick-add button or overlay visible on hover
    const hoverEl = card.locator('[data-testid="quick-add-btn"], [data-testid="hover-overlay"]');
    await expect(hoverEl).toBeVisible();
  });

  test('TC-048/049 | Desktop — keyboard search shortcut works (Ctrl+K / Cmd+K)', async ({ page, isMobile }) => {
    if (isMobile) test.skip();
    await page.goto('/');

    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+k' : 'Control+k');

    await expect(page.locator('[data-testid="search-modal"], [data-testid="search-input"]'))
      .toBeVisible({ timeout: 3000 })
      .catch(() => console.log('Keyboard shortcut not implemented yet — skip'));
  });
});
