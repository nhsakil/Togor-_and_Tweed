import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  interface RawProduct {
    id: string
    name: string
    slug: string
    brand: string | null
    basePrice: unknown
    salePrice: unknown
    imageUrl: string | null
    variantPrice: unknown
    variantSalePrice: unknown
  }

  let products: RawProduct[] = []

  try {
    // Try MATCH AGAINST for full-text search (MySQL)
    products = await prisma.$queryRaw<RawProduct[]>`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.brand,
        p.basePrice,
        p.salePrice,
        (SELECT url FROM product_images WHERE productId = p.id AND isDefault = true LIMIT 1) as imageUrl,
        (SELECT price FROM product_variants WHERE productId = p.id AND isActive = true ORDER BY price ASC LIMIT 1) as variantPrice,
        (SELECT salePrice FROM product_variants WHERE productId = p.id AND isActive = true ORDER BY price ASC LIMIT 1) as variantSalePrice
      FROM products p
      WHERE p.isActive = true
      AND MATCH(p.name, p.tags) AGAINST(${q} IN BOOLEAN MODE)
      ORDER BY p.isFeatured DESC
      LIMIT 6
    `
  } catch (_err) {
    // Fallback to LIKE query if FULLTEXT index not available
    const fallback = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { brand: { contains: q } },
          { tags: { contains: q } },
        ],
      },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        basePrice: true,
        salePrice: true,
        images: { where: { isDefault: true }, take: 1, select: { url: true } },
        variants: { where: { isActive: true }, take: 1, orderBy: { price: 'asc' }, select: { price: true, salePrice: true } },
      },
      orderBy: { isFeatured: 'desc' },
    }).catch(() => [])

    // Remap to match the raw query structure and return early
    return NextResponse.json({
      results: fallback.map((p) => {
        const v = p.variants[0]
        const price = Number(v?.price ?? p.basePrice)
        const salePrice = v?.salePrice ? Number(v.salePrice) : p.salePrice ? Number(p.salePrice) : null
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          price,
          salePrice,
          image: p.images[0]?.url ?? null,
        }
      })
    })
  }

  // Format results from MATCH AGAINST query
  const results = products.map((p) => {
    const price = Number(p.variantPrice ?? p.basePrice)
    const salePrice = p.variantSalePrice ? Number(p.variantSalePrice): p.salePrice ? Number(p.salePrice) : null
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price,
      salePrice,
      image: p.imageUrl ?? null,
    }
  })

  return NextResponse.json({ results })
}
