import { prisma } from '@/lib/prisma'
import CouponManager from '@/components/admin/CouponManager'

export const metadata = { title: 'Coupons — Admin' }

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Convert Decimal fields to plain numbers for client component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serialized = (coupons as any[]).map((c) => ({
    id:             c.id,
    code:           c.code,
    description:    c.description ?? null,
    discountType:   c.discountType,
    discountValue:  Number(c.discountValue),
    minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
    maxDiscount:    c.maxDiscount ? Number(c.maxDiscount) : null,
    usageLimit:     c.usageLimit ?? null,
    usageCount:     c.usageCount,
    isActive:       c.isActive,
    showOnBanner:   c.showOnBanner ?? false,
    bannerLabel:    c.bannerLabel ?? null,
    expiresAt:      c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt:      c.createdAt.toISOString(),
  }))

  return <CouponManager initialCoupons={serialized} />
}
