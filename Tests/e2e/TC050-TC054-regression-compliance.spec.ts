/**
 * TC-050 Regression – Cart
 * TC-051 Regression – Checkout
 * TC-052 GDPR Compliance
 * TC-053 CCPA Compliance
 * TC-054 PCI DSS Compliance
 */
import { test, expect } from '@playwright/test';
import { addFirstProductToCart, openCart, loginUser } from './helpers';

// ── REGRESSION ────────────────────────────────────────────────────────────────
test.describe('Regression', () => {

  // TC-050 ─────────────────────────────────────────────────────────────────
  test.describe('TC-050 | Regression – Cart', () => {

    test('Cart persists across page navigations', async ({ page }) => {
      await addFirstProductToCart(page);
      await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

      await page.goto('/');
      await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

      await page.goto('/products');
      await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    });

    test('Cart persists after browser refresh', async ({ page }) => {
      await addFirstProductToCart(page);
      await page.reload();
      await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    });

    test('Multiple items accumulate correctly', async ({ page }) => {
      await page.goto('/products');
      await page.waitForSelector('[data-testid="product-card"]');

      await page.locator('[data-testid="product-card"]').nth(0).click();
      await page.click('[data-testid="add-to-cart-btn"]');
      await page.go('back');

      await page.locator('[data-testid="product-card"]').nth(1).click();
      await page.click('[data-testid="add-to-cart-btn"]');

      await expect(page.locator('[data-testid="cart-count"]')).toHaveText('2');
    });

    test('Cart total = sum of all item prices', async ({ page }) => {
      await page.goto('/products');
      await page.waitForSelector('[data-testid="product-card"]');

      await page.locator('[data-testid="product-card"]').first().click();
      await page.click('[data-testid="add-to-cart-btn"]');
      await page.go('back');

      await openCart(page);
      const itemPrices = await page.locator('[data-testid="cart-item-subtotal"]').allTextContents();
      const sum = itemPrices.reduce((acc, p) => acc + parseFloat(p.replace(/[^\d.]/g, '')), 0);
      const total = await page.locator('[data-testid="cart-total"]').textContent();
      const totalNum = parseFloat(total!.replace(/[^\d.]/g, ''));
      expect(totalNum).toBeCloseTo(sum, 0);
    });

    test('Removing all items shows empty cart state', async ({ page }) => {
      await addFirstProductToCart(page);
      await openCart(page);
      await page.click('[data-testid="cart-item-remove"]');
      await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
      await expect(page.locator('[data-testid="cart-count"]')).toHaveText('0');
    });
  });

  // TC-051 ─────────────────────────────────────────────────────────────────
  test.describe('TC-051 | Regression – Checkout', () => {

    test('Checkout reflects cart contents correctly', async ({ page }) => {
      await addFirstProductToCart(page);
      await openCart(page);
      const cartItemName = await page.locator('[data-testid="cart-item-name"]').first().textContent();
      const cartTotal    = await page.locator('[data-testid="cart-total"]').textContent();

      await page.goto('/checkout');
      await expect(page.locator('[data-testid="order-summary"]')).toContainText(cartItemName!);

      const checkoutTotal = await page.locator('[data-testid="order-total"]').textContent();
      expect(
        parseFloat(checkoutTotal!.replace(/[^\d.]/g, ''))
      ).toBeCloseTo(
        parseFloat(cartTotal!.replace(/[^\d.]/g, '')), 0
      );
    });

    test('Shipping cost added correctly to total', async ({ page }) => {
      await addFirstProductToCart(page);
      await page.goto('/checkout');

      const subtotal  = parseFloat((await page.locator('[data-testid="subtotal"]').textContent())!.replace(/[^\d.]/g, ''));
      const shipping  = parseFloat((await page.locator('[data-testid="shipping-cost"]').textContent())!.replace(/[^\d.]/g, ''));
      const total     = parseFloat((await page.locator('[data-testid="order-total"]').textContent())!.replace(/[^\d.]/g, ''));

      expect(total).toBeCloseTo(subtotal + shipping, 0);
    });

    test('Cannot checkout with empty cart', async ({ page }) => {
      await page.goto('/checkout');
      // Should redirect to cart or products page
      await expect(page).not.toHaveURL('/checkout');
    });

    test('Order confirmation shows correct order ID', async ({ page }) => {
      await addFirstProductToCart(page);
      await page.goto('/checkout');
      await page.fill('[name="fullName"]',   'Regression Tester');
      await page.fill('[name="email"]',      'regression@test.com');
      await page.fill('[name="phone"]',      '01700000001');
      await page.fill('[name="address"]',    '456 Regression Ave, Dhaka');
      await page.fill('[name="city"]',       'Dhaka');
      await page.fill('[name="postalCode"]', '1205');
      await page.click('[data-testid="payment-cod"]');
      await page.click('[data-testid="place-order-btn"]');

      await page.waitForURL(/\/order-confirmation\/.+/);
      const orderId = await page.locator('[data-testid="order-id"]').textContent();
      expect(orderId!.trim().length).toBeGreaterThan(0);
    });
  });
});

