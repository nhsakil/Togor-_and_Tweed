'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils/format'
import { placeOrder, type CheckoutAddress } from '@/actions/checkout'
import { calcShipping } from '@/lib/utils/shipping'
import { getAppliedCoupon } from '@/components/checkout/CheckoutCartSummary'
import { toast } from 'sonner'

type PaymentMethod = 'cod' | 'bkash' | 'nagad'

export default function PaymentForm() {
  const router    = useRouter()
  const items     = useCartStore(s => s.items)
  const subtotal  = useCartStore(s => s.subtotal())
  const clearCart = useCartStore(s => s.clearCart)

  const [method, setMethod]               = useState<PaymentMethod>('cod')
  const [mobileNumber, setMobileNumber]   = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading]             = useState(false)
  const [addressData, setAddressData]     = useState<CheckoutAddress | null>(null)
  const [mounted, setMounted]             = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = sessionStorage.getItem('checkout_address')
      if (!stored) { router.replace('/checkout'); return }
      setAddressData(JSON.parse(stored) as CheckoutAddress)
    } catch {
      router.replace('/checkout')
    }
  }, [router])

  const appliedCoupon = getAppliedCoupon()
  const discount  = appliedCoupon?.discountAmount ?? 0
  // Shipping based on city — fallback 120 if address not yet loaded
  const shipping  = addressData ? calcShipping(addressData.city) : 120
  const total     = Math.max(0, subtotal - discount + shipping)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (method !== 'cod') {
      if (!/^(\+?880|0)?1[3-9]\d{8}$/.test(mobileNumber)) {
        toast.error('Enter a valid Bangladesh mobile number')
        return
      }
      if (!transactionId.trim()) {
        toast.error('Enter the transaction ID from your payment')
        return
      }
    }

    if (!addressData) {
      toast.error('Address missing. Please go back and fill in your address.')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)
    try {
      const result = await placeOrder({
        address:        addressData,
        paymentMethod:  method,
        mobileNumber:   method !== 'cod' ? mobileNumber : undefined,
        transactionId:  method !== 'cod' ? transactionId : undefined,
        items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity, price: i.price })),
        subtotal,
        shipping,
        total,
        couponCode:     appliedCoupon?.code,
        discountAmount: appliedCoupon?.discountAmount,
      })

      if (result.success && result.orderId) {
        clearCart()
        sessionStorage.removeItem('checkout_address')
        router.push(`/checkout/confirmation/${result.orderId}`)
      } else {
        toast.error(result.error ?? 'Failed to place order. Please try again.')
      }
    } catch (err) {
      console.error('[PaymentForm]', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment method */}
      <div className="space-y-3">
        {([
          { value: 'cod',   label: 'Cash on Delivery', desc: 'Pay in cash when your order arrives', icon: '💵' },
          { value: 'bkash', label: 'bKash',             desc: 'Send payment via bKash', icon: '🩷', color: 'text-[#e2136e]' },
          { value: 'nagad', label: 'Nagad',             desc: 'Send payment via Nagad', icon: '🟠', color: 'text-[#f26522]' },
        ] as const).map(opt => (
          <label key={opt.value}
            className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
              method === opt.value ? 'border-brand-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" name="payment" value={opt.value} checked={method === opt.value}
              onChange={() => setMethod(opt.value)} className="mt-0.5 accent-brand-black" />
            <div>
              <p className={`font-medium text-sm ${'color' in opt ? opt.color : 'text-gray-700'}`}>
                {opt.icon} {opt.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Mobile payment fields */}
      {method !== 'cod' && (
        <div className="bg-gray-50 border border-gray-200 p-4 text-sm space-y-4">
          <div className="space-y-1">
            <p className="font-semibold text-brand-black">
              {method === 'bkash' ? 'bKash' : 'Nagad'} Payment Instructions
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 text-xs">
              <li>Open your {method === 'bkash' ? 'bKash' : 'Nagad'} app → <strong>Send Money</strong></li>
              <li>Send <strong suppressHydrationWarning>{mounted ? formatCurrency(total) : '…'}</strong> to <strong className="font-mono">01XXXXXXXXX</strong></li>
              <li>Use <strong>Order</strong> as the reference</li>
              <li>Copy the Transaction ID from the confirmation message</li>
            </ol>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
              Your {method === 'bkash' ? 'bKash' : 'Nagad'} Mobile Number
            </label>
            <input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Transaction ID</label>
            <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
              placeholder="e.g. 8N5A6GH3LP"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-brand-gold" />
          </div>
        </div>
      )}

      {/* Amount summary — suppress hydration on price spans since they depend on
          sessionStorage (address) and Zustand (cart) which are unavailable on the server */}
      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500" suppressHydrationWarning>
          <span suppressHydrationWarning>
            {mounted && addressData
              ? `Shipping (${addressData.city.toLowerCase().includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka'})`
              : 'Shipping'}
          </span>
          <span suppressHydrationWarning>{mounted ? formatCurrency(shipping) : '…'}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Amount to Pay</span>
          <span className="text-lg" suppressHydrationWarning>{mounted ? formatCurrency(total) : '…'}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-brand-black py-3.5 text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button type="submit" disabled={loading}
          className="flex-[2] bg-brand-black text-white py-3.5 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-60">
          {loading ? 'Placing Order…' : 'Place Order'}
        </button>
      </div>
    </form>
  )
}
