/**
 * TC-008 Guest Checkout
 * TC-009 Registered User Checkout
 * TC-010 Multiple Payment Methods
 * TC-011 Order Confirmation Email
 * TC-012 Order Tracking
 */
import { test, expect } from '@playwright/test';
import { addFirstProductToCart, loginUser, TEST_USER } from './helpers';

// Guest checkout data
const GUEST = {
  name:    'Guest User',
  email:   'guest@test.com',
  phone:   '01700000000',
  address: '123 Test Street, Dhaka',
  city:    'Dhaka',
  zip:     '1207',
};

async function fillShippingForm(page: any, data = GUEST) {
  await page.fill('[name="fullName"]',    data.name);
  await page.fill('[name="email"]',       data.email);
  await page.fill('[name="phone"]',       data.phone);
  await page.fill('[name="address"]',     data.address);
  await page.fill('[name="city"]',        data.city);
  await page.fill('[name="postalCode"]',  data.zip);
}

test.describe('Checkout & Orders', () => {

  // TC-008 ─────────────────────────────────────────────────────────────────
  test('TC-008 | Guest Checkout — order placed, confirmation shown', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/checkout');
    await expect(page).toHaveURL('/checkout');

    await fillShippingForm(page);

    // Select Cash on Delivery
    await page.click('[data-testid="payment-cod"]');

    // Place order
    await page.click('[data-testid="place-order-btn"]');

    // Confirmation page
    await page.waitForURL(/\/order-confirmation\/.+/);
    await expect(page.locator('[data-testid="order-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-success-msg"]')).toContainText(/order.*placed|confirmed/i);
  });

  // TC-009 ─────────────────────────────────────────────────────────────────
  test('TC-009 | Registered Checkout — order visible in My Orders', async ({ page }) => {
    await loginUser(page);
    await addFirstProductToCart(page);
    await page.goto('/checkout');

    // Shipping form may be pre-filled for logged-in users
    const nameField = page.locator('[name="fullName"]');
    if (await nameField.inputValue() === '') {
      await fillShippingForm(page);
    }

    await page.click('[data-testid="payment-cod"]');
    await page.click('[data-testid="place-order-btn"]');
    await page.waitForURL(/\/order-confirmation\/.+/);

    const orderId = await page.locator('[data-testid="order-id"]').textContent();

    // Navigate to My Orders and find the order
    await page.goto('/account/orders');
    await expect(page.locator(`[data-testid="order-row"]`).filter({ hasText: orderId! })).toBeVisible();
  });

  // TC-010 ─────────────────────────────────────────────────────────────────
  test('TC-010 | Payment — Cash on Delivery flow', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/checkout');
    await fillShippingForm(page);

    await page.click('[data-testid="payment-cod"]');
    await expect(page.locator('[data-testid="payment-cod"]')).toBeChecked();
    await page.click('[data-testid="place-order-btn"]');
    await page.waitForURL(/\/order-confirmation\//);
    await expect(page.locator('[data-testid="payment-method-label"]')).toContainText(/cash on delivery/i);
  });

  test('TC-010b | Payment — bKash payment option visible and selectable', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/checkout');
    await fillShippingForm(page);

    const bkashOption = page.locator('[data-testid="payment-bkash"]');
    await expect(bkashOption).toBeVisible();
    await bkashOption.click();
    await expect(bkashOption).toBeChecked();
    // Redirect to bKash gateway should occur on order placement
  });

  test('TC-010c | Payment — Nagad payment option visible and selectable', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/checkout');

    const nagadOption = page.locator('[data-testid="payment-nagad"]');
    await expect(nagadOption).toBeVisible();
    await nagadOption.click();
    await expect(nagadOption).toBeChecked();
  });

  // TC-011 ─────────────────────────────────────────────────────────────────
  test('TC-011 | Order Confirmation Email — API called after order', async ({ page }) => {
    // Intercept the Resend API call
    let emailSent = false;
    await page.route('**/api/send-email**', route => {
      emailSent = true;
      route.fulfill({ status: 200, body: JSON.stringify({ id: 'email_123' }) });
    });

    await addFirstProductToCart(page);
    await page.goto('/checkout');
    await fillShippingForm(page);
    await page.click('[data-testid="payment-cod"]');
    await page.click('[data-testid="place-order-btn"]');
    await page.waitForURL(/\/order-confirmation\//);

    expect(emailSent).toBe(true);
  });

  // TC-012 ─────────────────────────────────────────────────────────────────
  test('TC-012 | Order Tracking — status shown in My Orders', async ({ page }) => {
    await loginUser(page);
    await page.goto('/account/orders');

    await expect(page.locator('[data-testid="order-row"]')).not.toHaveCount(0);

    const firstOrder = page.locator('[data-testid="order-row"]').first();
    await expect(firstOrder.locator('[data-testid="order-status"]')).toBeVisible();

    // Status should be one of the known values
    const status = await firstOrder.locator('[data-testid="order-status"]').textContent();
    expect(['Pending','Processing','Shipped','Delivered','Cancelled']).toContain(status?.trim());
  });
});
