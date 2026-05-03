-- CreateIndex for FULLTEXT search on Product (name, tags)
CREATE FULLTEXT INDEX `products_name_tags_ft` ON `products` (`name`, `tags`);
