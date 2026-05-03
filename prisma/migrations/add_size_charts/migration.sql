-- ─── Size Charts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `size_charts` (
  `id`          VARCHAR(191)  NOT NULL,
  `name`        VARCHAR(191)  NOT NULL,
  `description` VARCHAR(191)  NULL,
  `columns`     LONGTEXT      NOT NULL,
  `createdAt`   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)   NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ─── Size Chart Rows ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `size_chart_rows` (
  `id`          VARCHAR(191) NOT NULL,
  `sizeChartId` VARCHAR(191) NOT NULL,
  `sortOrder`   INT          NOT NULL DEFAULT 0,
  `values`      LONGTEXT     NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `size_chart_rows_sizeChartId_idx` (`sizeChartId`),
  CONSTRAINT `size_chart_rows_sizeChartId_fkey`
    FOREIGN KEY (`sizeChartId`) REFERENCES `size_charts`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ─── Category Sizes ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `category_sizes` (
  `id`         VARCHAR(191) NOT NULL,
  `categoryId` VARCHAR(191) NOT NULL,
  `label`      VARCHAR(191) NOT NULL,
  `sortOrder`  INT          NOT NULL DEFAULT 0,
  `isActive`   BOOLEAN      NOT NULL DEFAULT true,
  PRIMARY KEY (`id`),
  INDEX `category_sizes_categoryId_idx` (`categoryId`),
  CONSTRAINT `category_sizes_categoryId_fkey`
    FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ─── Add columns to products ──────────────────────────────────────────────────
ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `sizeChartId` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `metaTitle`   VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `metaDesc`    LONGTEXT     NULL,
  ADD COLUMN IF NOT EXISTS `tags`        LONGTEXT     NULL;

ALTER TABLE `products`
  ADD INDEX IF NOT EXISTS `products_sizeChartId_idx` (`sizeChartId`);

-- ─── Add sizeChartId to categories ───────────────────────────────────────────
ALTER TABLE `categories`
  ADD COLUMN IF NOT EXISTS `sizeChartId` VARCHAR(191) NULL;

ALTER TABLE `categories`
  ADD INDEX IF NOT EXISTS `categories_sizeChartId_idx` (`sizeChartId`);

-- ─── Add columns to product_variants (if missing) ─────────────────────────────
ALTER TABLE `product_variants`
  ADD COLUMN IF NOT EXISTS `weight`      DECIMAL(8,2) NULL,
  ADD COLUMN IF NOT EXISTS `reservedQty` INT          NOT NULL DEFAULT 0;

-- ─── Site Settings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `site_settings` (
  `key`       VARCHAR(191)  NOT NULL,
  `value`     LONGTEXT      NOT NULL,
  `updatedAt` DATETIME(3)   NOT NULL,
  PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
