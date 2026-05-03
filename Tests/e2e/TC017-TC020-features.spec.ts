/**
 * TC-017 Wishlist
 * TC-018 Compare Products
 * TC-019 Review Submission
 * TC-020 Coupon Code
 */
import { test, expect } from '@playwright/test';
import { loginUser, addFirstProductToCart } from './helpers';

test.describe('Wishlist, Compare, Reviews, Coupons', () => {

  // TC-017 ─────────────────────────────────────────────────────────────────
  test('TC-017 | Wishlist — product saved and persists', async ({ page }) => {
    await loginUser(page);
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');

    const firstCard = page.locator('[data-testid="product-card"]').first();
    const productTitle = await firstCard.locator('[data-testid="product-title"]').textContent();

    await firstCard.locator('[data-testid="wishlist-btn"]').click();
    await expect(firstCard.locator('[data-testid="wishlist-btn"]')).toHaveClass(/active|saved/);

    // Navigate to wishlist page
    await page.goto('/account/wishlist');
    await expect(page.locator('[data-testid="wishlist-item"]')
      .filter({ hasText: productTitle! })).toBeVisible();
  });

  test('TC-017b | Wishlist — toggle removes item', async ({ page }) => {
    await loginUser(page);
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');

    const firstCard = page.locator('[data-testid="product-card"]').first();
    await firstCard.locator('[data-testid="wishlist-btn"]').click(); // add
    await firstCard.locator('[data-testid="wishlist-btn"]').click(); // remove

    await expect(firstCard.locator('[data-testid="wishlist-btn"]')).not.toHaveClass(/active|saved/);
  });

  test('TC-017c | Wishlist — guest redirect to login', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    await page.locator('[data-testid="wishlist-btn"]').first().click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // TC-018 ─────────────────────────────────────────────────────────────────
  test('TC-018 | Compare Products — table displays correctly', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');

    const cards = page.locator('[data-testid="product-card"]');
    await cards.nth(0).locator('[data-testid="compare-btn"]').click();
    await cards.nth(1).locator('[data-testid="compare-btn"]').click();

    // Compare panel / notification
    await expect(page.locator('[data-testid="compare-panel"]')).toContainText('2');

    await page.click('[data-testid="compare-now-btn"]');
    await expect(page).toHaveURL(/\/compare/);

    // Table with 2 product columns
    await expect(page.locator('[data-testid="compare-table"] th')).toHaveCount(3); // label + 2 products
    await expect(page.locator('[data-testid="compare-row"]')).not.toHaveCount(0);
  });

  // TC-019 ─────────────────────────────────────────────────────────────────
  test('TC-019 | Review Submission — review posted successfully', async ({ page }) => {
    await loginUser(page);
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    await page.click('[data-testid="product-card"]:first-child');

    await page.click('[data-testid="write-review-btn"]');

    // Fill review form
    await page.click('[data-testid="star-rating-4"]');
    await page.fill('[data-testid="review-title"]',   'Great quality!');
    await page.fill('[data-testid="review-body"]',    'Excellent fit, fast delivery. Would recommend.');
    await page.click('[data-testid="submit-review-btn"]');

    // Review appears in the list
    await expect(page.locator('[data-testid="review-list"]')).toContainText('Great quality!');
  });

  test('TC-019b | Review — guest cannot submit, redirected to login', async ({ page }) => {
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="write-review-btn"]');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('TC-019c | Review — duplicate review blocked', async ({ page }) => {
    await loginUser(page);
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');

    // Try to write a second review for the same product
    const writeBtn = page.locator('[data-testid="write-review-btn"]');
    if (await writeBtn.isVisible()) {
      await writeBtn.click();
      await page.click('[data-testid="star-rating-3"]');
      await page.fill('[data-testid="review-body"]', 'Second attempt');
      await page.click('[data-testid="submit-review-btn"]');
      await expect(page.locator('[data-testid="form-error"]')).toContainText(/already.*reviewed|one.*review/i);
    }
  });

  // TC-020 ─────────────────────────────────────────────────────────────────
  test('TC-020 | Coupon Code — valid coupon applies discount', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/checkout');

    const totalBefore = await page.locator('[data-testid="order-total"]').textContent();
    const numBefore   = parseFloat(totalBefore!.replace(/[^\d.]/g, ''));

    await page.fill('[data-testid="coupon-input"]', process.env.TEST_COUPON || 'WELCOME10');
    await page.click('[data-testid="apply-coupon-btn"]');

    await expect(page.locator('[data-testid="coupon-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="discount-line"]')).toBeVisible();

    const totalAfter = await page.locator('[data-testid="order-total"]').textContent();
    const numAfter   = parseFloat(totalAfter!.replace(/[^\d.]/g, ''));
    expect(numAfter).toBeLessThan(numBefore);
  });

  test('TC-020b | Coupon Code — invalid code shows clear error', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/checkout');

    await page.fill('[data-testid="coupon-input"]', 'INVALIDXYZ999');
    await page.click('[data-testid="apply-coupon-btn"]');

    await expect(page.locator('[data-testid="coupon-error"]')).toContainText(/invalid|not.*valid|expired/i);
  });

  test('TC-020c | Coupon Code — expired coupon rejected', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/checkout');

    await page.fill('[data-testid="coupon-input"]', process.env.EXPIRED_COUPON || 'EXPIRED2020');
    await page.click('[data-testid="apply-coupon-btn"]');

    await expect(page.locator('[data-testid="coupon-error"]')).toContainText(/expired/i);
  });
});
