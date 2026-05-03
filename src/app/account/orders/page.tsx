import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import { ORDER_STATUSES } from '@/lib/constants'
import { Package, Truck } from 'lucide-react'
import { pathaoStatusInfo } from '@/lib/pathao'

export const metadata = { title: 'My Orders — Togor & Tweed' }

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, orderNumber: true, status: true, total: true, createdAt: true,
      pathaoConsignmentId: true, pathaoStatus: true,
      items: { select: { id: true, productName: true, quantity: true, imageUrl: true } },
    },
  }).catch(() => [])

  return (
    <div className="bg-white p-6 md:p-8">
      <h2 className="font-playfair text-xl font-semibold mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1} />
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link
            href="/collections"
            className="inline-block bg-brand-black text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] ?? {
              label: order.status,
              color: 'text-gray-600 bg-gray-100',
            }
            return (
              <li key={order.id} className="border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-mono font-semibold text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`text-xs px-2.5 py-1 font-medium rounded-full ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                    {order.pathaoConsignmentId && (() => {
                      const pi = pathaoStatusInfo(order.pathaoStatus)
                      return (
                        <span
                          className="text-xs px-2.5 py-1 font-medium rounded-full text-white flex items-center gap-1"
                          style={{ background: pi?.color ?? '#6b7280' }}
                        >
                          <Truck size={10} />
                          {pi?.label ?? order.pathaoStatus ?? 'Shipped'}
                        </span>
                      )
                    })()}
                    <span className="font-semibold text-sm">{formatCurrency(Number(order.total))}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  {order.items
                    .slice(0, 3)
                    .map((i) => i.productName)
                    .join(', ')}
                  {order.items.length > 3 && ` +${order.items.length - 3} more`}
                </div>

                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-xs uppercase tracking-wider text-brand-black font-medium border-b border-brand-black/30 hover:border-brand-gold hover:text-brand-gold transition-colors"
                >
                  View Details →
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
