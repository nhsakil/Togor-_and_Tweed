'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Loader2, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import QuickAddModal from '@/components/product/QuickAddModal'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  image: string | null
  hoverImage?: string | null
  categorySlug: string
  isNew?: boolean
}

interface ApiProduct {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  imageUrl: string | null
  hoverImageUrl?: string | null
}

interface Props {
  initialProducts: Product[]
  initialHasMore: boolean
}

const FILTER_PILLS = [
  { label: 'All',      value: null },
  { label: 'Shirts',   value: 'shirts' },
  { label: 'Panjabi',  value: 'panjabi' },
  { label: 'T-Shirt',  value: 't-shirt' },
  { label: 'Polo',     value: 'polo' },
  { label: 'Trousers', value: 'trousers' },
]

function mapApi(p: ApiProduct, category: string | null): Product {
  return {
    id: p.id, name: p.name, slug: p.slug,
    price: p.price, salePrice: p.salePrice,
    image: p.imageUrl, hoverImage: p.hoverImageUrl ?? null,
    categorySlug: category ?? 'all',
  }
}

export default function NewAndPopular({ initialProducts, initialHasMore }: Props) {
  const [activeCategory, setActiveCategory]     = useState<string | null>(null)
  const [products, setProducts]                 = useState<Product[]>(initialProducts)
  const [page, setPage]                         = useState(1)
  const [hasMore, setHasMore]                   = useState(initialHasMore)
  const [loading, setLoading]                   = useState(false)
  const [categoryLoading, setCategoryLoading]   = useState(false)

  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchPage = useCallback(async (category: string | null, pageNum: number, replace: boolean) => {
    if (replace) setCategoryLoading(true)
    else setLoading(true)

    try {
      const params = new URLSearchParams({ page: String(pageNum) })
      if (category) params.set('category', category)
      const res  = await fetch(`/api/browse-products?${params}`)
      const data = await res.json()
      const mapped = (data.products as ApiProduct[]).map((p) => mapApi(p, category))
      setProducts((prev) => replace ? mapped : [...prev, ...mapped])
      setHasMore(data.hasMore ?? false)
      setPage(pageNum)
    } catch {
      // keep existing products on error
    } finally {
      setLoading(false)
      setCategoryLoading(false)
    }
  }, [])

  function handleCategoryChange(value: string | null) {
    if (value === activeCategory) return
    setActiveCategory(value)
    fetchPage(value, 1, true)
  }

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !categoryLoading) {
          fetchPage(activeCategory, page + 1, false)
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading, categoryLoading, page, activeCategory, fetchPage])

  return (
    <section className="py-10 md:py-16 px-4 md:px-6 max-w-[1600px] mx-auto">
      <h2 className="text-[22px] md:text-[28px] font-black uppercase tracking-tight text-[#111] text-center mb-6">
        New and Popular
      </h2>

      {/* Category pills — horizontal scroll on mobile, centered wrap on desktop */}
      <div className="flex md:justify-center gap-2 mb-8 overflow-x-auto md:overflow-visible md:flex-wrap scrollbar-hide pb-1 md:pb-0">
        {FILTER_PILLS.map((pill) => (
          <button
            key={String(pill.value)}
            onClick={() => handleCategoryChange(pill.value)}
            disabled={categoryLoading}
            className={`flex-shrink-0 px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] border transition-colors disabled:opacity-60 ${
              activeCategory === pill.value
                ? 'bg-[#111] text-white border-[#111]'
                : 'bg-white text-[#111] border-[#111] hover:bg-[#f5f5f5]'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {categoryLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 aspect-[3/4] w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[13px] text-[#888] uppercase tracking-[0.1em] mb-4">No products yet</p>
          <button
            onClick={() => handleCategoryChange(null)}
            className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#111] underline underline-offset-4"
          >
            View All
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((p) => (
              <ProductCard key={`${p.id}-${p.categorySlug}`} product={p} />
            ))}
          </div>

          <div ref={sentinelRef} className="h-4 mt-8" aria-hidden="true" />

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#c8a96e]" />
            </div>
          )}

          {!hasMore && products.length > 0 && (
            <div className="text-center pt-2 pb-4">
              <p className="text-[11px] text-[#aaa] uppercase tracking-[0.12em] mb-4">
                You&apos;ve seen all products
              </p>
              <Link
                href={activeCategory ? `/collections/${activeCategory}` : '/collections'}
                className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] text-[#111] border border-[#111] px-8 py-3 hover:bg-[#111] hover:text-white transition-colors"
              >
                Browse Full Collection &rarr;
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  )
}

/* ─── Local ProductCard with image-swap + zoom ─────────────────────────── */

function ProductCard({ product }: { product: Product }) {
  const isOnSale     = !!product.salePrice && product.salePrice < product.price
  const displayPrice = isOnSale ? product.salePrice! : product.price
  const discount     = isOnSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0

  const [hovered, setHovered]   = useState(false)
  const [origin, setOrigin]     = useState({ x: 50, y: 50 })
  const [quickAdd, setQuickAdd] = useState(false)
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
      <article className="group relative">

        <div
          ref={outerRef}
          className="relative overflow-hidden bg-[#f2f2f2] cursor-zoom-in"
          style={{ aspectRatio: '3/4' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setOrigin({ x: 50, y: 50 }) }}
          onMouseMove={handleMouseMove}
        >
          <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0">
            {product.image ? (
              <div
                className="absolute inset-0"
                style={{
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                  transform: hovered ? 'scale(1.55)' : 'scale(1)',
                  transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
                  willChange: 'transform',
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover object-top"
                  style={{
                    opacity: hovered && product.hoverImage ? 0 : 1,
                    transition: 'opacity 0.35s ease',
                  }}
                />
                {product.hoverImage && (
                  <Image
                    src={product.hoverImage}
                    alt={`${product.name} alternate view`}
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

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {isOnSale && (
              <span className="bg-[#e00000] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                -{discount}%
              </span>
            )}
            {product.isNew && !isOnSale && (
              <span className="bg-[#111] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                New
              </span>
            )}
          </div>

          {/* Quick-add "+" */}
          <button
            onClick={(e) => { e.preventDefault(); setQuickAdd(true) }}
            aria-label={`Quick add ${product.name} to cart`}
            className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-[#111] hover:text-white text-[#111] transition-colors shadow-sm z-10"
          >
            <Plus size={16} strokeWidth={2} />
          </button>

          {/* Wishlist */}
          <button
            aria-label={`Add ${product.name} to wishlist`}
            className="absolute bottom-2.5 right-2.5 z-10 w-8 h-8 flex items-center justify-center bg-white/85 hover:bg-white transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <Heart size={15} strokeWidth={1.75} className="text-[#111]" />
          </button>

          {/* View Product slide-up */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <Link
              href={`/products/${product.slug}`}
              className="flex items-center justify-center w-full bg-[#111] text-white text-[11px] font-semibold uppercase tracking-[0.15em] py-3.5 hover:bg-[#333] transition-colors"
            >
              View Product
            </Link>
          </div>
        </div>

        <div className="pt-2.5 pb-1">
          <Link href={`/products/${product.slug}`}>
            <p className="text-[14px] font-medium text-[#111] leading-snug line-clamp-2 hover:text-[#555] transition-colors">
              {product.name}
            </p>
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            {isOnSale ? (
              <>
                <span className="text-[14px] font-bold text-[#e00000]">{formatCurrency(displayPrice)}</span>
                <span className="text-[13px] text-[#aaa] line-through">{formatCurrency(product.price)}</span>
              </>
            ) : (
              <span className="text-[14px] font-semibold text-[#111]">{formatCurrency(displayPrice)}</span>
            )}
          </div>
        </div>
      </article>

      {quickAdd && (
        <QuickAddModal slug={product.slug} onClose={() => setQuickAdd(false)} />
      )}
    </>
  )
}
