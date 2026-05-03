import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import { ORDER_STATUSES } from '@/lib/constants'
import { ArrowLeft, MapPin, CreditCard, Package, Truck } from 'lucide-react'
import { pathaoStatusInfo, PATHAO_STATUSES } from '@/lib/pathao'

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  return { title: `Order ${orderId.slice(-6).toUpperCase()} — Togor & Tweed` }
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  bkash: 'bKash',
  nagad: 'Nagad',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    select: {
      id: true, orderNumber: true, status: true, paymentStatus: true,
      paymentMethod: true, subtotal: true, discountAmount: true,
      shippingCost: true, total: true, createdAt: true,
      pathaoConsignmentId: true, pathaoStatus: true, pathaoCreatedAt: true,
      address: true,
      items: true,
    },
  }).catch(() => null)

  if (!order) notFound()

  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] ?? {
    label: order.status,
    color: 'text-gray-600 bg-gray-100',
  }

  return (
    <div className="bg-white p-6 md:p-8">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-black mb-6 uppercase tracking-wider"
      >
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="font-playfair text-xl font-semibold">Order {order.orderNumber}</h2>
          <p className="text-xs text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-xs px-3 py-1.5 font-medium rounded-full ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Address */}
        <div className="bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider">
            <MapPin size={14} className="text-brand-gold" /> Delivery Address
          </div>
          <address className="not-italic text-sm text-gray-700 leading-relaxed">
            {order.address.firstName} {order.address.lastName}
            <br />{order.address.phone}
            <br />{order.address.line1}
            {order.address.line2 && <>, {order.address.line2}</>}
            <br />{order.address.city}, {order.address.postalCode}
            <br />{order.address.state}, Bangladesh
          </address>
        </div>

        {/* Payment */}
        <div className="bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider">
            <CreditCard size={14} className="text-brand-gold" /> Payment
          </div>
          <dl className="text-sm space-y-1">
            <div className="flex justify-between">
              <dt className="text-gray-500">Method</dt>
              <dd>{order.paymentMethod ? (PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod) : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd className={order.paymentStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
              </dd>
            </div>
          </dl>
        </div>
      </div>


      {/* Pathao Tracking */}
      {order.pathaoConsignmentId && (() => {
        const info = pathaoStatusInfo(order.pathaoStatus)
        const steps = Object.entries(PATHAO_STATUSES).filter(([k]) =>
          !['Returned', 'Cancelled'].includes(k)
        )
        const currentIdx = steps.findIndex(([k]) => k === order.pathaoStatus)
        return (
          <div className="mb-6 border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider">
              <Truck size={14} className="text-brand-gold" /> Shipment Tracking
            </div>
            {/* Status pill */}
            {info && (
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-xs px-3 py-1 rounded-full font-semibold text-white"
                  style={{ background: info.color }}
                >
                  {info.label}
                </span>
                <span className="text-sm text-gray-500">{info.description}</span>
              </div>
            )}
            {/* Timeline */}
            <ol className="flex flex-wrap gap-0 mb-4">
              {steps.map(([key, s], i) => {
                const done = currentIdx >= 0 && i <= currentIdx
                const active = i === currentIdx
                return (
                  <li key={key} className="flex items-center gap-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
                        active
                          ? 'text-white'
                          : done
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-gray-50 text-gray-400'
                      }`}
                      style={active ? { background: s.color } : {}}
                    >
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <span className="text-gray-300 text-xs mx-0.5">→</span>
                    )}
                  </li>
                )
              })}
            </ol>
            {/* Consignment + link */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>
                Consignment:{' '}
                <span className="font-mono font-semibold text-gray-700">
                  {order.pathaoConsignmentId}
                </span>
              </span>
              {order.pathaoCreatedAt && (
                <span>Shipped: {new Date(order.pathaoCreatedAt).toLocaleDateString('en-BD')}</span>
              )}
              <a
                href={`https://pathao.com/parcel-tracking/?consignment_id=${order.pathaoConsignmentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline font-medium"
              >
                Track on Pathao →
              </a>
            </div>
          </div>
        )
      })()}
      {/* Items */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider">
          <Package size={14} className="text-brand-gold" /> Items ({order.items.length})
        </div>
        <ul className="divide-y border">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between items-center py-3 px-4 gap-3">
              <div>
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.size && `Size: ${item.size}`}
                  {item.size && item.color && ' · '}
                  {item.color && `Colour: ${item.color}`}
                  {' · '}Qty: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium whitespace-nowrap">
                {formatCurrency(Number(item.totalPrice))}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Totals */}
      <div className="ml-auto max-w-xs space-y-2 text-sm border-t pt-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span>{formatCurrency(Number(order.subtotal))}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Shipping</span>
          <span>{Number(order.shippingCost) === 0 ? 'Free' : formatCurrency(Number(order.shippingCost))}</span>
        </div>
        {Number(order.discountAmount) > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>- {formatCurrency(Number(order.discountAmount))}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-base border-t pt-2">
          <span>Total</span>
          <span>{formatCurrency(Number(order.total))}</span>
        </div>
      </div>
    </div>
  )
}
