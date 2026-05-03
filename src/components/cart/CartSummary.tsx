'use client'

import { useState, useTransition } from 'react'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils/format'
import { validateCoupon } from '@/actions/coupon'
import { Tag, X, ChevronDown, ChevronUp, Lock } from 'lucide-react'

interface AppliedCoupon {
  code: string
  discountAmount: number
  description?: string
}

export interface AvailableOffer {
  code: string
  discountType: string
  discountValue: number
  bannerLabel: string | null
}

interface Props {
  availableOffers?: AvailableOffer[]
  isLoggedIn: boolean
  onNeedLogin: () => void
  onCouponApplied?: (discount: number) => void
}

export default function CartSummary({
  availableOffers = [],
  isLoggedIn,
  onNeedLogin,
  onCouponApplied,
}: Props) {
  const subtotal = useCartStore((s) => s.subtotal)
  const sub      = subtotal()
  const shipping = sub >= 2000 ? 0 : null  // actual rate determined at checkout (৳60–120)

  const [couponInput, setCouponInput] = useState('')
  const [applied, setApplied]         = useState<AppliedCoupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [showCoupon, setShowCoupon]   = useState(false)
  const [isPending, startTransition]  = useTransition()

  const discount = applied?.discountAmount ?? 0
  const total    = sub + (shipping ?? 0) - discount

  function applyCode(code: string) {
    const c = code.trim().toUpperCase()
    if (!c) return
    setCouponError('')
    startTransition(async () => {
      const result = await validateCoupon(c, sub)
      if (result.valid && result.discountAmount !== undefined) {
        const applied: AppliedCoupon = {
          code:           result.code!,
          discountAmount: result.discountAmount,
          description:    result.description,
        }
        setApplied(applied)
        setCouponInput('')
        setCouponError('')
        onCouponApplied?.(result.discountAmount)
      } else {
        setCouponError(result.error ?? 'Invalid coupon')
      }
    })
  }

  function removeCoupon() {
    setApplied(null)
    setCouponError('')
    onCouponApplied?.(0)
  }

  return (
    <div className="space-y-3 text-sm">

      {/* Coupons & Gift Cards collapsible */}
      <div className="border border-[#e8e8e8]">
        <button
          onClick={() => {
            if (!isLoggedIn) { onNeedLogin(); return }
            setShowCoupon(v => !v)
          }}
          className="w-full flex items-center justify-between px-3 py-3 bg-[#fafafa]"
        >
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111]">
            {isLoggedIn ? (
              <Tag size={12} className="text-[#c26b47]" />
            ) : (
              <Lock size={12} className="text-[#c26b47]" />
            )}
            {isLoggedIn ? 'Apply Coupon / Gift Card' : 'Login to view Coupons and Gift Cards'}
          </span>
          {isLoggedIn ? (
            showCoupon ? <ChevronUp size={12} /> : <ChevronDown size={12} />
          ) : (
            <ChevronDown size={12} className="text-[#aaa]" />
          )}
        </button>

        {isLoggedIn && showCoupon && (
          <div className="px-3 pb-3 pt-2 border-t border-[#f0f0f0]">
            {/* Available offers */}
            {availableOffers.length > 0 && !applied && (
              <div className="mb-2 space-y-1.5">
                {availableOffers.map((offer) => {
                  const label = offer.discountType === 'percentage'
                    ? `${offer.discountValue}% OFF`
                    : `৳${offer.discountValue} OFF`
                  return (
                    <div key={offer.code} className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-[#111]">{label}</p>
                        {offer.bannerLabel && (
                          <p className="text-[10px] text-[#888]">{offer.bannerLabel}</p>
                        )}
                      </div>
                      <button
                        onClick={() => applyCode(offer.code)}
                        disabled={isPending}
                        className="text-[10px] font-mono font-bold text-[#111] border border-[#ddd] px-2 py-0.5 hover:bg-[#111] hover:text-white transition-colors disabled:opacity-50"
                      >
                        {offer.code}
                      </button>
                    </div>
                  )
                })}
                <div className="border-t border-[#f0f0f0] pt-2" />
              </div>
            )}

            {/* Applied coupon OR input */}
            {applied ? (
              <div className="flex items-center justify-between px-2 py-2 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2">
                  <Tag size={12} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-mono font-bold text-green-700">{applied.code}</p>
                    {applied.description && (
                      <p className="text-[10px] text-green-600">{applied.description}</p>
                    )}
                  </div>
                </div>
                <button onClick={removeCoupon} className="p-0.5 text-green-500 hover:text-green-700" aria-label="Remove">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && applyCode(couponInput)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-[#ddd] px-3 py-2 text-[11px] uppercase tracking-[0.08em] font-mono placeholder:normal-case placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:border-[#111] transition-colors"
                    aria-label="Coupon code"
                  />
                  <button
                    onClick={() => applyCode(couponInput)}
                    disabled={isPending || !couponInput.trim()}
                    className="px-4 py-2 bg-[#111] text-white text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-[#333] disabled:opacity-40 transition-colors"
                  >
                    {isPending ? '…' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-red-500 mt-1.5">{couponError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRICE DETAILS */}
      <div className="pt-1">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#111] mb-3">
          Price Details
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-[12px] text-[#555]">
            <span>Bag Total</span>
            <span className="font-medium text-[#111]">{formatCurrency(sub)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[12px] text-green-600">
              <span>Coupon Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px] text-[#555]">
            <span>Delivery Charges</span>
            <span className='font-medium text-[#111]'>
              {shipping === 0 ? 'FREE' : '৳60–120'}
            </span>
          </div>
          {sub < 2000 && (
            <p className="text-[10px] text-[#c26b47]">
              Add {formatCurrency(2000 - sub)} more for free delivery
            </p>
          )}
          <div className="flex justify-between font-bold text-[#111] text-[13px] border-t border-[#e8e8e8] pt-2 mt-1">
            <span>Grand Total</span>
            <span>{formatCurrency(Math.max(0, total))}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
