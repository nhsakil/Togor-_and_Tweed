import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const PAGE_SIZE = 10

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categorySlug = searchParams.get('category') || null
  const page         = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const skip         = (page - 1) * PAGE_SIZE

  try {
    const where = {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: PAGE_SIZE,
        select: {
          id: true, name: true, slug: true,
          basePrice: true, salePrice: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 2, select: { url: true } },
          variants: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
            select: { price: true, salePrice: true, color: true, colorHex: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    const result = products.map((p) => {
      const cheapest    = p.variants[0]
      const displayPrice = (cheapest?.price ? Number(cheapest.price) : null) ?? Number(p.basePrice)
      const displaySale  = (cheapest?.salePrice ? Number(cheapest.salePrice) : null) ?? (p.salePrice ? Number(p.salePrice) : null)

      // Deduplicate colors
      const seen = new Set<string>()
      const colors = p.variants
        .filter(v => v.color)
        .reduce<{ color: string; hex: string | null }[]>((acc, v) => {
          const key = v.color!.toLowerCase()
          if (!seen.has(key)) { seen.add(key); acc.push({ color: v.color!, hex: v.colorHex ?? null }) }
          return acc
        }, [])

      return {
        id: p.id, name: p.name, slug: p.slug,
        price: displayPrice, salePrice: displaySale,
        imageUrl:      p.images[0]?.url ?? null,
        hoverImageUrl: p.images[1]?.url ?? null,
        colors,
      }
    })

    return NextResponse.json({ products: result, hasMore: skip + result.length < total, total, page })
  } catch {
    return NextResponse.json({ products: [], hasMore: false, total: 0, page })
  }
}
