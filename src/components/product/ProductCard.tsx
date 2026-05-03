'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import QuickAddModal from './QuickAddModal'

interface Props {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number
  image: string | null
  hoverImage?: string | null
  brand?: string | null
  isNew?: boolean
  colors?: string[]
  /** Pass true for the first card in a grid to improve LCP (Next.js Image priority) */
  priority?: boolean
}

export default function ProductCard({
  id, name, slug, price, salePrice, image, hoverImage, brand, isNew, colors, priority = false,
}: Props) {
  const isOnSale     = !!salePrice && salePrice < price
  const displayPrice = isOnSale ? salePrice! : price
  const discount     = isOnSale ? Math.round(((price - salePrice!) / price) * 100) : 0

  const [quickAdd, setQuickAdd] = useState(false)
  const [hovered, setHovered]   = useState(false)
  const [origin, setOrigin]     = useState({ x: 50, y: 50 })
  const outerRef                = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = outerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setOrigin({
      x: Math.round(((e.clientX - rect.left) / rect.width)  * 100),
      y: Math.round(((e.clientY - rect.top)  / rect.height) * 100),
    })
  }, [])

  return (
    <>
      <article className="group" role="region" aria-label={`Product: ${name}`}>

        {/* ── Image area ─────────────────────────────────────────── */}
        <div
          ref={outerRef}
          className="relative overflow-hidden bg-[#f2f2f2] cursor-zoom-in"
          style={{ aspectRatio: '3/4' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setOrigin({ x: 50, y: 50 }) }}
          onMouseMove={handleMouseMove}
        >
          {/* Link covers the whole image area */}
          <Link href={`/products/${slug}`} className="absolute inset-0 z-0" aria-label={name}>
            {image ? (
              /* Zoom wrapper — scales at cursor position; images cross-fade inside */
              <div
                className="absolute inset-0"
                style={{
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                  transform: hovered ? 'scale(1.55)' : 'scale(1)',
                  transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
                  willChange: 'transform',
                }}
              >
                {/* Primary image */}
                <Image
                  src={image}
                  alt={`Buy ${name} - Togor & Tweed Bangladesh`}
                  fill
                  priority={priority}
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover object-top"
                  style={{
                    opacity: hovered && hoverImage ? 0 : 1,
                    transition: 'opacity 0.35s ease',
                  }}
                />

                {/* Second image — fades in on hover */}
                {hoverImage && (
                  <Image
                    src={hoverImage}
                    alt={`${name} alternate view`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover object-top"
                    style={{
                      opacity: hovered ? 1 : 0,
                      transition: 'opacity 0.35s ease',
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#bbb] text-[11px] uppercase tracking-widest">No Image</span>
              </div>
            )}
          </Link>

          {/* Badges — above the link */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {isOnSale && (
              <span className="bg-[#e00000] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                -{discount}%
              </span>
            )}
            {isNew && !isOnSale && (
              <span className="bg-[#111] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                New
              </span>
            )}
          </div>

          {/* Quick-add "+" button */}
          <button
            onClick={(e) => { e.preventDefault(); setQuickAdd(true) }}
            aria-label={`Quick add ${name} to cart`}
            className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-[#111] hover:text-white text-[#111] transition-colors shadow-sm z-10"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ── Info ───────────────────────────────────────────────── */}
        <div className="pt-2 pb-1">
          <Link href={`/products/${slug}`}>
            <p className="text-[13px] font-medium text-[#111] leading-snug line-clamp-2 hover:text-[#555] transition-colors">
              {name}
            </p>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            {isOnSale ? (
              <>
                <span className="text-[13px] font-bold text-[#e00000]">{formatCurrency(displayPrice)}</span>
                <span className="text-[12px] text-[#aaa] line-through">{formatCurrency(price)}</span>
              </>
            ) : (
              <span className="text-[13px] font-semibold text-[#111]">{formatCurrency(displayPrice)}</span>
            )}
          </div>

          {/* Color swatches */}
          {colors && colors.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5" aria-label="Available colors">
              {colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full border border-[#e0e0e0] flex-shrink-0"
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
              {colors.length > 4 && (
                <span className="text-[10px] text-[#888] font-medium">+{colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </article>

      {quickAdd && (
        <QuickAddModal slug={slug} onClose={() => setQuickAdd(false)} />
      )}
    </>
  )
}
