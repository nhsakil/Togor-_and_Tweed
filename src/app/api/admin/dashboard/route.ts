import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export async function GET() {
  if (!await requireAdmin()) return unauthorized()
  const [totalOrders, totalUsers, totalProducts, revenueResult, recentOrders, topProducts] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      prisma.order.findMany({
        take: 10, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.product.findMany({
        take: 5,
        include: { _count: { select: { orderItems: true } }, images: { where: { isDefault: true }, take: 1 } },
        orderBy: { orderItems: { _count: 'desc' } },
      }),
    ])
  return NextResponse.json({
    data: { totalOrders, totalRevenue: Number(revenueResult._sum.total ?? 0), totalUsers, totalProducts, recentOrders, topProducts },
  })
}
