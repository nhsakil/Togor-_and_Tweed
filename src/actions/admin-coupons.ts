'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-auth'

export interface CouponFormData {
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number | null
  maxDiscount: number | null
  usageLimit: number | null
  isActive: boolean
  showOnBanner: boolean
  bannerLabel: string
  expiresAt: string | null
}

export async function createCoupon(data: CouponFormData) {
  if (!await requireAdmin()) throw new Error('Unauthorized')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma.coupon as any).create({
    data: {
      code:           data.code.trim().toUpperCase(),
      description:    data.description || null,
      discountType:   data.discountType,
      discountValue:  data.discountValue,
      minOrderAmount: data.minOrderAmount,
      maxDiscount:    data.maxDiscount,
      usageLimit:     data.usageLimit,
      isActive:       data.isActive,
      showOnBanner:   data.showOnBanner,
      bannerLabel:    data.bannerLabel || null,
      expiresAt:      data.expiresAt ? new Date(data.expiresAt) : null,
    },
  })
  revalidatePath('/admin/coupons')
}

export async function updateCoupon(id: string, data: CouponFormData) {
  if (!await requireAdmin()) throw new Error('Unauthorized')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma.coupon as any).update({
    where: { id },
    data: {
      code:           data.code.trim().toUpperCase(),
      description:    data.description || null,
      discountType:   data.discountType,
      discountValue:  data.discountValue,
      minOrderAmount: data.minOrderAmount,
      maxDiscount:    data.maxDiscount,
      usageLimit:     data.usageLimit,
      isActive:       data.isActive,
      showOnBanner:   data.showOnBanner,
      bannerLabel:    data.bannerLabel || null,
      expiresAt:      data.expiresAt ? new Date(data.expiresAt) : null,
    },
  })
  revalidatePath('/admin/coupons')
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  if (!await requireAdmin()) throw new Error('Unauthorized')
  await prisma.coupon.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/coupons')
}

export async function deleteCoupon(id: string) {
  if (!await requireAdmin()) throw new Error('Unauthorized')
  await prisma.coupon.delete({ where: { id } })
  revalidatePath('/admin/coupons')
}
