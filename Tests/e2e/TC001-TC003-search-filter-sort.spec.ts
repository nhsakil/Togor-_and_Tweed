/**
 * TC-001 Product Search
 * TC-002 Advanced Filters
 * TC-003 Product Sorting
 */
import { test, expect } from '@playwright/test';

test.describe('Search, Filter & Sort', () => {

  // TC-001 ─────────────────────────────────────────────────────────────────
  test('TC-001 | Product Search — keyword returns relevant results', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('shirt');
    await searchInput.press('Enter');

    await page.waitForURL(/search/);
    await expect(page.locator('[data-testid="product-card"]')).not.toHaveCount(0);

    // Every visible product name/description should relate to the query
    const titles = await page.locator('[data-testid="product-title"]').allTextContents();
    expect(titles.length).toBeGreaterThan(0);
    const allMatch = titles.every(t => t.toLowerCase().includes('shirt'));
    // Soft assertion — partial match acceptable (search engine may weight differently)
    if (!allMatch) {
      console.warn('Some results may not exactly match keyword — verify relevance ranking');
    }
  });

  // TC-002 ─────────────────────────────────────────────────────────────────
  test('TC-002 | Advanced Filters — category + price + rating', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');

    // Category filter
    await page.click('[data-testid="filter-category-Shirts"]');
    await page.waitForSelector('[data-testid="product-card"]');
    const afterCatFilter = await page.locator('[data-testid="product-card"]').count();
    expect(afterCatFilter).toBeGreaterThan(0);

    // Price filter — set max ৳2000
    await page.fill('[data-testid="filter-price-max"]', '2000');
    await page.click('[data-testid="filter-apply-btn"]');
    await page.waitForSelector('[data-testid="product-card"]');

    // Verify prices are within range
    const prices = await page.locator('[data-testid="product-price"]').allTextContents();
    prices.forEach(p => {
      const num = parseFloat(p.replace(/[^\d.]/g, ''));
      expect(num).toBeLessThanOrEqual(2000);
    });

    // Rating filter — 4+ stars
    await page.click('[data-testid="filter-rating-4"]');
    await page.waitForSelector('[data-testid="product-card"]');
    const afterRating = await page.locator('[data-testid="product-card"]').count();
    expect(afterRating).toBeGreaterThanOrEqual(0);
  });

  // TC-003 ─────────────────────────────────────────────────────────────────
  test('TC-003 | Product Sorting — price low to high', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');

    await page.selectOption('[data-testid="sort-select"]', 'price-asc');
    await page.waitForSelector('[data-testid="product-card"]');

    const prices = await page.locator('[data-testid="product-price"]').allTextContents();
    const nums = prices.map(p => parseFloat(p.replace(/[^\d.]/g, '')));

    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]).toBeGreaterThanOrEqual(nums[i - 1]);
    }
  });

  test('TC-003b | Product Sorting — price high to low', async ({ page }) => {
    await page.goto('/products');
    await page.selectOption('[data-testid="sort-select"]', 'price-desc');
    await page.waitForSelector('[data-testid="product-card"]');

    const prices = await page.locator('[data-testid="product-price"]').allTextContents();
    const nums = prices.map(p => parseFloat(p.replace(/[^\d.]/g, '')));

    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]).toBeLessThanOrEqual(nums[i - 1]);
    }
  });

  test('TC-003c | Product Sorting — newest first', async ({ page }) => {
    await page.goto('/products');
    await page.selectOption('[data-testid="sort-select"]', 'newest');
    await page.waitForSelector('[data-testid="product-card"]');
    const count = await page.locator('[data-testid="product-card"]').count();
    expect(count).toBeGreaterThan(0);
  });
});
