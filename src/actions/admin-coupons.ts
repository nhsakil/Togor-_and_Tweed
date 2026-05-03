'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
}

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
  await assertAdmin()
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
  await assertAdmin()
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
  await assertAdmin()
  await prisma.coupon.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/coupons')
}

export async function deleteCoupon(id: string) {
  await assertAdmin()
  await prisma.coupon.delete({ where: { id } })
  revalidatePath('/admin/coupons')
}
