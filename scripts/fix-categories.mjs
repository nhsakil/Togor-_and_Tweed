import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Add men category
  const men = await prisma.category.upsert({
    where: { slug: 'men' },
    update: {},
    create: { name: 'Men', slug: 'men', description: 'Menswear collection', imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80', sortOrder: 1, isActive: true }
  })
  // Add women category
  const women = await prisma.category.upsert({
    where: { slug: 'women' },
    update: {},
    create: { name: 'Women', slug: 'women', description: 'Womenswear collection', imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', sortOrder: 2, isActive: true }
  })
  // Add new-arrivals category
  const newArrivals = await prisma.category.upsert({
    where: { slug: 'new-arrivals' },
    update: {},
    create: { name: 'New Arrivals', slug: 'new-arrivals', description: 'Latest styles just dropped', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80', sortOrder: 5, isActive: true }
  })
  // Add sale category
  const sale = await prisma.category.upsert({
    where: { slug: 'sale' },
    update: {},
    create: { name: 'Sale', slug: 'sale', description: 'Shop discounted styles', imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80', sortOrder: 6, isActive: true }
  })

  // Reassign products to men/women categories
  // Shirts → men
  await prisma.product.updateMany({ where: { category: { slug: 'shirts' } }, data: { categoryId: men.id } })
  // Trousers → men
  await prisma.product.updateMany({ where: { category: { slug: 'trousers' } }, data: { categoryId: men.id } })
  // Outerwear → men (blazer/jacket)
  await prisma.product.updateMany({ where: { category: { slug: 'outerwear' } }, data: { categoryId: men.id } })

  // Move dresses and blouses to women by name match
  await prisma.product.updateMany({ where: { name: { contains: 'Dress' } }, data: { categoryId: women.id } })
  await prisma.product.updateMany({ where: { name: { contains: 'Blouse' } }, data: { categoryId: women.id } })
  await prisma.product.updateMany({ where: { name: { contains: 'Trousers' } }, data: { categoryId: women.id } })

  // New arrivals — put last 4 products there
  const latest = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 4, select: { id: true } })
  for (const p of latest) {
    await prisma.product.update({ where: { id: p.id }, data: { categoryId: newArrivals.id } })
  }

  // Sale — products with salePrice → sale category
  const onSale = await prisma.product.findMany({ where: { salePrice: { not: null } }, select: { id: true } })
  for (const p of onSale) {
    await prisma.product.update({ where: { id: p.id }, data: { categoryId: sale.id } })
  }

  // Ensure accessories category still has slug 'accessories'
  await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: { sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' },
    create: { name: 'Accessories', slug: 'accessories', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', sortOrder: 3, isActive: true }
  })

  console.log('Categories fixed!')
  const cats = await prisma.category.findMany({ select: { name: true, slug: true, _count: { select: { products: true } } } })
  console.table(cats)
}

main().catch(console.error).finally(() => prisma.$disconnect())
