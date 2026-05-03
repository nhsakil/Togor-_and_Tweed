'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Coupon {
  code: string
  description: string | null
  bannerLabel: string | null
  discountType: string
  discountValue: number
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(coupon.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const description =
    coupon.description ??
    coupon.bannerLabel ??
    (coupon.discountType === 'PERCENTAGE'
      ? `Enjoy ${coupon.discountValue}% off on your order.`
      : `Enjoy ৳${coupon.discountValue} off on your order.`)

  return (
    <div
      className="flex-shrink-0 flex items-start gap-3 rounded-lg px-4 py-3 min-w-[220px] max-w-[260px]"
      style={{ backgroundColor: '#fdf3ee', border: '1px solid #f0ddd3' }}
    >
      {/* Tag icon */}
      <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        className="flex-shrink-0 mt-0.5 text-[#c26b47]"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>

      <div className="flex-1 min-w-0">
        {/* Code + copy */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold tracking-wider text-[#111] uppercase">
            {coupon.code}
          </span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 text-[#888] hover:text-[#111] transition-colors"
            title="Copy code"
          >
            {copied
              ? <Check size={14} strokeWidth={2.5} className="text-green-600" />
              : <Copy size={14} strokeWidth={1.75} />
            }
          </button>
        </div>
        {/* Description */}
        <p className="text-[12px] text-[#666] mt-0.5 leading-snug line-clamp-2">{description}</p>
      </div>
    </div>
  )
}

export default function CouponCards({ coupons }: { coupons: Coupon[] }) {
  if (coupons.length === 0) return null
  return (
    <div className="pt-1">
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {coupons.map(c => <CouponCard key={c.code} coupon={c} />)}
      </div>
    </div>
  )
}
