import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Package, Truck, MapPin, CheckCircle2, Clock, Search } from 'lucide-react'
import { pathaoStatusInfo, PATHAO_STATUSES } from '@/lib/pathao'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { ORDER_STATUSES } from '@/lib/constants'

export const metadata = { title: 'Track Your Order — Togor & Tweed' }

async function TrackResult({ orderNumber, email }: { orderNumber: string; email: string }) {
  if (!orderNumber || !email) return null

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: orderNumber.trim().toUpperCase(),
      user: { email: email.trim().toLowerCase() },
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      total: true,
      createdAt: true,
      pathaoConsignmentId: true,
      pathaoStatus: true,
      pathaoCreatedAt: true,
      address: true,
      items: { select: { productName: true, quantity: true, size: true, color: true, totalPrice: true } },
    },
  })

  if (!order) {
    return (
      <div className="mt-8 border border-red-200 bg-red-50 p-5 flex gap-3 items-start">
        <span className="text-red-500 text-lg">✗</span>
        <div>
          <p className="font-semibold text-red-700 text-sm">Order not found</p>
          <p className="text-xs text-red-600 mt-1">
            Check your order number and email address. The order number was included in your confirmation email (e.g. TT-20260428-NV52).
          </p>
        </div>
      </div>
    )
  }

  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]
  const pathaoInfo = pathaoStatusInfo(order.pathaoStatus)

  const trackingSteps = Object.entries(PATHAO_STATUSES).filter(
    ([k]) => !['Returned', 'Cancelled'].includes(k)
  )
  const currentStep = trackingSteps.findIndex(([k]) => k === order.pathaoStatus)

  return (
    <div className="mt-8 space-y-5">
      {/* Order header */}
      <div className="border border-gray-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <div>
            <p className="font-mono font-bold text-lg tracking-wide">{order.orderNumber}</p>
            <p className="text-xs text-gray-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusInfo?.color ?? 'bg-gray-100 text-gray-600'}`}>
              {statusInfo?.label ?? order.status}
            </span>
            <span className="font-semibold">{formatCurrency(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Pathao tracking */}
      {order.pathaoConsignmentId ? (
        <div className="border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
            <Truck size={14} className="text-[#c8a96e]" /> Shipment Tracking
          </div>

          {/* Current status badge */}
          {pathaoInfo && (
            <div className="flex items-center gap-3 mb-5">
              <span
                className="text-sm px-4 py-1.5 rounded-full font-semibold text-white"
                style={{ background: pathaoInfo.color }}
              >
                {pathaoInfo.label}
              </span>
              <span className="text-sm text-gray-500">{pathaoInfo.description}</span>
            </div>
          )}

          {/* Step timeline */}
          <ol className="flex flex-wrap gap-1 mb-5">
            {trackingSteps.map(([key, s], i) => {
              const done   = currentStep >= 0 && i <= currentStep
              const active = i === currentStep
              return (
                <li key={key} className="flex items-center gap-1">
                  <span
                    className="text-xs px-2.5 py-1 rounded font-medium"
                    style={active
                      ? { background: s.color, color: '#fff' }
                      : done
                      ? { background: '#f3f4f6', color: '#4b5563' }
                      : { background: '#f9fafb', color: '#9ca3af' }}
                  >
                    {s.label}
                  </span>
                  {i < trackingSteps.length - 1 && (
                    <span className="text-gray-300 text-xs">→</span>
                  )}
                </li>
              )
            })}
          </ol>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span>
              Consignment:{' '}
              <span className="font-mono font-semibold text-gray-700">{order.pathaoConsignmentId}</span>
            </span>
            {order.pathaoCreatedAt && (
              <span className="flex items-center gap-1">
                <Clock size={11} /> Shipped {formatDate(order.pathaoCreatedAt)}
              </span>
            )}
            <a
              href={`https://pathao.com/parcel-tracking/?consignment_id=${order.pathaoConsignmentId}`}
              target="_blank" rel="noopener noreferrer"
              className="font-medium text-[#c8a96e] hover:underline flex items-center gap-1"
            >
              <Truck size={11} /> Track on Pathao →
            </a>
          </div>
        </div>
      ) : (
        <div className="border border-gray-100 bg-gray-50 p-4 flex items-center gap-3 text-sm text-gray-500">
          <Clock size={16} className="shrink-0" />
          Your shipment is being prepared. Tracking details will appear here once dispatched.
        </div>
      )}

      {/* Delivery address */}
      <div className="border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <MapPin size={14} className="text-[#c8a96e]" /> Delivery Address
        </div>
        <address className="not-italic text-sm text-gray-700 leading-relaxed">
          {order.address.firstName} {order.address.lastName}<br />
          {order.address.line1}
          {order.address.line2 && <>, {order.address.line2}</>}<br />
          {order.address.city}, {order.address.postalCode}<br />
          {order.address.state}, Bangladesh
        </address>
      </div>

      {/* Items */}
      <div className="border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <Package size={14} className="text-[#c8a96e]" /> Items ({order.items.length})
        </div>
        <ul className="divide-y">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between items-center py-2.5 gap-3">
              <div>
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`, `Qty: ${item.quantity}`]
                    .filter(Boolean).join(' · ')}
                </p>
              </div>
              <p className="text-sm font-medium shrink-0">{formatCurrency(Number(item.totalPrice))}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Login prompt */}
      <p className="text-xs text-gray-400 text-center">
        Have an account?{' '}
        <Link href="/login" className="text-[#c8a96e] hover:underline font-medium">Log in</Link>
        {' '}to manage all your orders in one place.
      </p>
    </div>
  )
}

export default function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500 text-sm">
            Enter your order number and the email you used at checkout.
          </p>
        </div>

        {/* Search form */}
        <form method="GET" className="bg-white border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Order ID
              </label>
              <input
                name="order"
                placeholder="e.g. TT-20260428-NV52"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#c8a96e] font-mono"
                defaultValue=""
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Billing Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="Email used at checkout"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#c8a96e]"
                defaultValue=""
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-[#c8a96e] transition-colors whitespace-nowrap"
            >
              <Search size={13} />
              TRACK
            </button>
          </div>
        </form>

        {/* Results */}
        <Suspense fallback={
          <div className="mt-8 text-center text-sm text-gray-400 animate-pulse">Looking up your order…</div>
        }>
          <TrackResultWrapper searchParams={searchParams} />
        </Suspense>

        {/* Help text */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-xs text-gray-400">
            If you have an account, <Link href="/login" className="text-[#c8a96e] hover:underline">log in</Link> to track your order.
          </p>
          <p className="text-xs text-gray-400">
            Your Order ID was included in your confirmation email.
          </p>
        </div>
      </div>
    </div>
  )
}

async function TrackResultWrapper({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>
}) {
  const params = await searchParams
  if (!params.order && !params.email) return null
  return <TrackResult orderNumber={params.order ?? ''} email={params.email ?? ''} />
}
