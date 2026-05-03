'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils/format'
import { placeOrder, type CheckoutAddress } from '@/actions/checkout'
import { calcShipping } from '@/lib/utils/shipping'
import { getAppliedCoupon } from '@/components/checkout/CheckoutCartSummary'
import { BANGLADESH_DIVISIONS } from '@/lib/constants'
import { toast } from 'sonner'
import { trackBeginCheckout } from '@/lib/analytics'

type PaymentMethod = 'cod' | 'bkash' | 'nagad'

interface AddressForm {
  firstName: string; lastName: string; phone: string
  line1: string; line2: string; city: string
  state: string; postalCode: string
}

const EMPTY: AddressForm = {
  firstName: '', lastName: '', phone: '',
  line1: '', line2: '', city: '', state: '', postalCode: '',
}

export default function CheckoutForm() {
  const router    = useRouter()
  const items     = useCartStore(s => s.items)
  const subtotal  = useCartStore(s => s.subtotal())
  const clearCart = useCartStore(s => s.clearCart)

  const [form, setForm]               = useState<AddressForm>(EMPTY)
  const [errors, setErrors]           = useState<Partial<AddressForm>>({})
  const [method, setMethod]           = useState<PaymentMethod>('cod')
  const [mobileNumber, setMobileNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading]         = useState(false)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => { setMounted(true) }, [])

  function update(field: keyof AddressForm, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const appliedCoupon = getAppliedCoupon()
  const discount  = appliedCoupon?.discountAmount ?? 0
  const shipping  = form.city ? calcShipping(form.city) : 120
  const total     = Math.max(0, subtotal - discount + shipping)

  function validate(): boolean {
    const errs: Partial<AddressForm> = {}
    if (!form.firstName.trim()) errs.firstName = 'Required'
    if (!form.lastName.trim())  errs.lastName  = 'Required'
    if (!/^(\+?880|0)?1[3-9]\d{8}$/.test(form.phone)) errs.phone = 'Enter a valid BD phone number'
    if (form.line1.length < 5)  errs.line1     = 'Enter a full address (min 5 characters)'
    if (!form.city.trim())      errs.city      = 'Required'
    if (!form.state)            errs.state     = 'Select a division'
    if (!/^\d{4}$/.test(form.postalCode)) errs.postalCode = 'Enter a 4-digit postal code'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      // Scroll to first error
      const el = document.querySelector('[aria-invalid="true"]') as HTMLElement | null
      el?.focus()
      return
    }

    if (method !== 'cod') {
      if (!/^(\+?880|0)?1[3-9]\d{8}$/.test(mobileNumber)) {
        toast.error('Enter a valid Bangladesh mobile number for payment')
        return
      }
      if (!transactionId.trim()) {
        toast.error('Enter the transaction ID from your payment')
        return
      }
    }

    if (items.length === 0) { toast.error('Your cart is empty'); return }

    // GA4 begin_checkout event
    trackBeginCheckout(
      items.map(i => ({ item_id: i.variantId, item_name: i.name, price: i.price, quantity: i.quantity, item_brand: 'Togor & Tweed' })),
      total,
    )

    setLoading(true)
    try {
      const address: CheckoutAddress = {
        firstName: form.firstName, lastName: form.lastName,
        phone: form.phone, line1: form.line1, line2: form.line2 || undefined,
        city: form.city, state: form.state, postalCode: form.postalCode,
      }
      const result = await placeOrder({
        address,
        paymentMethod:  method,
        mobileNumber:   method !== 'cod' ? mobileNumber : undefined,
        transactionId:  method !== 'cod' ? transactionId : undefined,
        items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity, price: i.price })),
        subtotal, shipping, total,
        couponCode:     appliedCoupon?.code,
        discountAmount: appliedCoupon?.discountAmount,
      })

      if (result.success && result.orderId) {
        clearCart()
        router.push(`/checkout/confirmation/${result.orderId}`)
      } else {
        toast.error(result.error ?? 'Failed to place order. Please try again.')
      }
    } catch (err) {
      console.error('[CheckoutForm]', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (field: keyof AddressForm) =>
    `w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`

  const shippingLabel = form.city
    ? (form.city.toLowerCase().includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka')
    : 'Estimated'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Delivery Address ──────────────────────────────── */}
      <section>
        <h2 className="font-playfair text-xl font-semibold mb-5">Delivery Address</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {(['firstName', 'lastName'] as const).map(field => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                  {field === 'firstName' ? 'First Name' : 'Last Name'}
                </label>
                <input value={form[field]} onChange={e => update(field, e.target.value)}
                  className={inputCls(field)} aria-invalid={!!errors[field]} />
                {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Phone (Bangladesh)</label>
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
              placeholder="01XXXXXXXXX" className={inputCls('phone')} aria-invalid={!!errors.phone} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Address Line 1</label>
            <input value={form.line1} onChange={e => update('line1', e.target.value)}
              placeholder="House/flat, road, area" className={inputCls('line1')} aria-invalid={!!errors.line1} />
            {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Address Line 2 (optional)</label>
            <input value={form.line2} onChange={e => update('line2', e.target.value)}
              placeholder="Apartment, building, landmark"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">City / Upazila</label>
              <input value={form.city} onChange={e => update('city', e.target.value)}
                className={inputCls('city')} aria-invalid={!!errors.city} />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Postal Code</label>
              <input value={form.postalCode} onChange={e => update('postalCode', e.target.value)}
                placeholder="1200" maxLength={4} className={inputCls('postalCode')} aria-invalid={!!errors.postalCode} />
              {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Division</label>
            <select value={form.state} onChange={e => update('state', e.target.value)}
              className={`bg-white ${inputCls('state')}`} aria-invalid={!!errors.state}>
              <option value="">Select division…</option>
              {BANGLADESH_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* ── Payment Method ────────────────────────────────── */}
      <section>
        <h2 className="font-playfair text-xl font-semibold mb-5">Payment Method</h2>
        <div className="space-y-3">
          {([
            { value: 'cod',   label: 'Cash on Delivery', desc: 'Pay in cash when your order arrives',  icon: '💵' },
            { value: 'bkash', label: 'bKash',             desc: 'Send payment via bKash',               icon: '🩷', color: 'text-[#e2136e]' },
            { value: 'nagad', label: 'Nagad',             desc: 'Send payment via Nagad',               icon: '🟠', color: 'text-[#f26522]' },
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

        {method !== 'cod' && (
          <div className="mt-4 bg-gray-50 border border-gray-200 p-4 text-sm space-y-4">
            <div className="space-y-1">
              <p className="font-semibold text-brand-black">
                {method === 'bkash' ? 'bKash' : 'Nagad'} Payment Instructions
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 text-xs">
                <li>Open your {method === 'bkash' ? 'bKash' : 'Nagad'} app → <strong>Send Money</strong></li>
                <li>Send <strong suppressHydrationWarning>{mounted ? formatCurrency(total) : '…'}</strong> to <strong className="font-mono">01XXXXXXXXX</strong></li>
                <li>Use <strong>Order</strong> as reference</li>
                <li>Copy the Transaction ID from the confirmation</li>
              </ol>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Your {method === 'bkash' ? 'bKash' : 'Nagad'} Number
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
      </section>

      {/* ── Order total summary ───────────────────────────── */}
      <div className="border-t pt-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Shipping ({shippingLabel})</span>
          <span suppressHydrationWarning>{mounted ? formatCurrency(shipping) : '…'}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span suppressHydrationWarning>− {mounted ? formatCurrency(discount) : '…'}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span suppressHydrationWarning>{mounted ? formatCurrency(total) : '…'}</span>
        </div>
      </div>

      {/* ── Submit ───────────────────────────────────────── */}
      <button type="submit" disabled={loading}
        className="w-full bg-brand-black text-white py-4 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-60">
        {loading ? 'Placing Order…' : 'Place Order'}
      </button>
    </form>
  )
}
