'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { useCartStore } from '@/store/cartStore'
import QuickAddModal from '@/components/product/QuickAddModal'

interface DealProduct {
  id: string; name: string; slug: string
  basePrice: number; salePrice: number
  image: string | null; variantId: string
  size: string | null; color: string | null
}

interface Props {
  products: DealProduct[]
  compact?: boolean
}

function DealCard({ product, compact }: { product: DealProduct; compact?: boolean }) {
  const items    = useCartStore(s => s.items)
  const [quickAdd, setQuickAdd] = useState(false)
  const inCart   = items.some(i => i.variantId === product.variantId)
  const discount = Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
  const w        = compact ? 'w-[130px]' : 'w-[150px] sm:w-[170px]'

  return (
    <>
      <div className={`flex-shrink-0 ${w} group`}>
        <div className="relative overflow-hidden bg-[#f2f2f2]" style={{ aspectRatio: '3/4' }}>
          <Link href={`/products/${product.slug}`}>
            {product.image
              ? <Image src={product.image} alt={product.name} fill sizes="170px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
              : <div className="absolute inset-0 bg-[#e8e8e8] flex items-center justify-center">
                  <span className="text-[#bbb] text-[10px] uppercase tracking-widest">No Image</span>
                </div>}
          </Link>

          {/* Discount badge */}
          <span className="absolute top-2 left-2 bg-[#e00000] text-white text-[9px] font-bold px-1.5 py-0.5 uppercase">
            -{discount}%
          </span>

          {/* + / ✓ button — opens size modal */}
          <button
            onClick={e => { e.preventDefault(); if (!inCart) setQuickAdd(true) }}
            disabled={inCart}
            className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-sm shadow transition-colors
              ${inCart ? 'bg-[#27ae60] text-white cursor-default'
                       : 'bg-white text-[#111] hover:bg-[#111] hover:text-white'}`}
            aria-label={inCart ? 'Already in cart' : `Add ${product.name} to cart`}
          >
            {inCart
              ? <Check size={14} strokeWidth={2.5} />
              : <span className="text-[15px] font-light leading-none">+</span>}
          </button>
        </div>

        <div className="pt-1.5">
          <Link href={`/products/${product.slug}`}>
            <p className="text-[12px] font-medium text-[#111] leading-snug line-clamp-2 hover:text-[#555] transition-colors">
              {product.name}
            </p>
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[12px] font-bold text-[#e00000]">{formatCurrency(product.salePrice)}</span>
            <span className="text-[11px] text-[#aaa] line-through">{formatCurrency(product.basePrice)}</span>
          </div>
        </div>
      </div>

      {quickAdd && <QuickAddModal slug={product.slug} onClose={() => setQuickAdd(false)} />}
    </>
  )
}

export default function StealDeals({ products, compact }: Props) {
  if (products.length === 0) return null
  return (
    <div className={compact ? 'px-5 py-4' : 'bg-white px-6 py-5 mb-6'}>
      <div className={compact ? 'mb-3' : 'text-center mb-4'}>
        <h3 className={`font-black uppercase tracking-[0.2em] text-[#111] ${compact ? 'text-[12px] mb-1' : 'text-[13px] mb-2 text-center'}`}>
          Steal Deals
        </h3>
        {compact
          ? <p className="text-[10px] text-[#c26b47] font-semibold uppercase tracking-[0.1em]">Worth adding to your bag</p>
          : <div className="flex items-center justify-center gap-2">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="6" fill="#c26b47" opacity="0.12"/>
                <path d="M27 13h-6a1 1 0 0 0-.7.3l-8 8a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4 0l8-8A1 1 0 0 0 27 19v-6zm-3 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="#c26b47"/>
              </svg>
              <div className="text-left">
                <p className="text-[13px] font-bold text-[#c26b47] leading-none">Worth adding</p>
                <p className="text-[11px] text-[#888] mt-0.5">Pick any one of these items</p>
              </div>
            </div>
        }
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {products.map(p => <DealCard key={p.id} product={p} compact={compact} />)}
      </div>
    </div>
  )
}
