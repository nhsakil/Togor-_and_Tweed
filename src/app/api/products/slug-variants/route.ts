import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  try {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        images: { where: { isDefault: true }, take: 1, select: { url: true } },
        variants: {
          where: { isActive: true },
          orderBy: { size: 'asc' },
          select: {
            id: true,
            size: true,
            color: true,
            price: true,
            salePrice: true,
            stock: true,
            reservedQty: true,
          },
        },
      },
    })

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const variants = product.variants.map(v => ({
      id: v.id,
      size: v.size,
      color: v.color,
      price: Number(v.price),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      available: Math.max(0, v.stock - v.reservedQty),
    }))

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? null,
      variants,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
