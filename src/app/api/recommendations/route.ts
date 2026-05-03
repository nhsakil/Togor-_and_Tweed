import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const excludeIds = searchParams.get('exclude')?.split(',').filter(Boolean) ?? []
  const limit = Math.min(Number(searchParams.get('limit') ?? '6'), 12)

  // Fetch featured products first, fall back to newest active products
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { notIn: excludeIds },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      salePrice: true,
      isFeatured: true,
      images: {
        select: { url: true, altText: true },
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  })

  return NextResponse.json(
    products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.salePrice ?? p.basePrice),
      originalPrice: p.salePrice ? Number(p.basePrice) : null,
      image: p.images[0]?.url ?? null,
      imageAlt: p.images[0]?.altText ?? p.name,
    }))
  )
}
