'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export interface BannerCoupon {
  code: string
  discountType: string
  discountValue: number
  bannerLabel: string | null
}

function CouponCard({ coupon }: { coupon: BannerCoupon }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(coupon.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const discountText =
    coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% OFF`
      : `৳${coupon.discountValue} OFF`

  return (
    <div
      className="flex flex-col items-center justify-center text-center px-4 py-5 rounded-sm"
      style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', minHeight: 110 }}
    >
      <p className="text-white font-bold text-[18px] leading-tight tracking-tight mb-1">
        {discountText}
      </p>
      {coupon.bannerLabel && (
        <p className="text-[#999] text-[11px] mb-3 leading-snug">{coupon.bannerLabel}</p>
      )}
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#444] text-white text-[11px] font-mono font-semibold tracking-[0.08em] hover:border-[#888] transition-colors rounded-sm"
        aria-label={`Copy code ${coupon.code}`}
      >
        CODE: {coupon.code}
        {copied
          ? <Check size={11} className="text-green-400 flex-shrink-0" />
          : <Copy size={11} className="text-[#888] flex-shrink-0" />}
      </button>
    </div>
  )
}

export default function DiscountBanner({ coupons }: { coupons: BannerCoupon[] }) {
  if (!coupons.length) return null

  return (
    <div
      className={`grid gap-3 mb-5 ${
        coupons.length === 1
          ? 'grid-cols-1'
          : coupons.length === 2
          ? 'grid-cols-2'
          : 'grid-cols-2 md:grid-cols-3'
      }`}
    >
      {coupons.map((c) => (
        <CouponCard key={c.code} coupon={c} />
      ))}
    </div>
  )
}
