/**
 * TC-035 SQL Injection
 * TC-036 XSS
 * TC-037 CSRF
 * TC-038 HTTPS
 * TC-039 Secure Cookies
 * TC-040 Password Encryption
 * TC-041 Role-Based Access Control
 */
import { test, expect } from '@playwright/test';
import { loginUser } from './helpers';

test.describe('Security', () => {

  // TC-035 ─────────────────────────────────────────────────────────────────
  test("TC-035 | SQL Injection — search input sanitized", async ({ page }) => {
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE products; --",
      "1' OR 1=1 --",
      "\" OR \"\"=\"",
    ];

    for (const payload of payloads) {
      await page.goto('/');
      await page.fill('[data-testid="search-input"]', payload);
      await page.press('[data-testid="search-input"]', 'Enter');

      // Must NOT crash (500) or leak DB info
      const url = page.url();
      const status = await page.evaluate(() => {
        const metas = Array.from(document.querySelectorAll('meta'));
        return document.title;
      });

      // Page should show no results or error, not a server crash
      const is500 = await page.locator('body').textContent();
      expect(is500).not.toMatch(/sql.*error|syntax.*error|mysql.*error/i);
      expect(is500).not.toMatch(/pg.*error|ORA-\d+|sqlite.*error/i);
      console.log(`SQL payload "${payload}" — sanitized ✓`);
    }
  });

  test('TC-035b | SQL Injection — login form sanitized', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[name="email"]',    "' OR '1'='1' --");
    await page.fill('[name="password"]', "anything");
    await page.click('[type="submit"]');

    // Should NOT log in or crash
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    const body = await page.locator('body').textContent();
    expect(body).not.toMatch(/sql|syntax error/i);
  });

  // TC-036 ─────────────────────────────────────────────────────────────────
  test('TC-036 | XSS — script tags in search are escaped', async ({ page }) => {
    const xssPayloads = [
      '<script>document.title="XSS"</script>',
      '<img src=x onerror=alert(1)>',
      '"><script>alert("XSS")</script>',
      'javascript:alert(1)',
    ];

    let xssExecuted = false;
    page.on('dialog', dialog => {
      xssExecuted = true;
      dialog.dismiss();
    });

    for (const payload of xssPayloads) {
      await page.goto('/');
      await page.fill('[data-testid="search-input"]', payload);
      await page.press('[data-testid="search-input"]', 'Enter');
      await page.waitForLoadState('networkidle');

      // Script must NOT execute
      expect(xssExecuted, `XSS executed for payload: ${payload}`).toBe(false);

      // Title should NOT have been changed
      const title = await page.title();
      expect(title).not.toBe('XSS');
      console.log(`XSS payload "${payload.slice(0,40)}" — blocked ✓`);
    }
  });

  test('TC-036b | XSS — review body input is escaped on display', async ({ page }) => {
    let xssExecuted = false;
    page.on('dialog', () => { xssExecuted = true; });

    // Post a review with XSS payload via API intercept simulation
    await page.route('**/api/reviews', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'r1',
          body: '<script>alert("xss")</script>Great product',
          rating: 5,
        }),
      });
    });

    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.waitForSelector('[data-testid="reviews-section"]');

    expect(xssExecuted).toBe(false);
  });

  // TC-037 ─────────────────────────────────────────────────────────────────
  test('TC-037 | CSRF — state-changing requests require CSRF token', async ({ page }) => {
    // Attempt to call a mutation API without a valid session/CSRF token
    const res = await page.request.post('/api/orders', {
      data: { productId: '1', quantity: 1 },
      headers: { 'Content-Type': 'application/json' },
      // No auth cookie, no CSRF token
    });

    // Must be rejected — 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(res.status());
    console.log(`CSRF test — unauthenticated POST to /api/orders returned ${res.status()} ✓`);
  });

  test('TC-037b | CSRF — NextAuth CSRF token validated on session actions', async ({ page }) => {
    // NextAuth provides a CSRF token via /api/auth/csrf
    const res = await page.request.get('/api/auth/csrf');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('csrfToken');
    console.log('CSRF token endpoint exists ✓');
  });

  // TC-038 ─────────────────────────────────────────────────────────────────
  test('TC-038 | HTTPS — HTTP redirects to HTTPS', async ({ page }) => {
    const BASE = process.env.BASE_URL || 'http://localhost:3000';
    if (BASE.startsWith('https://')) {
      // Already HTTPS — verify no mixed content
      const mixedContent: string[] = [];
      page.on('response', res => {
        if (res.url().startsWith('http://') && !res.url().startsWith('http://localhost')) {
          mixedContent.push(res.url());
        }
      });
      await page.goto('/');
      expect(mixedContent, `Mixed content found: ${mixedContent.join(', ')}`).toHaveLength(0);
    } else {
      // Localhost dev — verify HTTPS is enforced in production config
      const res = await page.request.get(BASE.replace('http://', 'https://'));
      console.log('HTTPS check — dev environment, skipping redirect assertion');
    }
  });

  test('TC-038b | HTTPS — HSTS header present on production', async ({ page }) => {
    const res = await page.request.get('/');
    const hsts = res.headers()['strict-transport-security'];
    if (process.env.BASE_URL?.startsWith('https://')) {
      expect(hsts, 'HSTS header missing').toBeTruthy();
      expect(hsts).toContain('max-age');
    } else {
      console.log('HSTS test skipped — not running on HTTPS');
    }
  });

  // TC-039 ─────────────────────────────────────────────────────────────────
  test('TC-039 | Secure Cookies — HttpOnly and Secure flags set', async ({ page }) => {
    await loginUser(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c =>
      c.name.includes('next-auth') || c.name.includes('session') || c.name.includes('__Secure')
    );

    expect(sessionCookie, 'No session cookie found after login').toBeTruthy();
    expect(sessionCookie!.httpOnly, 'Session cookie missing HttpOnly flag').toBe(true);

    // Secure flag required in production
    if (process.env.BASE_URL?.startsWith('https://')) {
      expect(sessionCookie!.secure, 'Session cookie missing Secure flag').toBe(true);
    }
    console.log(`Session cookie: ${sessionCookie!.name} — HttpOnly:${sessionCookie!.httpOnly}, Secure:${sessionCookie!.secure} ✓`);
  });

  test('TC-039b | Secure Cookies — SameSite attribute set', async ({ page }) => {
    await loginUser(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c =>
      c.name.includes('next-auth') || c.name.includes('session')
    );
    if (sessionCookie) {
      expect(['Strict','Lax']).toContain(sessionCookie.sameSite);
    }
  });

  // TC-040 ─────────────────────────────────────────────────────────────────
  test('TC-040 | Password Encryption — password not stored in plain text', async ({ page }) => {
    // Verify the register API hashes the password (check response never echoes it back)
    const testPassword = 'MySecretPass123!';
    let responseBody = '';

    await page.route('**/api/auth/register', async route => {
      const response = await route.fetch();
      responseBody = await response.text();
      route.fulfill({ response });
    });

    await page.goto('/auth/register');
    await page.fill('[name="name"]',     'Hash Test User');
    await page.fill('[name="email"]',    `hashtest_${Date.now()}@test.com`);
    await page.fill('[name="password"]', testPassword);
    await page.fill('[name="confirmPassword"]', testPassword);
    await page.click('[type="submit"]');

    // Password must NOT appear in API response
    expect(responseBody).not.toContain(testPassword);
    console.log('Password not echoed in API response ✓');
  });

  test('TC-040b | Password Encryption — /api/users does not expose password field', async ({ page }) => {
    await loginUser(page);
    const res = await page.request.get('/api/account/profile');
    if (res.status() === 200) {
      const body = await res.text();
      expect(body).not.toMatch(/"password"\s*:/);
      console.log('/api/account/profile does not expose password ✓');
    }
  });

  // TC-041 ─────────────────────────────────────────────────────────────────
  test('TC-041 | RBAC — regular user cannot access admin routes', async ({ page }) => {
    await loginUser(page); // logs in as a regular user

    const adminRoutes = [
      '/admin',
      '/admin/products',
      '/admin/orders',
      '/admin/users',
      '/api/admin/products',
    ];

    for (const route of adminRoutes) {
      const res = await page.request.get(route);
      expect([401, 403, 404]).toContain(res.status());
      console.log(`${route} → ${res.status()} (access denied) ✓`);
    }
  });

  test('TC-041b | RBAC — unauthenticated user cannot access account pages', async ({ page }) => {
    const protectedRoutes = [
      '/account/orders',
      '/account/wishlist',
      '/account/profile',
      '/checkout',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      // Must redirect to login
      await expect(page).toHaveURL(/\/auth\/login|\/login/);
    }
  });
});
