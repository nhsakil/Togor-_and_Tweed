'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils/format'
import { validateCoupon, type CouponValidationResult } from '@/actions/coupon'
import { calcShipping } from '@/lib/utils/shipping'
import Image from 'next/image'
import { Tag, X, Loader2 } from 'lucide-react'

export type AppliedCoupon = Pick<
  CouponValidationResult,
  'code' | 'discountAmount' | 'discountType' | 'discountValue'
>

let _appliedCoupon: AppliedCoupon | null = null
export function getAppliedCoupon(): AppliedCoupon | null { return _appliedCoupon }

export default function CheckoutCartSummary() {
  const items    = useCartStore(s => s.items)
  const subtotal = useCartStore(s => s.subtotal())

  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon]           = useState<AppliedCoupon | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [applying, setApplying]       = useState(false)
  const [city, setCity]               = useState('')
  const [mounted, setMounted]         = useState(false)

  // Read city from sessionStorage to show correct shipping rate
  useEffect(() => {
    setMounted(true)
    try {
      const stored = sessionStorage.getItem('checkout_address')
      if (stored) {
        const addr = JSON.parse(stored)
        setCity(addr.city ?? '')
      }
    } catch { /* silent */ }
  }, [])

  const shipping = city ? calcShipping(city) : null  // null = not yet known
  const discount = coupon?.discountAmount ?? 0
  const total    = Math.max(0, subtotal - discount + (shipping ?? 0))

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    setApplying(true)
    setCouponError(null)
    const result = await validateCoupon(couponInput.trim(), subtotal)
    setApplying(false)
    if (!result.valid) { setCouponError(result.error ?? 'Invalid coupon.'); return }
    const applied: AppliedCoupon = {
      code:           result.code!,
      discountAmount: result.discountAmount!,
      discountType:   result.discountType!,
      discountValue:  result.discountValue!,
    }
    setCoupon(applied)
    _appliedCoupon = applied
    setCouponInput('')
  }

  function handleRemoveCoupon() {
    setCoupon(null)
    _appliedCoupon = null
    setCouponError(null)
  }

  return (
    <div className="bg-white p-6 md:p-8 space-y-4">
      <h2 className="font-playfair text-xl font-semibold border-b pb-4">Order Summary</h2>

      {!mounted ? (
        <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      ) : (
        <ul className="divide-y text-sm">
          {items.map(item => (
            <li key={item.variantId} className="flex gap-3 py-3">
              <div className="relative w-14 h-[72px] flex-shrink-0 bg-gray-100 overflow-hidden">
                {item.image
                  ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                  : <div className="w-full h-full bg-gray-200" />}
                <span className="absolute -top-1 -right-1 bg-brand-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                {item.size && <p className="text-gray-500 text-xs mt-0.5">Size: {item.size}</p>}
              </div>
              <p className="font-medium whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Coupon */}
      {mounted && items.length > 0 && (
        <div className="border-t pt-4">
          {coupon ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <Tag className="w-3.5 h-3.5" />
                <span className="font-semibold">{coupon.code}</span>
                <span className="text-green-600">
                  {coupon.discountType === 'percentage' ? `(${coupon.discountValue}% off)` : '(fixed discount)'}
                </span>
              </div>
              <button onClick={handleRemoveCoupon} aria-label="Remove coupon" className="text-green-600 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Promo Code</label>
              <div className="flex gap-2">
                <input type="text" value={couponInput}
                  onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null) }}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Enter code" aria-label="Promo code"
                  className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-gold" />
                <button onClick={handleApplyCoupon} disabled={applying || !couponInput.trim()}
                  className="px-4 py-2 bg-brand-black text-white text-xs uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-50 flex items-center gap-1.5">
                  {applying && <Loader2 className="w-3 h-3 animate-spin" />}
                  Apply
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500">{couponError}</p>}
            </div>
          )}
        </div>
      )}

      {/* Price breakdown — all values depend on Zustand (empty on server) and
          sessionStorage (unavailable on server); suppress hydration warnings */}
      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span suppressHydrationWarning>{mounted ? formatCurrency(subtotal) : '…'}</span>
        </div>
        {mounted && discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({coupon?.code})</span>
            <span>−{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium" suppressHydrationWarning>
            {!mounted
              ? '…'
              : shipping !== null
                ? formatCurrency(shipping)
                : <span className="text-gray-400 text-xs">৳60–120 (by city)</span>}
          </span>
        </div>
        {mounted && shipping !== null && (
          <p className="text-xs text-gray-400">
            {city.toLowerCase().includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka'} delivery rate
          </p>
        )}
        <div className="flex justify-between font-semibold text-base border-t pt-2 mt-1">
          <span>Total</span>
          <span suppressHydrationWarning>{mounted ? (city ? formatCurrency(total) : '—') : '…'}</span>
        </div>
      </div>
    </div>
  )
}
