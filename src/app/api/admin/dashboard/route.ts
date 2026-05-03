import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
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
