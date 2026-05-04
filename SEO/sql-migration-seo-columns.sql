-- ============================================================
-- SEO Columns Migration — Togor & Tweed
-- Generated: May 2026
-- Apply manually on the live MySQL database.
-- Each statement uses IF NOT EXISTS so it is safe to re-run.
-- ============================================================

-- ── products table ──────────────────────────────────────────
-- Add metaKeywords (metaTitle and metaDesc already exist)

ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `metaKeywords` TEXT NULL
  COMMENT 'Comma-separated meta keywords for the product page';


-- ── categories table ────────────────────────────────────────
-- Add all four SEO meta columns

ALTER TABLE `categories`
  ADD COLUMN IF NOT EXISTS `metaTitle` VARCHAR(255) NULL
  COMMENT 'Custom meta title for the collection page (≤70 chars)';

ALTER TABLE `categories`
  ADD COLUMN IF NOT EXISTS `metaDesc` TEXT NULL
  COMMENT 'Custom meta description for the collection page (≤155 chars)';

ALTER TABLE `categories`
  ADD COLUMN IF NOT EXISTS `metaKeywords` TEXT NULL
  COMMENT 'Comma-separated meta keywords for the collection page';

ALTER TABLE `categories`
  ADD COLUMN IF NOT EXISTS `ogImageUrl` VARCHAR(1024) NULL
  COMMENT 'Custom OG image URL (1200×630) for social sharing — overrides banner image';


-- ── Verification queries (run after migration to confirm) ────
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
-- FROM information_schema.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME IN ('products', 'categories')
--   AND COLUMN_NAME IN ('metaTitle', 'metaDesc', 'metaKeywords', 'ogImageUrl')
-- ORDER BY TABLE_NAME, COLUMN_NAME;
