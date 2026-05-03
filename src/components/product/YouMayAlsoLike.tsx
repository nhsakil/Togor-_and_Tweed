'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { toggleWishlist } from '@/actions/account'
import LoginModal from './LoginModal'
import QuickAddModal from './QuickAddModal'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice: number | null
  image: string | null
  colors: string[]
}

interface Props {
  initialProducts: Product[]
  total:           number
  categorySlug:    string
  excludeId:       string
  isLoggedIn:      boolean
  wishlistedIds:   string[]
}

const PAGE_SIZE = 12

function RelatedCard({
  p, isLoggedIn, wishlisted, onWishlistToggle, onQuickAdd,
}: {
  p: Product
  isLoggedIn: boolean
  wishlisted: boolean
  onWishlistToggle: (id: string) => void
  onQuickAdd: (slug: string) => void
}) {
  const isOnSale  = !!p.salePrice && p.salePrice < p.basePrice
  const display   = isOnSale ? p.salePrice! : p.basePrice
  const discount  = isOnSale ? Math.round(((p.basePrice - p.salePrice!) / p.basePrice) * 100) : 0

  return (
    <div className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] group">
      {/* Image */}
      <div className="relative overflow-hidden bg-[#f2f2f2]" style={{ aspectRatio: '3/4' }}>
        <Link href={`/products/${p.slug}`} className="block h-full">
          {p.image ? (
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="220px"
              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#bbb] text-[10px] uppercase tracking-widest">No Image</span>
            </div>
          )}
        </Link>

        {isOnSale && (
          <span className="absolute top-2 left-2 bg-[#e00000] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
            -{discount}%
          </span>
        )}

        {/* Quick-add "+" button */}
        <button
          onClick={(e) => { e.preventDefault(); onQuickAdd(p.slug) }}
          aria-label={`Quick add ${p.name} to cart`}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-[#111] hover:text-white text-[#111] transition-colors shadow-sm"
        >
          <Plus size={14} strokeWidth={2} />
        </button>

        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.preventDefault(); onWishlistToggle(p.id) }}
          className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={15}
            strokeWidth={1.75}
            className={wishlisted ? 'text-[#e00000] fill-[#e00000]' : 'text-[#444]'}
          />
        </button>
      </div>

      {/* Info */}
      <div className="pt-2">
        <Link href={`/products/${p.slug}`}>
          <p className="text-[13px] font-medium text-[#111] leading-snug line-clamp-2 hover:text-[#555] transition-colors">
            {p.name}
          </p>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          {isOnSale ? (
            <>
              <span className="text-[13px] font-bold text-[#e00000]">{formatCurrency(display)}</span>
              <span className="text-[12px] text-[#aaa] line-through">{formatCurrency(p.basePrice)}</span>
            </>
          ) : (
            <span className="text-[13px] font-semibold text-[#111]">{formatCurrency(display)}</span>
          )}
        </div>
        {p.colors.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            {p.colors.slice(0, 4).map((c, i) => (
              <span key={i} className="w-3 h-3 rounded-full border border-[#e0e0e0] flex-shrink-0"
                style={{ backgroundColor: c }} />
            ))}
            {p.colors.length > 4 && (
              <span className="text-[10px] text-[#888]">+{p.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function YouMayAlsoLike({
  initialProducts, total, categorySlug, excludeId, isLoggedIn, wishlistedIds,
}: Props) {
  const [products, setProducts]         = useState<Product[]>(initialProducts)
  const [page, setPage]                 = useState(1)
  const [loading, setLoading]           = useState(false)
  const [hasMore, setHasMore]           = useState(initialProducts.length < total)
  const [wishlisted, setWishlisted]     = useState<Set<string>>(new Set(wishlistedIds))
  const [showLogin, setShowLogin]       = useState(false)
  const [quickAddSlug, setQuickAddSlug] = useState<string | null>(null)
  const sentinelRef                     = useRef<HTMLDivElement>(null)

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const nextPage = page + 1
    try {
      const res  = await fetch(
        `/api/products/related?categorySlug=${encodeURIComponent(categorySlug)}&excludeId=${encodeURIComponent(excludeId)}&page=${nextPage}`
      )
      const data = await res.json()
      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const fresh = (data.items as Product[]).filter(p => !existingIds.has(p.id))
        return [...prev, ...fresh]
      })
      setPage(nextPage)
      setHasMore(nextPage * PAGE_SIZE < data.total)
    } catch { /* silent fail */ }
    setLoading(false)
  }, [loading, hasMore, page, categorySlug, excludeId])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  async function handleWishlistToggle(productId: string) {
    if (!isLoggedIn) { setShowLogin(true); return }
    const wasWishlisted = wishlisted.has(productId)
    setWishlisted(prev => {
      const next = new Set(prev)
      wasWishlisted ? next.delete(productId) : next.add(productId)
      return next
    })
    const result = await toggleWishlist(productId)
    if (result.success) {
      toast.success(result.added ? 'Added to wishlist' : 'Removed from wishlist')
    } else {
      setWishlisted(prev => {
        const next = new Set(prev)
        wasWishlisted ? next.add(productId) : next.delete(productId)
        return next
      })
      toast.error('Could not update wishlist')
    }
  }

  if (products.length === 0) return null

  return (
    <>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {quickAddSlug && (
        <QuickAddModal slug={quickAddSlug} onClose={() => setQuickAddSlug(null)} />
      )}

      <section className="border-t border-[#e8e8e8] py-10">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8">
          <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#111] text-center mb-8">
            You May Also Like
          </h2>

          {/* Scrollable row */}
          <div
            className="flex gap-4 overflow-x-auto pb-3"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {products.map(p => (
              <RelatedCard
                key={p.id}
                p={p}
                isLoggedIn={isLoggedIn}
                wishlisted={wishlisted.has(p.id)}
                onWishlistToggle={handleWishlistToggle}
                onQuickAdd={setQuickAddSlug}
              />
            ))}

            {/* Loading skeleton cards */}
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div key={`sk-${i}`} className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px]">
                <div className="bg-[#f0f0f0] animate-pulse" style={{ aspectRatio: '3/4' }} />
                <div className="mt-2 h-3 bg-[#f0f0f0] animate-pulse rounded w-3/4" />
                <div className="mt-1.5 h-3 bg-[#f0f0f0] animate-pulse rounded w-1/2" />
              </div>
            ))}
          </div>

          {/* Intersection sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-1" />
        </div>
      </section>
    </>
  )
}
