import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') return null
  return session
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ vid: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { vid } = await params
  try {
    await prisma.productVariant.delete({ where: { id: vid } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete variant'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ vid: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { vid } = await params
  try {
    const body = await request.json()
    const variant = await prisma.productVariant.update({
      where: { id: vid },
      data: {
        ...(body.size     !== undefined && { size:     body.size     || null }),
        ...(body.color    !== undefined && { color:    body.color    || null }),
        ...(body.colorHex !== undefined && { colorHex: body.colorHex || null }),
        ...(body.stock    !== undefined && { stock:    parseInt(body.stock) }),
        ...(body.price    !== undefined && { price:    body.price    ? parseFloat(body.price)    : null }),
        ...(body.salePrice!== undefined && { salePrice:body.salePrice? parseFloat(body.salePrice): null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })
    return NextResponse.json({ data: variant })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update variant'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
