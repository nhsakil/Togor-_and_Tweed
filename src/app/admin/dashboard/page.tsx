import { prisma } from '@/lib/prisma'
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import StatusBadge from '@/components/admin/StatusBadge'
import Link from 'next/link'
import { Decimal } from '@prisma/client/runtime/library'

async function getDashboardData() {
  const [totalOrders, totalUsers, totalProducts, revenueResult, recentOrders, topProducts] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.product.findMany({
        take: 5,
        include: {
          _count: { select: { orderItems: true } },
          images: { where: { isDefault: true }, take: 1 },
        },
        orderBy: { orderItems: { _count: 'desc' } },
      }),
    ])

  return {
    totalOrders,
    totalRevenue: revenueResult._sum.total ?? new Decimal(0),
    totalUsers,
    totalProducts,
    recentOrders,
    topProducts,
  }
}

export default async function DashboardPage() {
  const { totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders, topProducts } =
    await getDashboardData()

  const revenueFormatted = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(Number(totalRevenue))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back to your store overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={revenueFormatted}
          subtitle="From paid orders"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          subtitle="All time"
          icon={ShoppingCart}
          color="blue"
        />
        <StatsCard
          title="Products"
          value={totalProducts}
          subtitle="In catalog"
          icon={Package}
          color="indigo"
        />
        <StatsCard
          title="Customers"
          value={totalUsers}
          subtitle="Registered users"
          icon={Users}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {order.user.name ?? order.user.email}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ৳{Number(order.total).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Top Products</h2>
            <Link
              href="/admin/products"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {topProducts.length === 0 ? (
              <li className="px-6 py-8 text-center text-gray-400 text-sm">No products yet</li>
            ) : (
              topProducts.map((product) => (
                <li key={product.id} className="px-6 py-4 flex items-center gap-3">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].altText ?? product.name}
                      className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">
                      {product._count.orderItems} orders
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
