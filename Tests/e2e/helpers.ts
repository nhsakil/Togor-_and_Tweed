import { Page, expect } from '@playwright/test';

export const BASE = process.env.BASE_URL || 'http://localhost:3000';

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const TEST_USER = {
  name:     'QA Tester',
  email:    `qa_${Date.now()}@test.com`,
  password: 'Test@12345!',
};

export async function registerUser(page: Page, user = TEST_USER) {
  await page.goto('/auth/register');
  await page.fill('[name="name"]',     user.name);
  await page.fill('[name="email"]',    user.email);
  await page.fill('[name="password"]', user.password);
  await page.click('[type="submit"]');
  await page.waitForURL('/');
}

export async function loginUser(page: Page, user = TEST_USER) {
  await page.goto('/auth/login');
  await page.fill('[name="email"]',    user.email);
  await page.fill('[name="password"]', user.password);
  await page.click('[type="submit"]');
  await page.waitForURL('/');
}

export async function logoutUser(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-btn"]');
  await page.waitForURL('/');
}

// ── Product helpers ───────────────────────────────────────────────────────────
export async function addFirstProductToCart(page: Page) {
  await page.goto('/products');
  await page.waitForSelector('[data-testid="product-card"]');
  await page.click('[data-testid="product-card"]:first-child');
  await page.waitForSelector('[data-testid="add-to-cart-btn"]');
  await page.click('[data-testid="add-to-cart-btn"]');
}

export async function openCart(page: Page) {
  await page.click('[data-testid="cart-icon"]');
  await page.waitForSelector('[data-testid="cart-drawer"]');
}

// ── Timing helper ─────────────────────────────────────────────────────────────
export async function measureLoadTime(page: Page, url: string): Promise<number> {
  const start = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  return Date.now() - start;
}

// ── Assertion helpers ─────────────────────────────────────────────────────────
export async function expectToast(page: Page, message: string | RegExp) {
  await expect(page.locator('[data-testid="toast"]')).toContainText(message);
}

export async function expectCartCount(page: Page, count: number) {
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText(String(count));
}
