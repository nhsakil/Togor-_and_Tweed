import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

// GET /api/admin/products/[id]/images
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()
  const { id } = await params
  const images = await prisma.productImage.findMany({
    where: { productId: id },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json({ data: images })
}

// POST /api/admin/products/[id]/images  — save an image record after Cloudinary upload
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()
  const { id } = await params

  const { url, publicId, altText } = await request.json()
  if (!url || !publicId) return NextResponse.json({ error: 'url and publicId required' }, { status: 400 })

  // Count existing images to set sortOrder
  const count = await prisma.productImage.count({ where: { productId: id } })
  const isFirst = count === 0

  const image = await prisma.productImage.create({
    data: {
      productId: id,
      url,
      publicId,
      altText: altText || null,
      sortOrder: count,
      isDefault: isFirst,
    },
  })
  return NextResponse.json({ data: image })
}
