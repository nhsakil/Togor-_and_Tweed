import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()

  const { id } = await params
  try {
    const body = await request.json()
    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        sku:      body.sku,
        size:     body.size     || null,
        color:    body.color    || null,
        colorHex: body.colorHex || null,
        price:    body.price    ? parseFloat(body.price)    : null,
        salePrice:body.salePrice? parseFloat(body.salePrice): null,
        stock:    parseInt(body.stock) || 0,
        isActive: true,
      },
    })
    return NextResponse.json({ data: variant }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create variant'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()
  const { id } = await params
  const variants = await prisma.productVariant.findMany({
    where: { productId: id },
    orderBy: [{ size: 'asc' }, { color: 'asc' }],
  })
  return NextResponse.json({ data: variants })
}
