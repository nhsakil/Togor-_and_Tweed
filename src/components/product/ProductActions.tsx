'use client'
import { useState, useRef, useEffect } from 'react'
import AddToCartButton from './AddToCartButton'
import WishlistButton from './WishlistButton'
import SizeChartModal, { type SizeChartData } from './SizeChartModal'
import { formatCurrency } from '@/lib/utils/format'

interface Variant {
  id: string
  size: string | null
  color: string | null
  price: { toString(): string } | null
  salePrice: { toString(): string } | null
  stock: number
  reservedQty: number
}

interface Props {
  variants: Variant[]
  productId: string
  productName: string
  basePrice: number
  baseSalePrice?: number
  defaultImage: string | null
  initialWishlisted: boolean
  sizeChart?: SizeChartData | null
  categorySizes?: string[]
}

export default function ProductActions({
  variants,
  productId,
  productName,
  basePrice,
  baseSalePrice,
  defaultImage,
  initialWishlisted,
  sizeChart,
  categorySizes,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>(variants[0]?.id ?? '')
  const [chartOpen, setChartOpen]   = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const addToCartAreaRef = useRef<HTMLDivElement>(null)
  const addToCartBtnRef  = useRef<HTMLButtonElement>(null)

  // Show sticky bar only when the inline Add to Cart scrolls out of view
  useEffect(() => {
    const el = addToCartAreaRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { rootMargin: '0px 0px -60px 0px', threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]

  const activePrice = selected
    ? selected.salePrice
      ? Number(selected.salePrice)
      : selected.price
      ? Number(selected.price)
      : baseSalePrice ?? basePrice
    : baseSalePrice ?? basePrice

  const hasSizes = variants.some((v) => v.size)

  return (
    <div className="space-y-4">
      {/* Size selector */}
      {hasSizes && (
        <div>
          <p id="size-selector-legend" className="text-[10px] font-semibold text-[#888] uppercase tracking-[0.2em] mb-2">
            Size
            {selected?.size && (
              <span className="ml-2 normal-case font-normal text-[#111]">{selected.size}</span>
            )}
          </p>
          <div className="flex gap-2 flex-wrap" role="group" aria-labelledby="size-selector-legend">
            {variants.map((v) => {
              const inStock  = v.stock - v.reservedQty > 0
              const isSelected = v.id === selectedId
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!inStock}
                  onClick={() => setSelectedId(v.id)}
                  className={`border min-w-[44px] min-h-[44px] px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                    isSelected
                      ? 'border-[#111] bg-[#111] text-white'
                      : inStock
                      ? 'border-[#e8e8e8] text-[#111] hover:border-[#111]'
                      : 'border-[#F0F0F0] text-[#CCCCCC] line-through cursor-not-allowed opacity-60'
                  }`}
                  aria-label={('Size ' + v.size) + (!inStock ? ' - Out of stock' : isSelected ? ' - Selected' : '')}
                  aria-pressed={isSelected}
                >
                  {v.size}
                </button>
              )
            })}
          </div>

          {/* Size Chart button — below size pills, square black */}
          {sizeChart && (
            <button
              type="button"
              onClick={() => setChartOpen(true)}
              className="mt-3 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] bg-[#111] text-white hover:bg-[#333] transition-colors"
            >
              Size Chart
            </button>
          )}
        </div>
      )}

      {/* Add to cart + Wishlist */}
      <div ref={addToCartAreaRef} className="flex gap-3 pt-2">
        <div className="flex-1">
          {selected ? (
            <AddToCartButton
              ref={addToCartBtnRef}
              variantId={selected.id}
              productId={productId}
              name={productName}
              price={activePrice}
              image={defaultImage}
              size={selected.size}
              color={selected.color}
              stock={selected.stock}
              reservedQty={selected.reservedQty}
            />
          ) : (
            <button disabled className="w-full bg-gray-200 text-gray-500 py-4 text-sm uppercase tracking-widest cursor-not-allowed">
              Unavailable
            </button>
          )}
        </div>
        <WishlistButton productId={productId} initialWishlisted={initialWishlisted} />
      </div>

      {/* Size chart modal */}
      {chartOpen && sizeChart && (
        <SizeChartModal chart={sizeChart} onClose={() => setChartOpen(false)} />
      )}

      {/* ── Sticky mobile Add to Cart bar — sits above the bottom tab bar ────── */}
      {stickyVisible && (
        <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-50 bg-white border-t border-[#e8e8e8] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center gap-4">
            {/* Price */}
            <div className="flex flex-col min-w-0">
              <span className="text-[18px] font-bold text-[#1a1a1a] leading-tight">
                {formatCurrency(activePrice)}
              </span>
              {baseSalePrice && baseSalePrice < basePrice && (
                <span className="text-[11px] text-[#aaa] line-through leading-tight">
                  {formatCurrency(basePrice)}
                </span>
              )}
            </div>
            {/* CTA */}
            <button
              onClick={() => addToCartBtnRef.current?.click()}
              disabled={!selected || (selected.stock - selected.reservedQty) <= 0}
              className="flex-1 bg-[#111] text-white text-[12px] font-bold uppercase tracking-[0.12em] py-4 hover:bg-[#333] transition-colors disabled:bg-[#ccc] disabled:cursor-not-allowed"
            >
              {(!selected || (selected.stock - selected.reservedQty) <= 0) ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
