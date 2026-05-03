/**
 * TC-013 User Registration
 * TC-014 Login
 * TC-015 Logout
 * TC-016 Password Reset
 */
import { test, expect } from '@playwright/test';

const unique = () => `qa_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

test.describe('Authentication', () => {

  // TC-013 ─────────────────────────────────────────────────────────────────
  test('TC-013 | User Registration — valid details create account', async ({ page }) => {
    const email = `${unique()}@torgortest.com`;
    await page.goto('/auth/register');

    await page.fill('[name="name"]',            'QA Tester');
    await page.fill('[name="email"]',           email);
    await page.fill('[name="password"]',        'Test@12345!');
    await page.fill('[name="confirmPassword"]', 'Test@12345!');
    await page.click('[type="submit"]');

    // Redirected to home or dashboard
    await expect(page).not.toHaveURL('/auth/register');
    // Welcome message or user menu visible
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('TC-013b | Registration — duplicate email shows error', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('[name="name"]',     'Duplicate User');
    await page.fill('[name="email"]',    'existing@torgortest.com');
    await page.fill('[name="password"]', 'Test@12345!');
    await page.fill('[name="confirmPassword"]', 'Test@12345!');
    await page.click('[type="submit"]');

    await expect(page.locator('[data-testid="form-error"]')).toContainText(/already.*exist|email.*taken/i);
  });

  test('TC-013c | Registration — weak password rejected', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('[name="name"]',     'Weak Pass');
    await page.fill('[name="email"]',    `${unique()}@test.com`);
    await page.fill('[name="password"]', '123');
    await page.fill('[name="confirmPassword"]', '123');
    await page.click('[type="submit"]');

    await expect(page.locator('[data-testid="field-error-password"]')).toBeVisible();
  });

  // TC-014 ─────────────────────────────────────────────────────────────────
  test('TC-014 | Login — valid credentials log user in', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[name="email"]',    process.env.TEST_EMAIL    || 'test@torgortest.com');
    await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'Test@12345!');
    await page.click('[type="submit"]');

    await expect(page).not.toHaveURL('/auth/login');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('TC-014b | Login — wrong password shows error', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[name="email"]',    'test@torgortest.com');
    await page.fill('[name="password"]', 'WrongPassword!');
    await page.click('[type="submit"]');

    await expect(page.locator('[data-testid="form-error"]')).toContainText(/invalid|incorrect|wrong/i);
    await expect(page).toHaveURL('/auth/login');
  });

  test('TC-014c | Login — non-existent email shows error', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[name="email"]',    'nobody@nowhere.com');
    await page.fill('[name="password"]', 'SomePass123!');
    await page.click('[type="submit"]');

    await expect(page.locator('[data-testid="form-error"]')).toBeVisible();
  });

  // TC-015 ─────────────────────────────────────────────────────────────────
  test('TC-015 | Logout — session ends, protected routes redirect', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('[name="email"]',    process.env.TEST_EMAIL    || 'test@torgortest.com');
    await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'Test@12345!');
    await page.click('[type="submit"]');
    await page.waitForURL('/');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-btn"]');
    await page.waitForURL('/');

    // User menu gone
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();

    // Protected route redirects
    await page.goto('/account/orders');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // TC-016 ─────────────────────────────────────────────────────────────────
  test('TC-016 | Password Reset — reset email API triggered', async ({ page }) => {
    let emailCalled = false;
    await page.route('**/api/auth/reset-password**', route => {
      emailCalled = true;
      route.fulfill({ status: 200, body: JSON.stringify({ message: 'Email sent' }) });
    });

    await page.goto('/auth/forgot-password');
    await page.fill('[name="email"]', 'test@torgortest.com');
    await page.click('[type="submit"]');

    await expect(page.locator('[data-testid="reset-success"]')).toContainText(/sent|check.*email/i);
    expect(emailCalled).toBe(true);
  });

  test('TC-016b | Password Reset — invalid email shows error', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await page.fill('[name="email"]', 'not-an-email');
    await page.click('[type="submit"]');
    await expect(page.locator('[data-testid="field-error-email"]')).toBeVisible();
  });
});
