import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const skip   = (page - 1) * PAGE_SIZE

  try {
    const [raw, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          salePrice: { not: null },
          variants: { some: { isActive: true, stock: { gt: 0 } } },
        },
        select: {
          id: true, name: true, slug: true, basePrice: true, salePrice: true,
          images: { where: { isDefault: true }, take: 1, select: { url: true } },
          variants: {
            where: { isActive: true, stock: { gt: 0 } },
            orderBy: { price: 'asc' },
            take: 1,
            select: { id: true, size: true, color: true, price: true, salePrice: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.product.count({
        where: {
          isActive: true,
          salePrice: { not: null },
          variants: { some: { isActive: true, stock: { gt: 0 } } },
        },
      }),
    ])

    const items = raw
      .filter(p => p.salePrice && p.variants.length > 0)
      .map(p => {
        const v    = p.variants[0]
        const base = Number(v.price ?? p.basePrice)
        const sale = Number(v.salePrice ?? p.salePrice!)
        return {
          id: p.id, name: p.name, slug: p.slug,
          basePrice: base,
          salePrice: sale < base ? sale : Math.round(base * 0.85),
          image: p.images[0]?.url ?? null,
          variantId: v.id,
          size: v.size, color: v.color,
          discount: Math.round(((base - (sale < base ? sale : Math.round(base * 0.85))) / base) * 100),
        }
      })
      .filter(p => p.discount > 0)

    return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE })
  } catch {
    return NextResponse.json({ items: [], total: 0, page, pageSize: PAGE_SIZE })
  }
}
