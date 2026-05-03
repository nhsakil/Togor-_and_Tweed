/**
 * TC-004 Product Detail Page
 */
import { test, expect } from '@playwright/test';

test.describe('Product Detail Page', () => {

  test('TC-004 | PDP loads images, description, price, reviews', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    await page.click('[data-testid="product-card"]:first-child');

    // URL changed to product page
    await expect(page).toHaveURL(/\/products\/.+/);

    // Core elements present
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-images"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible();

    // At least one image has a valid src
    const imgSrc = await page.locator('[data-testid="product-images"] img').first().getAttribute('src');
    expect(imgSrc).toBeTruthy();
    expect(imgSrc).not.toBe('');

    // Reviews section exists (may be empty if no reviews)
    await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible();
  });

  test('TC-004b | PDP image gallery — clicking thumbnail changes main image', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    await page.click('[data-testid="product-card"]:first-child');

    const thumbnails = page.locator('[data-testid="product-thumbnail"]');
    const thumbCount = await thumbnails.count();

    if (thumbCount > 1) {
      const mainImgBefore = await page.locator('[data-testid="product-main-image"]').getAttribute('src');
      await thumbnails.nth(1).click();
      const mainImgAfter = await page.locator('[data-testid="product-main-image"]').getAttribute('src');
      expect(mainImgAfter).not.toBe(mainImgBefore);
    }
  });

  test('TC-004c | PDP size selector works', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    await page.click('[data-testid="product-card"]:first-child');

    const sizeOptions = page.locator('[data-testid="size-option"]');
    const sizeCount = await sizeOptions.count();

    if (sizeCount > 0) {
      await sizeOptions.first().click();
      await expect(sizeOptions.first()).toHaveClass(/selected|active/);
    }
  });
});
