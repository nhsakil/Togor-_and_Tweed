import { PrismaClient, Role, OrderStatus, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.review.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.address.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const adminHash = await bcrypt.hash('Admin@123', 10)
  const admin = await prisma.user.create({
    data: { email: 'admin@togor.com', name: 'Admin User', passwordHash: adminHash, role: Role.ADMIN, emailVerified: new Date() },
  })
  console.log('  Created admin:', admin.email)

  const customerHash = await bcrypt.hash('Customer@123', 10)
  const customer = await prisma.user.create({
    data: { email: 'customer@togor.com', name: 'Jane Doe', phone: '+8801711000001', passwordHash: customerHash, role: Role.CUSTOMER, emailVerified: new Date() },
  })
  console.log('  Created customer:', customer.email)

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Shirts',   slug: 'shirts',   description: 'Premium formal and casual shirts for men',          sortOrder: 1, isActive: true } }),
    prisma.category.create({ data: { name: 'Panjabi',  slug: 'panjabi',  description: 'Traditional and designer Panjabi for all occasions', sortOrder: 2, isActive: true } }),
    prisma.category.create({ data: { name: 'T-Shirt',  slug: 't-shirt',  description: 'Casual and graphic t-shirts for everyday wear',      sortOrder: 3, isActive: true } }),
    prisma.category.create({ data: { name: 'Polo',     slug: 'polo',     description: 'Classic and slim-fit polo shirts',                   sortOrder: 4, isActive: true } }),
    prisma.category.create({ data: { name: 'Trousers', slug: 'trousers', description: 'Tailored trousers, chinos and formal pants',         sortOrder: 5, isActive: true } }),
  ])
  const [shirts, panjabi, tshirt, polo, trousers] = categories
  console.log('  Created 5 categories')

  const productsData = [
    // ── SHIRTS (3) ──────────────────────────────────────────────────
    {
      name: 'Classic Oxford Shirt', slug: 'classic-oxford-shirt',
      categoryId: shirts.id, basePrice: 1250, salePrice: null,
      brand: 'Togor & Tweed', isFeatured: true,
      description: 'A timeless Oxford shirt crafted from premium cotton. Versatile enough for the office or a casual outing.',
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
      variants: [
        { size: 'S',  color: 'White',   colorHex: '#FFFFFF', sku: 'TOS-001-S-W',   stock: 15, price: null },
        { size: 'M',  color: 'White',   colorHex: '#FFFFFF', sku: 'TOS-001-M-W',   stock: 20, price: null },
        { size: 'L',  color: 'White',   colorHex: '#FFFFFF', sku: 'TOS-001-L-W',   stock: 10, price: null },
        { size: 'M',  color: 'Blue',    colorHex: '#4A90D9', sku: 'TOS-001-M-B',   stock: 18, price: null },
        { size: 'L',  color: 'Blue',    colorHex: '#4A90D9', sku: 'TOS-001-L-B',   stock: 12, price: null },
        { size: 'XL', color: 'Blue',    colorHex: '#4A90D9', sku: 'TOS-001-XL-B',  stock:  8, price: null },
      ],
    },
    {
      name: 'Slim Fit Formal Shirt', slug: 'slim-fit-formal-shirt',
      categoryId: shirts.id, basePrice: 1450, salePrice: 1199,
      brand: 'Togor & Tweed', isFeatured: true,
      description: 'Slim-fit formal shirt with spread collar — perfect for office and events. 100% cotton poplin.',
      imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600',
      variants: [
        { size: 'S',   color: 'Sky Blue', colorHex: '#87CEEB', sku: 'TSF-002-S-SB',  stock: 12, price: 1199 },
        { size: 'M',   color: 'Sky Blue', colorHex: '#87CEEB', sku: 'TSF-002-M-SB',  stock: 20, price: 1199 },
        { size: 'L',   color: 'Sky Blue', colorHex: '#87CEEB', sku: 'TSF-002-L-SB',  stock: 14, price: 1199 },
        { size: 'XL',  color: 'White',    colorHex: '#FFFFFF', sku: 'TSF-002-XL-W',  stock:  8, price: 1199 },
        { size: 'XXL', color: 'White',    colorHex: '#FFFFFF', sku: 'TSF-002-XXL-W', stock:  5, price: 1199 },
      ],
    },
    {
      name: 'Linen Check Casual Shirt', slug: 'linen-check-casual-shirt',
      categoryId: shirts.id, basePrice: 1100, salePrice: null,
      brand: 'Togor & Tweed', isFeatured: false,
      description: 'Breathable linen-blend check shirt ideal for weekends and casual occasions. Easy-iron finish.',
      imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600',
      variants: [
        { size: 'S',   color: 'Green',  colorHex: '#4A7C59', sku: 'TLC-003-S-GR',   stock: 10, price: null },
        { size: 'M',   color: 'Green',  colorHex: '#4A7C59', sku: 'TLC-003-M-GR',   stock: 18, price: null },
        { size: 'L',   color: 'Green',  colorHex: '#4A7C59', sku: 'TLC-003-L-GR',   stock: 12, price: null },
        { size: 'M',   color: 'Beige',  colorHex: '#D9C9A3', sku: 'TLC-003-M-BE',   stock: 15, price: null },
        { size: 'L',   color: 'Beige',  colorHex: '#D9C9A3', sku: 'TLC-003-L-BE',   stock: 10, price: null },
        { size: 'XL',  color: 'Beige',  colorHex: '#D9C9A3', sku: 'TLC-003-XL-BE',  stock:  6, price: null },
      ],
    },
    // ── PANJABI (3) ─────────────────────────────────────────────────
    {
      name: 'Premium Eid Panjabi', slug: 'premium-eid-panjabi',
      categoryId: panjabi.id, basePrice: 2200, salePrice: null,
      brand: 'Togor & Tweed', isFeatured: true,
      description: 'Exquisitely embroidered Panjabi in soft cotton — ideal for Eid and weddings.',
      imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
      variants: [
        { size: 'S',   color: 'Off-White', colorHex: '#FAF0E6', sku: 'TEP-004-S-OW',   stock: 10, price: null },
        { size: 'M',   color: 'Off-White', colorHex: '#FAF0E6', sku: 'TEP-004-M-OW',   stock: 18, price: null },
        { size: 'L',   color: 'Off-White', colorHex: '#FAF0E6', sku: 'TEP-004-L-OW',   stock: 15, price: null },
        { size: 'XL',  color: 'Cream',     colorHex: '#FFFDD0', sku: 'TEP-004-XL-CR',  stock: 10, price: null },
        { size: 'XXL', color: 'Cream',     colorHex: '#FFFDD0', sku: 'TEP-004-XXL-CR', stock:  6, price: null },
      ],
    },
    {
      name: 'Casual Linen Panjabi', slug: 'casual-linen-panjabi',
      categoryId: panjabi.id, basePrice: 1650, salePrice: 1350,
      brand: 'Togor & Tweed', isFeatured: false,
      description: 'Lightweight linen Panjabi for everyday wear — breathable and comfortable in Bangladesh weather.',
      imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',
      variants: [
        { size: 'M',   color: 'Beige', colorHex: '#F5F5DC', sku: 'TLP-005-M-BE',   stock: 20, price: 1350 },
        { size: 'L',   color: 'Beige', colorHex: '#F5F5DC', sku: 'TLP-005-L-BE',   stock: 18, price: 1350 },
        { size: 'XL',  color: 'Grey',  colorHex: '#808080', sku: 'TLP-005-XL-GR',  stock: 12, price: 1350 },
        { size: 'XXL', color: 'Grey',  colorHex: '#808080', sku: 'TLP-005-XXL-GR', stock:  8, price: 1350 },
      ],
    },
    {
      name: 'Classic Katan Silk Panjabi', slug: 'classic-katan-silk-panjabi',
      categoryId: panjabi.id, basePrice: 3200, salePrice: null,
      brand: 'Togor & Tweed', isFeatured: true,
      description: 'Pure Katan silk Panjabi with hand-embroidered motifs. A masterpiece for weddings and grand occasions.',
      imageUrl: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=600',
      variants: [
        { size: 'M',   color: 'Gold',   colorHex: '#D4AF37', sku: 'TKS-006-M-GD',   stock:  8, price: null },
        { size: 'L',   color: 'Gold',   colorHex: '#D4AF37', sku: 'TKS-006-L-GD',   stock: 10, price: null },
        { size: 'XL',  color: 'Gold',   colorHex: '#D4AF37', sku: 'TKS-006-XL-GD',  stock:  6, price: null },
        { size: 'L',   color: 'Maroon', colorHex: '#800000', sku: 'TKS-006-L-MR',   stock:  8, price: null },
        { size: 'XL',  color: 'Maroon', colorHex: '#800000', sku: 'TKS-006-XL-MR',  stock:  5, price: null },
      ],
    },
    // ── T-SHIRT (3) ─────────────────────────────────────────────────
    {
      name: 'Essential Crew Neck T-Shirt', slug: 'essential-crew-neck-tshirt',
      categoryId: tshirt.id, basePrice: 650, salePrice: null,
      brand: 'Togor & Tweed', isFeatured: true,
      description: 'Everyday crew-neck tee in 100% combed cotton — soft, durable, and versatile for any look.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      variants: [
        { size: 'S',   color: 'Black', colorHex: '#000000', sku: 'TEC-007-S-BK',   stock: 25, price: null },
        { size: 'M',   color: 'Black', colorHex: '#000000', sku: 'TEC-007-M-BK',   stock: 30, price: null },
        { size: 'L',   color: 'Black', colorHex: '#000000', sku: 'TEC-007-L-BK',   stock: 20, price: null },
        { size: 'M',   color: 'White', colorHex: '#FFFFFF', sku: 'TEC-007-M-W',    stock: 25, price: null },
        { size: 'L',   color: 'White', colorHex: '#FFFFFF', sku: 'TEC-007-L-W',    stock: 18, price: null },
        { size: 'XL',  color: 'Navy',  colorHex: '#1B2A4A', sku: 'TEC-007-XL-NV',  stock: 15, price: null },
        { size: 'XXL', color: 'Navy',  colorHex: '#1B2A4A', sku: 'TEC-007-XXL-NV', stock: 10, price: null },
      ],
    },
    {
      name: 'Graphic Print T-Shirt', slug: 'graphic-print-tshirt',
      categoryId: tshirt.id, basePrice: 850, salePrice: 699,
      brand: 'Togor & Tweed', isFeatured: false,
      description: 'Bold graphic print on premium cotton — stand out from the crowd with artistic street-style prints.',
      imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600',
      variants: [
        { size: 'S',  color: 'White',    colorHex: '#FFFFFF', sku: 'TGP-008-S-W',   stock: 15, price: 699 },
        { size: 'M',  color: 'White',    colorHex: '#FFFFFF', sku: 'TGP-008-M-W',   stock: 20, price: 699 },
        { size: 'L',  color: 'White',    colorHex: '#FFFFFF', sku: 'TGP-008-L-W',   stock: 12, price: 699 },
        { size: 'M',  color: 'Charcoal', colorHex: '#36454F', sku: 'TGP-008-M-CH',  stock: 10, price: 699 },
        { size: 'XL', color: 'Charcoal', colorHex: '#36454F', sku: 'TGP-008-XL-CH', stock:  8, price: 699 },
      ],
    },
    {
      name: 'V-Neck Henley T-Shirt', slug: 'vneck-henley-tshirt',
      categoryId: tshirt.id, basePrice: 750, salePrice: null,
      brand: 'Togor & Tweed', isFeatured: false,
      description: 'Stylish V-neck Henley with button placket. Soft slub cotton for a relaxed yet put-together look.',
      imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600',
      variants: [
        { size: 'S',  color: 'Grey',    colorHex: '#888888', sku: 'TVH-009-S-GR',  stock: 12, price: null },
        { size: 'M',  color: 'Grey',    colorHex: '#888888', sku: 'TVH-009-M-GR',  stock: 18, price: null },
        { size: 'L',  color: 'Grey',    colorHex: '#888888', sku: 'TVH-009-L-GR',  stock: 14, price: null },
        { size: 'M',  color: 'Olive',   colorHex: '#6B7C2A', sku: 'TVH-009-M-OL',  stock: 10, price: null },
        { size: 'L',  color: 'Olive',   colorHex: '#6B7C2A', sku: 'TVH-009-L-OL',  stock:  8, price: null },
        { size: 'XL', color: 'Olive',   colorHex: '#6B7C2A', sku: 'TVH-009-XL-OL', stock:  6, price: null },
      ],
    },
    // ── POLO (3) ────────────────────────────────────────────────────
    {
      name: 'Classic Pique Polo', slug: 'classic-pique-polo',
      categoryId: polo.id, basePrice: 1100, salePrice: null,
      brand: 'Togor & Tweed', isFeatured: true,
      description: 'Classic pique polo in premium cotton with ribbed collar and cuffs. A wardrobe staple.',
      imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
      variants: [
        { size: 'S',   color: 'Navy',   colorHex: '#1B2A4A', sku: 'TCP-010-S-NV',   stock: 20, price: null },
        { size: 'M',   color: 'Navy',   colorHex: '#1B2A4A', sku: 'TCP-010-M-NV',   stock: 25, price: null },
        { size: 'L',   color: 'Navy',   colorHex: '#1B2A4A', sku: 'TCP-010-L-NV',   stock: 18, price: null },
        { size: 'M',   color: 'White',  colorHex: '#FFFFFF', sku: 'TCP-010-M-W',    stock: 20, price: null },
        { size: 'L',   color: 'White',  colorHex: '#FFFFFF', sku: 'TCP-010-L-W',    stock: 15, price: null },
        { size: 'XL',  color: 'Green',  colorHex: '#2E7D32', sku: 'TCP-010-XL-FG',  stock: 10, price: null },
        { size: 'XXL', color: 'Green',  colorHex: '#2E7D32', sku: 'TCP-010-XXL-FG', stock:  6, price: null },
      ],
    },
    {
      name: 'Slim Fit Stretch Polo', slug: 'slim-fit-stretch-polo',
      categoryId: polo.id, basePrice: 1350, salePrice: 1099,
      brand: 'Togor & Tweed', isFeatured: false,
      description: 'Modern slim-fit polo with 4-way stretch fabric for all-day comfort. Perfect for active days.',
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
      variants: [
        { size: 'S',  color: 'Sky Blue', colorHex: '#87CEEB', sku: 'TSP-011-S-SB',  stock: 14, price: 1099 },
        { size: 'M',  color: 'Sky Blue', colorHex: '#87CEEB', sku: 'TSP-011-M-SB',  stock: 20, price: 1099 },
        { size: 'L',  color: 'Sky Blue', colorHex: '#87CEEB', sku: 'TSP-011-L-SB',  stock: 16, price: 1099 },
        { size: 'XL', color: 'Burgundy', colorHex: '#800020', sku: 'TSP-011-XL-BU', stock: 10, price: 1099 },
      ],
    },
    {
      name: 'Active Dry-Fit Polo', slug: 'active-dry-fit-polo',
      categoryId: polo.id, basePrice: 950, salePrice: null,
      brand: 'Togor & Tweed', isFeatured: false,
      description: 'Moisture-wicking dry-fit polo for sports and active wear. Lightweight and quick-drying.',
      imageUrl: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600',
      variants: [
        { size: 'S',  color: 'Red',   colorHex: '#E00000', sku: 'TAD-012-S-RD',  stock: 15, price: null },
        { size: 'M',  color: 'Red',   colorHex: '#E00000', sku: 'TAD-012-M-RD',  stock: 20, price: null },
        { size: 'L',  color: 'Red',   colorHex: '#E00000', sku: 'TAD-012-L-RD',  stock: 12, price: null },
        { size: 'M',  color: 'Black', colorHex: '#000000', sku: 'TAD-012-M-BK',  stock: 18, price: null },
        { size: 'L',  color: 'Black', colorHex: '#000000', sku: 'TAD-012-L-BK',  stock: 14, price: null },
        { size: 'XL', color: 'Black', colorHex: '#000000', sku: 'TAD-012-XL-BK', stock:  8, price: null },
      ],
    },
    // ── TROUSERS (3) ────────────────────────────────────────────────
    {
      name: 'Slim Fit Chinos', slug: 'slim-fit-chinos',
      categoryId: trousers.id, basePrice: 1800, salePrice: null,
      brand: 'Togor & Tweed', isFeatured: true,
      description: 'Modern slim fit chinos in stretch cotton — sharp and comfortable all day.',
      imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
      variants: [
        { size: 'S',   color: 'Khaki', colorHex: '#C3B091', sku: 'TSC-013-S-K',    stock: 12, price: null },
        { size: 'M',   color: 'Khaki', colorHex: '#C3B091', sku: 'TSC-013-M-K',    stock: 20, price: null },
        { size: 'L',   color: 'Khaki', colorHex: '#C3B091', sku: 'TSC-013-L-K',    stock:  8, price: null },
        { size: 'M',   color: 'Navy',  colorHex: '#1B2A4A', sku: 'TSC-013-M-N',    stock: 15, price: null },
        { size: 'L',   color: 'Navy',  colorHex: '#1B2A4A', sku: 'TSC-013-L-N',    stock: 12, price: null },
        { size: 'XL',  color: 'Black', colorHex: '#000000', sku: 'TSC-013-XL-BK',  stock: 10, price: null },
        { size: 'XXL', color: 'Black', colorHex: '#000000', sku: 'TSC-013-XXL-BK', stock:  6, price: null },
      ],
    },
    {
      name: 'Tailored Formal Trousers', slug: 'tailored-formal-trousers',
      categoryId: trousers.id, basePrice: 2100, salePrice: 1699,
      brand: 'Togor & Tweed', isFeatured: true,
      description: 'Perfectly tailored formal trousers — essential for the office and formal occasions.',
      imageUrl: 'https://images.unsplash.com/photo-1594938374182-a57f52c90a14?w=600',
      variants: [
        { size: 'S',   color: 'Charcoal', colorHex: '#36454F', sku: 'TTF-014-S-CH',   stock: 10, price: 1699 },
        { size: 'M',   color: 'Charcoal', colorHex: '#36454F', sku: 'TTF-014-M-CH',   stock: 15, price: 1699 },
        { size: 'L',   color: 'Charcoal', colorHex: '#36454F', sku: 'TTF-014-L-CH',   stock: 12, price: 1699 },
        { size: 'M',   color: 'Black',    colorHex: '#000000', sku: 'TTF-014-M-BK',   stock: 18, price: 1699 },
        { size: 'L',   color: 'Black',    colorHex: '#000000', sku: 'TTF-014-L-BK',   stock: 14, price: 1699 },
        { size: 'XL',  color: 'Black',    colorHex: '#000000', sku: 'TTF-014-XL-BK',  stock:  8, price: 1699 },
        { size: 'XXL', color: 'Navy',     colorHex: '#1B2A4A', sku: 'TTF-014-XXL-NV', stock:  5, price: 1699 },
      ],
    },
    {
      name: 'Relaxed Cargo Trousers', slug: 'relaxed-cargo-trousers',
      categoryId: trousers.id, basePrice: 1600, salePrice: null,
      brand: 'Togor & Tweed', isFeatured: false,
      description: 'Relaxed-fit cargo trousers with utility pockets. Comfortable for everyday street style.',
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
      variants: [
        { size: 'S',  color: 'Olive',   colorHex: '#6B7C2A', sku: 'TRC-015-S-OL',  stock: 12, price: null },
        { size: 'M',  color: 'Olive',   colorHex: '#6B7C2A', sku: 'TRC-015-M-OL',  stock: 18, price: null },
        { size: 'L',  color: 'Olive',   colorHex: '#6B7C2A', sku: 'TRC-015-L-OL',  stock: 14, price: null },
        { size: 'M',  color: 'Khaki',   colorHex: '#C3B091', sku: 'TRC-015-M-KH',  stock: 12, price: null },
        { size: 'L',  color: 'Khaki',   colorHex: '#C3B091', sku: 'TRC-015-L-KH',  stock: 10, price: null },
        { size: 'XL', color: 'Charcoal',colorHex: '#36454F', sku: 'TRC-015-XL-CH', stock:  8, price: null },
      ],
    },
  ]

  console.log('Creating products...')
  const createdProducts = []
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, description: p.description,
        categoryId: p.categoryId, basePrice: p.basePrice, salePrice: p.salePrice,
        brand: p.brand, isFeatured: p.isFeatured, isActive: true,
        images: { create: [{ url: p.imageUrl, publicId: p.slug, isDefault: true, sortOrder: 0 }] },
        variants: {
          create: p.variants.map(v => ({
            sku: v.sku, size: v.size, color: v.color, colorHex: v.colorHex,
            stock: v.stock, price: v.price, isActive: true,
          }))
        }
      }
    })
    createdProducts.push(product)
    console.log(`  + ${p.name}`)
  }

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      firstName: 'Jane', lastName: 'Doe', phone: '01711000001',
      line1: 'House 12, Road 5, Dhanmondi', city: 'Dhaka',
      state: 'Dhaka', postalCode: '1205', country: 'BD', isDefault: true,
    },
  })

  // Sample orders
  const shirt0Variant = await prisma.productVariant.findFirst({ where: { productId: createdProducts[0].id } })
  const polo0Variant  = await prisma.productVariant.findFirst({ where: { productId: createdProducts[9].id } })
  const trouser0Var   = await prisma.productVariant.findFirst({ where: { productId: createdProducts[12].id } })

  if (shirt0Variant) {
    await prisma.order.create({ data: {
      orderNumber: 'TT-2026-A001', userId: customer.id, addressId: address.id,
      status: OrderStatus.DELIVERED, paymentStatus: PaymentStatus.PAID, paymentMethod: 'cod',
      subtotal: 1250, shippingCost: 60, total: 1310,
      items: { create: [{ productId: createdProducts[0].id, variantId: shirt0Variant.id,
        productName: createdProducts[0].name, variantSku: shirt0Variant.sku,
        size: shirt0Variant.size, color: shirt0Variant.color, quantity: 1, unitPrice: 1250, totalPrice: 1250 }] },
    }})
  }
  if (polo0Variant) {
    await prisma.order.create({ data: {
      orderNumber: 'TT-2026-B002', userId: customer.id, addressId: address.id,
      status: OrderStatus.SHIPPED, paymentStatus: PaymentStatus.PAID, paymentMethod: 'bkash',
      subtotal: 1100, shippingCost: 60, total: 1160,
      items: { create: [{ productId: createdProducts[9].id, variantId: polo0Variant.id,
        productName: createdProducts[9].name, variantSku: polo0Variant.sku,
        size: polo0Variant.size, color: polo0Variant.color, quantity: 1, unitPrice: 1100, totalPrice: 1100 }] },
    }})
  }
  if (trouser0Var) {
    await prisma.order.create({ data: {
      orderNumber: 'TT-2026-C003', userId: customer.id, addressId: address.id,
      status: OrderStatus.PENDING, paymentStatus: PaymentStatus.UNPAID, paymentMethod: 'cod',
      subtotal: 1800, shippingCost: 0, total: 1800,
      items: { create: [{ productId: createdProducts[12].id, variantId: trouser0Var.id,
        productName: createdProducts[12].name, variantSku: trouser0Var.sku,
        size: trouser0Var.size, color: trouser0Var.color, quantity: 1, unitPrice: 1800, totalPrice: 1800 }] },
    }})
  }

  await prisma.review.create({
    data: {
      productId: createdProducts[0].id, userId: customer.id, rating: 5,
      title: 'Excellent quality!',
      body: 'The Oxford shirt is beautifully made and fits perfectly. Highly recommend!',
      isVerified: true, isApproved: true,
    },
  })

  console.log('\n\u2705 Seed complete!')
  console.log('   Admin:    admin@togor.com    / Admin@123')
  console.log('   Customer: customer@togor.com / Customer@123')
  console.log(`   Products: ${createdProducts.length} (3 per category)`)
  console.log('   Categories: 5')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
