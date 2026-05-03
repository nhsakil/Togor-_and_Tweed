import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NEW_CATEGORIES = [
  {
    name: 'Best Sellers',
    slug: 'best-sellers',
    description: 'Our most popular styles',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    sortOrder: 5,
  },
  {
    name: 'Shirts',
    slug: 'shirts',
    description: 'Classic and contemporary shirts',
    imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80',
    sortOrder: 10,
  },
  {
    name: 'Panjabi',
    slug: 'panjabi',
    description: 'Traditional and fusion Panjabi',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    sortOrder: 20,
  },
  {
    name: 'T-Shirt',
    slug: 't-shirt',
    description: 'Everyday comfort tees',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    sortOrder: 30,
  },
  {
    name: 'Polo',
    slug: 'polo',
    description: 'Smart casual polo shirts',
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    sortOrder: 40,
  },
  {
    name: 'Trousers',
    slug: 'trousers',
    description: 'Tailored and casual trousers',
    imageUrl: 'https://images.unsplash.com/photo-1594938374182-a57f52c90a14?w=800&q=80',
    sortOrder: 50,
  },
]

async function main() {
  console.log('Adding product categories...')

  for (const cat of NEW_CATEGORIES) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, imageUrl: cat.imageUrl, sortOrder: cat.sortOrder, isActive: true },
      create: { ...cat, isActive: true },
    })
    console.log(`  ✓ ${result.name} (${result.slug})`)
  }

  // Mark the 4 shirts/trousers/etc products with appropriate categories
  const shirts = await prisma.category.findUnique({ where: { slug: 'shirts' } })
  const trousers = await prisma.category.findUnique({ where: { slug: 'trousers' } })
  const bestSellers = await prisma.category.findUnique({ where: { slug: 'best-sellers' } })

  if (shirts) {
    // Move any products named "shirt" or "Oxford" to shirts category
    const moved = await prisma.product.updateMany({
      where: { name: { contains: 'Shirt' }, isActive: true },
      data: { categoryId: shirts.id },
    })
    console.log(`  → Moved ${moved.count} shirt products to Shirts category`)
  }

  if (trousers) {
    const moved = await prisma.product.updateMany({
      where: { name: { contains: 'Trouser' }, isActive: true },
      data: { categoryId: trousers.id },
    })
    console.log(`  → Moved ${moved.count} trouser products to Trousers category`)

    // Also move Chinos and similar
    const moved2 = await prisma.product.updateMany({
      where: { name: { contains: 'Chino' }, isActive: true },
      data: { categoryId: trousers.id },
    })
    console.log(`  → Moved ${moved2.count} chino products to Trousers category`)
  }

  if (bestSellers) {
    // Mark top 4 products as best sellers
    const topProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      take: 4,
      select: { id: true, name: true },
    })
    for (const p of topProducts) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: bestSellers.id },
      })
      console.log(`  → Best seller: ${p.name}`)
    }
  }

  console.log('\nDone! All product categories added.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
