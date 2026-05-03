-- ═══════════════════════════════════════════════════════════
--  Togor & Tweed — Full Schema SQL
--  Safe to run on existing DB: IF NOT EXISTS skips present tables
--  Run in phpMyAdmin → SQL tab
-- ═══════════════════════════════════════════════════════════

SET FOREIGN_KEY_CHECKS = 0;

-- ── USERS & AUTH ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `users` (
  `id`            VARCHAR(191) NOT NULL,
  `email`         VARCHAR(191) NOT NULL,
  `emailVerified` DATETIME(3)  NULL,
  `name`          VARCHAR(191) NULL,
  `phone`         VARCHAR(191) NULL,
  `passwordHash`  VARCHAR(191) NULL,
  `image`         VARCHAR(191) NULL,
  `role`          ENUM('CUSTOMER','ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `createdAt`     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id`                VARCHAR(191) NOT NULL,
  `userId`            VARCHAR(191) NOT NULL,
  `type`              VARCHAR(191) NOT NULL,
  `provider`          VARCHAR(191) NOT NULL,
  `providerAccountId` VARCHAR(191) NOT NULL,
  `refresh_token`     TEXT NULL,
  `access_token`      TEXT NULL,
  `expires_at`        INT NULL,
  `token_type`        VARCHAR(191) NULL,
  `scope`             VARCHAR(191) NULL,
  `id_token`          TEXT NULL,
  `session_state`     VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_provider_providerAccountId_key` (`provider`, `providerAccountId`),
  KEY `accounts_userId_fkey` (`userId`),
  CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id`           VARCHAR(191) NOT NULL,
  `sessionToken` VARCHAR(191) NOT NULL,
  `userId`       VARCHAR(191) NOT NULL,
  `expires`      DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessions_sessionToken_key` (`sessionToken`),
  KEY `sessions_userId_fkey` (`userId`),
  CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `verification_tokens` (
  `identifier` VARCHAR(191) NOT NULL,
  `token`      VARCHAR(191) NOT NULL,
  `expires`    DATETIME(3) NOT NULL,
  UNIQUE KEY `verification_tokens_token_key` (`token`),
  UNIQUE KEY `verification_tokens_identifier_token_key` (`identifier`, `token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ADDRESSES ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `addresses` (
  `id`         VARCHAR(191) NOT NULL,
  `userId`     VARCHAR(191) NOT NULL,
  `firstName`  VARCHAR(191) NOT NULL,
  `lastName`   VARCHAR(191) NOT NULL,
  `company`    VARCHAR(191) NULL,
  `line1`      VARCHAR(191) NOT NULL,
  `line2`      VARCHAR(191) NULL,
  `city`       VARCHAR(191) NOT NULL,
  `state`      VARCHAR(191) NOT NULL,
  `postalCode` VARCHAR(191) NOT NULL,
  `country`    VARCHAR(191) NOT NULL DEFAULT 'BD',
  `phone`      VARCHAR(191) NULL,
  `isDefault`  TINYINT(1)  NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `addresses_userId_fkey` (`userId`),
  CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── SIZE CHARTS (must come before categories & products) ─────

CREATE TABLE IF NOT EXISTS `size_charts` (
  `id`          VARCHAR(191) NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `columns`     TEXT NOT NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `size_chart_rows` (
  `id`          VARCHAR(191) NOT NULL,
  `sizeChartId` VARCHAR(191) NOT NULL,
  `sortOrder`   INT NOT NULL DEFAULT 0,
  `values`      TEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `size_chart_rows_sizeChartId_idx` (`sizeChartId`),
  CONSTRAINT `size_chart_rows_sizeChartId_fkey` FOREIGN KEY (`sizeChartId`) REFERENCES `size_charts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── CATEGORIES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `categories` (
  `id`          VARCHAR(191) NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `slug`        VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `imageUrl`    VARCHAR(191) NULL,
  `parentId`    VARCHAR(191) NULL,
  `sizeChartId` VARCHAR(191) NULL,
  `sortOrder`   INT NOT NULL DEFAULT 0,
  `isActive`    TINYINT(1) NOT NULL DEFAULT 1,
  `seoSections` JSON NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_key` (`slug`),
  KEY `categories_slug_idx` (`slug`),
  KEY `categories_sizeChartId_idx` (`sizeChartId`),
  KEY `categories_parentId_fkey` (`parentId`),
  CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `categories_sizeChartId_fkey` FOREIGN KEY (`sizeChartId`) REFERENCES `size_charts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `category_sizes` (
  `id`         VARCHAR(191) NOT NULL,
  `categoryId` VARCHAR(191) NOT NULL,
  `label`      VARCHAR(191) NOT NULL,
  `sortOrder`  INT NOT NULL DEFAULT 0,
  `isActive`   TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_sizes_categoryId_label_key` (`categoryId`, `label`),
  KEY `category_sizes_categoryId_idx` (`categoryId`),
  CONSTRAINT `category_sizes_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── PRODUCTS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `products` (
  `id`          VARCHAR(191) NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `slug`        VARCHAR(191) NOT NULL,
  `description` LONGTEXT NULL,
  `categoryId`  VARCHAR(191) NOT NULL,
  `basePrice`   DECIMAL(10,2) NOT NULL,
  `salePrice`   DECIMAL(10,2) NULL,
  `brand`       VARCHAR(191) NULL,
  `tags`        TEXT NULL,
  `isFeatured`  TINYINT(1) NOT NULL DEFAULT 0,
  `isActive`    TINYINT(1) NOT NULL DEFAULT 1,
  `metaTitle`   VARCHAR(191) NULL,
  `metaDesc`    TEXT NULL,
  `sizeChartId` VARCHAR(191) NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_key` (`slug`),
  KEY `products_slug_idx` (`slug`),
  KEY `products_categoryId_idx` (`categoryId`),
  KEY `products_isFeatured_idx` (`isFeatured`),
  KEY `products_sizeChartId_idx` (`sizeChartId`),
  FULLTEXT KEY `products_name_tags_idx` (`name`, `tags`),
  CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`),
  CONSTRAINT `products_sizeChartId_fkey` FOREIGN KEY (`sizeChartId`) REFERENCES `size_charts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_images` (
  `id`        VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `url`       VARCHAR(191) NOT NULL,
  `publicId`  VARCHAR(191) NOT NULL,
  `altText`   VARCHAR(191) NULL,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isDefault` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `product_images_productId_fkey` (`productId`),
  CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_variants` (
  `id`          VARCHAR(191) NOT NULL,
  `productId`   VARCHAR(191) NOT NULL,
  `sku`         VARCHAR(191) NOT NULL,
  `size`        VARCHAR(191) NULL,
  `color`       VARCHAR(191) NULL,
  `colorHex`    VARCHAR(191) NULL,
  `price`       DECIMAL(10,2) NULL,
  `salePrice`   DECIMAL(10,2) NULL,
  `stock`       INT NOT NULL DEFAULT 0,
  `reservedQty` INT NOT NULL DEFAULT 0,
  `weight`      DECIMAL(8,2) NULL,
  `isActive`    TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_variants_sku_key` (`sku`),
  KEY `product_variants_productId_idx` (`productId`),
  KEY `product_variants_sku_idx` (`sku`),
  CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── CART ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `carts` (
  `id`        VARCHAR(191) NOT NULL,
  `userId`    VARCHAR(191) NULL,
  `sessionId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `expiresAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_userId_key` (`userId`),
  UNIQUE KEY `carts_sessionId_key` (`sessionId`),
  CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cart_items` (
  `id`        VARCHAR(191) NOT NULL,
  `cartId`    VARCHAR(191) NOT NULL,
  `variantId` VARCHAR(191) NOT NULL,
  `quantity`  INT NOT NULL,
  `addedAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_cartId_variantId_key` (`cartId`, `variantId`),
  KEY `cart_items_variantId_fkey` (`variantId`),
  CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── WISHLIST ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `wishlists` (
  `id`        VARCHAR(191) NOT NULL,
  `userId`    VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `addedAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlists_userId_productId_key` (`userId`, `productId`),
  KEY `wishlists_productId_fkey` (`productId`),
  CONSTRAINT `wishlists_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ORDERS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `orders` (
  `id`                  VARCHAR(191) NOT NULL,
  `orderNumber`         VARCHAR(191) NOT NULL,
  `userId`              VARCHAR(191) NOT NULL,
  `addressId`           VARCHAR(191) NOT NULL,
  `status`              ENUM('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `paymentStatus`       ENUM('UNPAID','PAID','PARTIALLY_REFUNDED','REFUNDED') NOT NULL DEFAULT 'UNPAID',
  `paymentMethod`       VARCHAR(191) NULL,
  `paymentIntentId`     VARCHAR(191) NULL,
  `subtotal`            DECIMAL(10,2) NOT NULL,
  `discountAmount`      DECIMAL(10,2) NOT NULL DEFAULT 0,
  `shippingCost`        DECIMAL(10,2) NOT NULL DEFAULT 0,
  `taxAmount`           DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total`               DECIMAL(10,2) NOT NULL,
  `couponCode`          VARCHAR(191) NULL,
  `notes`               TEXT NULL,
  `pathaoConsignmentId` VARCHAR(191) NULL,
  `pathaoTrackingCode`  VARCHAR(191) NULL,
  `pathaoStatus`        VARCHAR(191) NULL,
  `pathaoCreatedAt`     DATETIME(3) NULL,
  `createdAt`           DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`           DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_orderNumber_key` (`orderNumber`),
  UNIQUE KEY `orders_paymentIntentId_key` (`paymentIntentId`),
  KEY `orders_userId_idx` (`userId`),
  KEY `orders_orderNumber_idx` (`orderNumber`),
  KEY `orders_addressId_fkey` (`addressId`),
  CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `addresses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id`          VARCHAR(191) NOT NULL,
  `orderId`     VARCHAR(191) NOT NULL,
  `productId`   VARCHAR(191) NOT NULL,
  `variantId`   VARCHAR(191) NOT NULL,
  `productName` VARCHAR(191) NOT NULL,
  `variantSku`  VARCHAR(191) NOT NULL,
  `size`        VARCHAR(191) NULL,
  `color`       VARCHAR(191) NULL,
  `imageUrl`    VARCHAR(191) NULL,
  `quantity`    INT NOT NULL,
  `unitPrice`   DECIMAL(10,2) NOT NULL,
  `totalPrice`  DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_orderId_fkey` (`orderId`),
  KEY `order_items_productId_fkey` (`productId`),
  KEY `order_items_variantId_fkey` (`variantId`),
  CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── COUPONS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `coupons` (
  `id`             VARCHAR(191) NOT NULL,
  `code`           VARCHAR(191) NOT NULL,
  `description`    VARCHAR(191) NULL,
  `discountType`   VARCHAR(191) NOT NULL,
  `discountValue`  DECIMAL(10,2) NOT NULL,
  `minOrderAmount` DECIMAL(10,2) NULL,
  `maxDiscount`    DECIMAL(10,2) NULL,
  `usageLimit`     INT NULL,
  `usageCount`     INT NOT NULL DEFAULT 0,
  `isActive`       TINYINT(1) NOT NULL DEFAULT 1,
  `showOnBanner`   TINYINT(1) NOT NULL DEFAULT 0,
  `bannerLabel`    VARCHAR(191) NULL,
  `expiresAt`      DATETIME(3) NULL,
  `createdAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── REVIEWS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `reviews` (
  `id`         VARCHAR(191) NOT NULL,
  `productId`  VARCHAR(191) NOT NULL,
  `userId`     VARCHAR(191) NOT NULL,
  `rating`     INT NOT NULL,
  `title`      VARCHAR(191) NULL,
  `body`       TEXT NULL,
  `isVerified` TINYINT(1) NOT NULL DEFAULT 0,
  `isApproved` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`  DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_productId_userId_key` (`productId`, `userId`),
  KEY `reviews_productId_idx` (`productId`),
  KEY `reviews_userId_fkey` (`userId`),
  CONSTRAINT `reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── SITE SETTINGS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `site_settings` (
  `key`       VARCHAR(191) NOT NULL,
  `value`     TEXT NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ═══════════════════════════════════════════════════════════
--  MIGRATIONS — run these on an EXISTING database
--  (tables created from this file already have the changes;
--   run only if your DB was created before these were added)
-- ═══════════════════════════════════════════════════════════

-- ── Add SUPER_ADMIN to role enum (if not already present) ────
ALTER TABLE `users`
  MODIFY `role` ENUM('CUSTOMER','ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'CUSTOMER';

-- ── Promote a user to SUPER_ADMIN ────────────────────────────
--  Replace the email below with the account you registered on the site
-- UPDATE `users` SET `role` = 'SUPER_ADMIN' WHERE `email` = 'your@email.com';
