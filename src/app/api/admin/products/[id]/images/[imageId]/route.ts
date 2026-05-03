import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import crypto from 'crypto'

// DELETE — remove from DB + Cloudinary
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  if (!await requireAdmin()) return unauthorized()
  const { imageId } = await params

  const image = await prisma.productImage.findUnique({ where: { id: imageId } })
  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete from Cloudinary
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME

  if (apiKey && apiSecret && cloudName) {
    try {
      const ts  = Math.round(Date.now() / 1000)
      const sig = crypto.createHash('sha1')
        .update('public_id=' + image.publicId + '&timestamp=' + ts + apiSecret)
        .digest('hex')
      const body = new URLSearchParams({
        public_id: image.publicId, timestamp: String(ts),
        api_key: apiKey, signature: sig,
      })
      await fetch('https://api.cloudinary.com/v1_1/' + cloudName + '/image/destroy', {
        method: 'POST', body,
      })
    } catch {
      // Cloudinary deletion failed — still remove from DB
    }
  }

  await prisma.productImage.delete({ where: { id: imageId } })

  // If it was the default, promote the next image
  if (image.isDefault) {
    const next = await prisma.productImage.findFirst({
      where: { productId: image.productId },
      orderBy: { sortOrder: 'asc' },
    })
    if (next) await prisma.productImage.update({ where: { id: next.id }, data: { isDefault: true } })
  }

  return NextResponse.json({ success: true })
}

// PATCH — set as default OR update altText OR update sortOrder
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  if (!await requireAdmin()) return unauthorized()
  const { id: productId, imageId } = await params
  const body = await request.json()

  if (body.isDefault === true) {
    // Unset all defaults for this product then set this one
    await prisma.productImage.updateMany({ where: { productId }, data: { isDefault: false } })
    await prisma.productImage.update({ where: { id: imageId }, data: { isDefault: true } })
  }

  const updates: Record<string, unknown> = {}
  if (body.altText  !== undefined) updates.altText  = body.altText || null
  if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder

  if (Object.keys(updates).length > 0) {
    await prisma.productImage.update({ where: { id: imageId }, data: updates })
  }

  const image = await prisma.productImage.findUnique({ where: { id: imageId } })
  return NextResponse.json({ data: image })
}
