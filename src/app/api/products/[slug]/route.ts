import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      salePrice: true,
      brand: true,
      images: {
        where: { isDefault: true },
        take: 1,
        select: { url: true },
      },
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
        take: 1,
        select: { price: true, salePrice: true },
      },
    },
  }).catch(() => null)

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    data: {
      ...product,
      images: product.images.map(i => ({ url: i.url })),
    },
  })
}
