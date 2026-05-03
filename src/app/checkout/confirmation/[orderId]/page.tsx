import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getOrderById } from '@/actions/checkout'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import { CheckCircle2, Package, MapPin, CreditCard } from 'lucide-react'
import PurchaseTracker from '@/components/checkout/PurchaseTracker'

export const metadata = { title: 'Order Confirmed — Togor & Tweed' }

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  bkash: 'bKash',
  nagad: 'Nagad',
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const order = await getOrderById(orderId)
  if (!order) notFound()

  const paymentLabel = order.paymentMethod
    ? (PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod)
    : 'N/A'

  return (
    <div className="min-h-screen bg-gray-50">
      <PurchaseTracker
        orderId={order.id}
        orderNumber={order.orderNumber}
        total={Number(order.total)}
        couponCode={order.couponCode ?? null}
        items={order.items.map(i => ({
          id:          i.id,
          productName: i.productName,
          totalPrice:  Number(i.totalPrice),
          quantity:    i.quantity,
          size:        i.size,
          color:       i.color,
        }))}
      />
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">

        {/* Success banner */}
        <div className="bg-white text-center p-8 mb-6">
          <CheckCircle2 className="mx-auto text-brand-gold mb-4" size={52} strokeWidth={1.5} />
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold mb-2">
            Thank you for your order!
          </h1>
          <p className="text-gray-600 text-sm mb-1">
            Order <span className="font-mono font-semibold text-brand-black">{order.orderNumber}</span>
          </p>
          <p className="text-gray-500 text-xs">
            Placed on {formatDate(order.createdAt)}
          </p>

          {order.paymentMethod === 'cod' && (
            <div className="mt-4 bg-brand-cream border border-brand-gold/30 p-3 text-sm text-brand-black max-w-md mx-auto">
              Your order is confirmed. Please keep{' '}
              <strong>{formatCurrency(Number(order.total))}</strong> ready for cash payment on
              delivery.
            </div>
          )}
          {order.paymentMethod !== 'cod' && (
            <div className="mt-4 bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 max-w-md mx-auto">
              We received your {paymentLabel} payment details and will verify within 1–2 hours.
              You'll receive a confirmation SMS/email once verified.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Delivery address */}
          <div className="bg-white p-5">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold uppercase tracking-wider">
              <MapPin size={16} className="text-brand-gold" />
              Delivery Address
            </div>
            <address className="not-italic text-sm text-gray-700 leading-relaxed">
              {order.address.firstName} {order.address.lastName}
              <br />
              {order.address.phone}
              <br />
              {order.address.line1}
              {order.address.line2 && <>, {order.address.line2}</>}
              <br />
              {order.address.city}, {order.address.postalCode}
              <br />
              {order.address.state}, Bangladesh
            </address>
          </div>

          {/* Payment info */}
          <div className="bg-white p-5">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold uppercase tracking-wider">
              <CreditCard size={16} className="text-brand-gold" />
              Payment Info
            </div>
            <dl className="text-sm text-gray-700 space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-500">Method</dt>
                <dd>{paymentLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd
                  className={
                    order.paymentStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'
                  }
                >
                  {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd>{formatCurrency(Number(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Shipping</dt>
                <dd>
                  {Number(order.shippingCost) === 0 ? 'Free' : formatCurrency(Number(order.shippingCost))}
                </dd>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                <dt>Total</dt>
                <dd>{formatCurrency(Number(order.total))}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Order items */}
        <div className="bg-white p-5 mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold uppercase tracking-wider">
            <Package size={16} className="text-brand-gold" />
            Items Ordered ({order.items.length})
          </div>
          <ul className="divide-y text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-3 gap-4">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && ' · '}
                    {item.color && `Color: ${item.color}`}
                    {' · '}
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-medium whitespace-nowrap">
                  {formatCurrency(Number(item.totalPrice))}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/orders"
            className="flex-1 bg-brand-black text-white text-center py-3.5 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/collections"
            className="flex-1 border border-gray-300 text-brand-black text-center py-3.5 text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
