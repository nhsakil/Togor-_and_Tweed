'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
})

export type ReviewResult = { success: true } | { success: false; error: string }

export async function submitReview(input: {
  productId: string
  rating: number
  title?: string
  body?: string
}): Promise<ReviewResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in to leave a review.' }
  }

  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid review data.' }
  }

  const { productId, rating, title, body } = parsed.data
  const userId = session.user.id

  // Check product exists
  const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } }).catch(() => null)
  if (!product) {
    return { success: false, error: 'Product not found.' }
  }

  // Check if user has already reviewed this product
  const existing = await prisma.review.findFirst({
    where: { userId, productId },
  }).catch(() => null)

  if (existing) {
    return { success: false, error: 'You have already reviewed this product.' }
  }

  // Check verified purchase (has a delivered order containing this product)
  const verifiedOrder = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: ['DELIVERED'] },
      },
    },
  }).catch(() => null)

  await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      title: title?.trim() || null,
      body: body?.trim() || null,
      isVerified: !!verifiedOrder,
      isApproved: false, // pending moderation
    },
  })

  revalidatePath(`/products/${product.slug}`, 'page')

  return { success: true }
}
