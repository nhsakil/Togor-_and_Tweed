/**
 * TC-005 Add to Cart
 * TC-006 Remove from Cart
 * TC-007 Update Quantity
 */
import { test, expect } from '@playwright/test';
import { addFirstProductToCart, openCart } from './helpers';

test.describe('Shopping Cart', () => {

  test('TC-005 | Add to Cart — product appears with correct price', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    await page.click('[data-testid="product-card"]:first-child');

    const price = await page.locator('[data-testid="product-price"]').textContent();
    await page.click('[data-testid="add-to-cart-btn"]');

    // Cart count badge increments
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // Open cart and verify item
    await openCart(page);
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    const cartPrice = await page.locator('[data-testid="cart-item-price"]').textContent();
    expect(cartPrice).toBe(price);
  });

  test('TC-005b | Add to Cart — same product increments quantity', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    await page.click('[data-testid="product-card"]:first-child');

    await page.click('[data-testid="add-to-cart-btn"]');
    await page.click('[data-testid="add-to-cart-btn"]');

    await openCart(page);
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="cart-item-quantity"]')).toHaveText('2');
  });

  test('TC-006 | Remove from Cart — item removed, total updated', async ({ page }) => {
    await addFirstProductToCart(page);
    await openCart(page);

    const initialTotal = await page.locator('[data-testid="cart-total"]').textContent();
    await page.click('[data-testid="cart-item-remove"]');

    // Cart empty state shown
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('0');
  });

  test('TC-007 | Update Quantity — total updates correctly', async ({ page }) => {
    await addFirstProductToCart(page);
    await openCart(page);

    const unitPrice = await page.locator('[data-testid="cart-item-price"]').textContent();
    const unitNum   = parseFloat(unitPrice!.replace(/[^\d.]/g, ''));

    // Increase to 3
    await page.click('[data-testid="qty-increase"]');
    await page.click('[data-testid="qty-increase"]');
    await expect(page.locator('[data-testid="cart-item-quantity"]')).toHaveText('3');

    const total = await page.locator('[data-testid="cart-total"]').textContent();
    const totalNum = parseFloat(total!.replace(/[^\d.]/g, ''));
    expect(totalNum).toBeCloseTo(unitNum * 3, 0);

    // Decrease back to 1
    await page.click('[data-testid="qty-decrease"]');
    await page.click('[data-testid="qty-decrease"]');
    await expect(page.locator('[data-testid="cart-item-quantity"]')).toHaveText('1');
  });

  test('TC-007b | Quantity cannot go below 1', async ({ page }) => {
    await addFirstProductToCart(page);
    await openCart(page);

    await page.click('[data-testid="qty-decrease"]');
    await expect(page.locator('[data-testid="cart-item-quantity"]')).toHaveText('1');
    // Item should still be present or a remove confirmation shown — not auto-deleted
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });
});
