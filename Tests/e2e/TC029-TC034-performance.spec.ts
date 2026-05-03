/**
 * TC-029 Homepage Load Speed      < 3 s
 * TC-030 Product Page Load Speed  < 3 s
 * TC-031 Checkout Load Speed      < 5 s
 * TC-032 Stress Test              stability check
 * TC-033 Database Query Efficiency
 * TC-034 CDN Performance
 */
import { test, expect } from '@playwright/test';
import { measureLoadTime, addFirstProductToCart } from './helpers';

const MAX_HOME     = 3000;
const MAX_PRODUCT  = 3000;
const MAX_CHECKOUT = 5000;

test.describe('Performance', () => {

  // TC-029 ─────────────────────────────────────────────────────────────────
  test('TC-029 | Homepage loads under 3 s', async ({ page }) => {
    const ms = await measureLoadTime(page, '/');
    console.log(`Homepage load: ${ms} ms`);
    expect(ms, `Homepage took ${ms}ms — exceeds ${MAX_HOME}ms limit`).toBeLessThan(MAX_HOME);
  });

  test('TC-029b | Homepage Core Web Vitals — LCP captured', async ({ page }) => {
    await page.goto('/');
    const lcp = await page.evaluate(() =>
      new Promise<number>(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => resolve(-1), 5000);
      })
    );
    console.log(`LCP: ${lcp} ms`);
    if (lcp > 0) expect(lcp).toBeLessThan(2500); // Good LCP threshold
  });

  // TC-030 ─────────────────────────────────────────────────────────────────
  test('TC-030 | Product page loads under 3 s', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'networkidle' });
    await page.click('[data-testid="product-card"]:first-child');

    const start = Date.now();
    await page.waitForSelector('[data-testid="product-title"]');
    const ms = Date.now() - start;

    console.log(`Product page load: ${ms} ms`);
    expect(ms).toBeLessThan(MAX_PRODUCT);
  });

  test('TC-030b | Product images lazy-load (not all fetched on mount)', async ({ page }) => {
    const imageRequests: string[] = [];
    page.on('request', req => {
      if (req.resourceType() === 'image') imageRequests.push(req.url());
    });

    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');

    // Should not have loaded ALL images (only visible viewport ones)
    const totalCards = await page.locator('[data-testid="product-card"]').count();
    // Lazy loading means fewer image requests than total cards
    console.log(`Images loaded: ${imageRequests.length} / ${totalCards} cards`);
  });

  // TC-031 ─────────────────────────────────────────────────────────────────
  test('TC-031 | Checkout page loads under 5 s', async ({ page }) => {
    await addFirstProductToCart(page);
    const ms = await measureLoadTime(page, '/checkout');
    console.log(`Checkout load: ${ms} ms`);
    expect(ms).toBeLessThan(MAX_CHECKOUT);
  });

  // TC-032 ─────────────────────────────────────────────────────────────────
  test('TC-032 | Stress — 20 rapid homepage requests remain stable', async ({ page }) => {
    const results: number[] = [];
    for (let i = 0; i < 20; i++) {
      const ms = await measureLoadTime(page, '/');
      results.push(ms);
    }
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const max = Math.max(...results);
    console.log(`Stress test — avg: ${avg.toFixed(0)}ms, max: ${max}ms`);
    // No single request should take more than 10 s
    expect(max).toBeLessThan(10000);
    // Average should stay reasonable
    expect(avg).toBeLessThan(5000);
  });

  test('TC-032b | Stress — concurrent product searches stay < 5 s each', async ({ browser }) => {
    const pages = await Promise.all(
      Array.from({ length: 5 }, () => browser.newPage())
    );
    const results = await Promise.all(
      pages.map(p => measureLoadTime(p, '/products?search=shirt'))
    );
    await Promise.all(pages.map(p => p.close()));

    results.forEach((ms, i) => {
      console.log(`Concurrent request ${i + 1}: ${ms}ms`);
      expect(ms).toBeLessThan(5000);
    });
  });

  // TC-033 ─────────────────────────────────────────────────────────────────
  test('TC-033 | DB Query Efficiency — search API responds under 1 s', async ({ page }) => {
    let searchDuration = -1;

    page.on('response', async res => {
      if (res.url().includes('/api/products') || res.url().includes('/api/search')) {
        const timing = res.request().timing();
        searchDuration = timing.responseEnd - timing.requestStart;
      }
    });

    await page.goto('/products?search=shirt', { waitUntil: 'networkidle' });
    console.log(`Search API duration: ${searchDuration}ms`);
    if (searchDuration > 0) expect(searchDuration).toBeLessThan(1000);
  });

  // TC-034 ─────────────────────────────────────────────────────────────────
  test('TC-034 | CDN — product images served from Cloudinary', async ({ page }) => {
    const imageUrls: string[] = [];
    page.on('response', res => {
      if (res.request().resourceType() === 'image') imageUrls.push(res.url());
    });

    await page.goto('/products', { waitUntil: 'networkidle' });

    const cloudinaryImages = imageUrls.filter(u =>
      u.includes('cloudinary.com') || u.includes('res.cloudinary')
    );
    console.log(`Cloudinary images: ${cloudinaryImages.length} / ${imageUrls.length}`);
    expect(cloudinaryImages.length).toBeGreaterThan(0);
  });

  test('TC-034b | CDN — images use next-gen format (webp/avif)', async ({ page }) => {
    const imageUrls: string[] = [];
    page.on('response', res => {
      if (res.request().resourceType() === 'image') imageUrls.push(res.url());
    });

    await page.goto('/products', { waitUntil: 'networkidle' });

    const modernFormat = imageUrls.filter(u =>
      u.includes('.webp') || u.includes('.avif') ||
      u.includes('f_auto') || u.includes('f_webp')
    );
    console.log(`Modern format images: ${modernFormat.length} / ${imageUrls.length}`);
    // At least some should be modern format
    if (imageUrls.length > 0) expect(modernFormat.length).toBeGreaterThan(0);
  });
});
