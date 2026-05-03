import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const categorySlug = searchParams.get('categorySlug') ?? ''
  const excludeId    = searchParams.get('excludeId') ?? ''
  const page         = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize     = 12

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: excludeId },
        category: { slug: categorySlug },
      },
      select: {
        id: true, name: true, slug: true, basePrice: true, salePrice: true,
        images:   { where: { isDefault: true }, take: 1, select: { url: true } },
        variants: { where: { isActive: true }, select: { color: true }, distinct: ['color'] },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.product.count({
      where: { isActive: true, id: { not: excludeId }, category: { slug: categorySlug } },
    }).catch(() => 0),
  ])

  const items = products.map(p => ({
    id:        p.id,
    name:      p.name,
    slug:      p.slug,
    basePrice: Number(p.basePrice),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    image:     p.images[0]?.url ?? null,
    colors:    p.variants.map(v => v.color).filter(Boolean),
  }))

  return NextResponse.json({ items, total, page, pageSize })
}
