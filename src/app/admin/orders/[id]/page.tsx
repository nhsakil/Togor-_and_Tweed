import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import StatusBadge from '@/components/admin/StatusBadge'
import OrderStatusForm from '@/components/admin/OrderStatusForm'
import PathaoSection from '@/components/admin/PathaoSection'
import { pathaoConfigured } from '@/lib/pathao'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user:    { select: { id: true, name: true, email: true, phone: true } },
      address: true,
      items:   {
        include: {
          product: { select: { id: true, name: true, slug: true } },
          variant: { select: { sku: true, size: true, color: true } },
        },
      },
    },
  })

  if (!order) notFound()

  const isPrepaid   = order.paymentStatus === 'PAID'
  const codAmount   = isPrepaid ? 0 : Number(order.total)
  const totalItems  = order.items.reduce((s, i) => s + i.quantity, 0)
  const fullAddress = [order.address.line1, order.address.line2, order.address.city]
    .filter(Boolean).join(', ')
  const recipientPhone = order.address.phone ?? order.user.phone ?? ''

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      {/* Order Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Customer</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd className="text-gray-900 font-medium">{order.user.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{order.user.email}</dd>
            </div>
            {order.user.phone && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900">{order.user.phone}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
          <address className="text-sm text-gray-700 not-italic space-y-1">
            <p className="font-medium">{order.address.firstName} {order.address.lastName}</p>
            {order.address.company && <p>{order.address.company}</p>}
            <p>{order.address.line1}</p>
            {order.address.line2 && <p>{order.address.line2}</p>}
            <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
            <p>{order.address.country}</p>
            {order.address.phone && <p>{order.address.phone}</p>}
          </address>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.productName}
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <span className="font-medium text-gray-900">{item.productName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="space-y-0.5">
                      <div className="font-mono text-xs text-gray-400">{item.variantSku}</div>
                      {item.size  && <div>Size: {item.size}</div>}
                      {item.color && <div>Color: {item.color}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 text-gray-900">৳{Number(item.unitPrice).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">৳{Number(item.totalPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-100">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm text-gray-500">Subtotal</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">৳{Number(order.subtotal).toLocaleString()}</td>
              </tr>
              {Number(order.discountAmount) > 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-2 text-right text-sm text-gray-500">Discount</td>
                  <td className="px-6 py-2 text-sm text-green-600">-৳{Number(order.discountAmount).toLocaleString()}</td>
                </tr>
              )}
              {Number(order.shippingCost) > 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-2 text-right text-sm text-gray-500">Shipping</td>
                  <td className="px-6 py-2 text-sm text-gray-900">৳{Number(order.shippingCost).toLocaleString()}</td>
                </tr>
              )}
              <tr className="border-t border-gray-100">
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total</td>
                <td className="px-6 py-3 text-base font-bold text-gray-900">৳{Number(order.total).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Payment</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Method</dt>
              <dd className="text-gray-900 font-medium uppercase">{order.paymentMethod ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd><StatusBadge status={order.paymentStatus} /></dd>
            </div>
          </dl>
        </div>
        {order.notes && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Pathao Shipment */}
      <PathaoSection
        orderId={order.id}
        orderNumber={order.orderNumber}
        recipientName={`${order.address.firstName} ${order.address.lastName}`.trim()}
        recipientPhone={recipientPhone}
        recipientAddress={fullAddress}
        addressCity={order.address.city}
        addressZone={order.address.state}
        codAmount={codAmount}
        totalItems={totalItems}
        consignmentId={order.pathaoConsignmentId ?? null}
        trackingCode={order.pathaoTrackingCode   ?? null}
        pathaoStatus={order.pathaoStatus          ?? null}
        pathaoCreatedAt={order.pathaoCreatedAt    ?? null}
        configured={pathaoConfigured()}
      />

      {/* Update Status */}
      <OrderStatusForm orderId={order.id} currentStatus={order.status} />
    </div>
  )
}
