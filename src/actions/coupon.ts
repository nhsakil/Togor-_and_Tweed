'use server'

import { prisma } from '@/lib/prisma'

export interface AvailableOffer {
  code: string
  discountType: string
  discountValue: number
  bannerLabel: string | null
}

export async function getAvailableOffers(): Promise<AvailableOffer[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coupons = await (prisma.coupon as any).findMany({
      where: { isActive: true, showOnBanner: true },
      select: { code: true, discountType: true, discountValue: true, bannerLabel: true },
      orderBy: { createdAt: 'asc' },
      take: 4,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return coupons.map((c: any) => ({ ...c, discountValue: Number(c.discountValue) }))
  } catch {
    return []
  }
}

export interface CouponValidationResult {
  valid: boolean
  code?: string
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  discountAmount?: number
  maxDiscount?: number
  description?: string
  error?: string
}

export async function validateCoupon(
  code: string,
  cartSubtotal: number
): Promise<CouponValidationResult> {
  if (!code?.trim()) {
    return { valid: false, error: 'Please enter a coupon code.' }
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  })

  if (!coupon || !coupon.isActive) {
    return { valid: false, error: 'Invalid or expired coupon code.' }
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: 'This coupon has expired.' }
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: 'This coupon has reached its usage limit.' }
  }

  const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0
  if (cartSubtotal < minOrder) {
    return {
      valid: false,
      error: `Minimum order of ৳${minOrder.toFixed(0)} required for this coupon.`,
    }
  }

  const discountValue = Number(coupon.discountValue)
  const maxDiscount   = coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined

  let discountAmount: number
  if (coupon.discountType === 'percentage') {
    discountAmount = (cartSubtotal * discountValue) / 100
    if (maxDiscount !== undefined) {
      discountAmount = Math.min(discountAmount, maxDiscount)
    }
  } else {
    discountAmount = Math.min(discountValue, cartSubtotal)
  }

  discountAmount = Math.round(discountAmount * 100) / 100

  return {
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType as 'percentage' | 'fixed',
    discountValue,
    discountAmount,
    maxDiscount,
    description: coupon.description ?? undefined,
  }
}