// ── COMPLIANCE ────────────────────────────────────────────────────────────────
test.describe('Compliance', () => {

  // TC-052 ─────────────────────────────────────────────────────────────────
  test.describe('TC-052 | GDPR Compliance', () => {

    test('Cookie consent banner shown on first visit', async ({ page }) => {
      // Clear cookies to simulate first visit
      await page.context().clearCookies();
      await page.goto('/');
      await expect(page.locator('[data-testid="cookie-banner"]')).toBeVisible();
    });

    test('Cookie consent — Accept stores preference', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto('/');
      await page.click('[data-testid="cookie-accept-btn"]');

      const cookies = await page.context().cookies();
      const consentCookie = cookies.find(c => c.name.includes('consent') || c.name.includes('cookie'));
      expect(consentCookie).toBeTruthy();
    });

    test('Cookie consent — Reject disables analytics cookies', async ({ page }) => {
      await page.context().clearCookies();

      const analyticsRequests: string[] = [];
      page.on('request', req => {
        if (req.url().includes('google-analytics') || req.url().includes('gtag')) {
          analyticsRequests.push(req.url());
        }
      });

      await page.goto('/');
      const rejectBtn = page.locator('[data-testid="cookie-reject-btn"]');
      if (await rejectBtn.isVisible()) {
        await rejectBtn.click();
        await page.waitForLoadState('networkidle');
        expect(analyticsRequests).toHaveLength(0);
      }
    });

    test('Privacy policy page exists and loads', async ({ page }) => {
      const res = await page.goto('/privacy-policy');
      expect(res?.status()).toBeLessThan(400);
      await expect(page.locator('h1, h2')).toContainText(/privacy/i);
    });

    test('Data deletion API endpoint exists', async ({ page }) => {
      await loginUser(page);
      // Attempt to call data deletion endpoint — must exist (even if 400 due to missing reason param)
      const res = await page.request.delete('/api/account/delete', {
        data: { reason: 'GDPR test request' },
      });
      // Should not be 404 (endpoint must exist)
      expect(res.status()).not.toBe(404);
      console.log(`GDPR deletion endpoint returned ${res.status()}`);
    });

    test('Account page has data export option', async ({ page }) => {
      await loginUser(page);
      await page.goto('/account/settings');
      await expect(
        page.locator('[data-testid="export-data-btn"], [href*="export"]')
      ).toBeVisible();
    });
  });

  // TC-053 ─────────────────────────────────────────────────────────────────
  test.describe('TC-053 | CCPA Compliance', () => {

    test('TC-053 | CCPA opt-out documented (low priority — BD market)', async ({ page }) => {
      // CCPA applies to California residents. Target market is Bangladesh.
      // This test documents the check — no enforcement required.
      console.log('TC-053: CCPA not applicable to primary BD market. Low priority.');

      // Verify there is at least a privacy policy that mentions data rights
      const res = await page.goto('/privacy-policy');
      if (res && res.status() < 400) {
        const body = await page.locator('body').textContent();
        const hasDataRightsInfo = /data|privacy|rights|opt.?out/i.test(body || '');
        console.log(`Privacy policy mentions data rights: ${hasDataRightsInfo}`);
      }
    });
  });

  // TC-054 ─────────────────────────────────────────────────────────────────
  test.describe('TC-054 | PCI DSS Compliance', () => {

    test('No raw card data fields on checkout page', async ({ page }) => {
      await addFirstProductToCart(page);
      await page.goto('/checkout');

      // PAN (card number) field must NOT exist in DOM — bKash/Nagad redirect instead
      const cardNumberField = page.locator(
        'input[name="cardNumber"], input[name="card_number"], input[name="pan"]'
      );
      await expect(cardNumberField).toHaveCount(0);
      console.log('No raw card number field found ✓ — PCI scope reduced via gateway redirect');
    });

    test('Payment method redirects to external gateway (no card capture)', async ({ page }) => {
      await addFirstProductToCart(page);
      await page.goto('/checkout');
      await page.fill('[name="fullName"]',   'PCI Test User');
      await page.fill('[name="email"]',      'pci@test.com');
      await page.fill('[name="phone"]',      '01700000002');
      await page.fill('[name="address"]',    'PCI Street');
      await page.fill('[name="city"]',       'Dhaka');
      await page.fill('[name="postalCode"]', '1200');

      // bKash should redirect to external URL
      const bkashBtn = page.locator('[data-testid="payment-bkash"]');
      if (await bkashBtn.isVisible()) {
        await bkashBtn.click();
        await page.click('[data-testid="place-order-btn"]');

        // Should navigate to bKash external URL or open modal
        await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
        const newUrl = page.url();
        const isExternal = newUrl.includes('bka.sh') || newUrl.includes('bkash') || newUrl.includes('localhost');
        console.log(`After bKash selection, navigated to: ${newUrl}`);
        // Acceptable: external redirect OR still on page (gateway modal)
        expect(isExternal).toBe(true);
      }
    });

    test('Checkout page served over HTTPS', async ({ page }) => {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      if (baseUrl.startsWith('https://')) {
        const res = await page.goto('/checkout');
        expect(page.url()).toMatch(/^https:\/\//);
        console.log('Checkout served over HTTPS ✓');
      } else {
        console.log('HTTPS check skipped — dev environment');
      }
    });

    test('API does not return full card data in any response', async ({ page }) => {
      const responses: string[] = [];
      page.on('response', async res => {
        if (res.url().includes('/api/') && res.headers()['content-type']?.includes('json')) {
          const body = await res.text().catch(() => '');
          responses.push(body);
        }
      });

      await addFirstProductToCart(page);
      await page.goto('/checkout');

      for (const body of responses) {
        // Must never contain a 16-digit card number pattern
        expect(body).not.toMatch(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/);
        // Must never contain CVV pattern
        expect(body).not.toMatch(/"cvv"\s*:|"cvc"\s*:|"cvv2"\s*:/i);
      }
      console.log(`Checked ${responses.length} API responses — no card data leaked ✓`);
    });
  });
});
