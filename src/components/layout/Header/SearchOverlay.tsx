'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ProductColor { color: string; hex: string | null }
interface TrendingProduct {
  id: string; name: string; slug: string
  price: number; salePrice: number | null
  imageUrl: string | null; colors?: ProductColor[]
}
interface Props { open: boolean; onClose: () => void }

const TOP_SEARCHES = [
  'Panjabi', 'Linen Shirts', 'White Shirt',
  'Black Shirt', 'Formal Wear', 'Polo Shirt',
  'Brown Shirt', 'Pink Shirt', 'Slim Fit', 'Casual Wear',
]

const TRENDING_TABS = [
  { label: 'All',      value: null       },
  { label: 'Shirts',   value: 'shirts'   },
  { label: 'T-Shirts', value: 't-shirt'  },
  { label: 'Trousers', value: 'trousers' },
  { label: 'Panjabi',  value: 'panjabi'  },
  { label: 'Polo',     value: 'polo'     },
]

const MAX_SW = 3

export default function SearchOverlay({ open, onClose }: Props) {
  const router           = useRouter()
  const scrollRef        = useRef<HTMLDivElement>(null)
  const mobileScrollRef  = useRef<HTMLDivElement>(null)
  const sentinelRef      = useRef<HTMLDivElement>(null)
  const mobileSentinel   = useRef<HTMLDivElement>(null)
  const mobileInputRef   = useRef<HTMLInputElement>(null)

  const [q, setQ]               = useState('')
  const [activeTab, setActiveTab]     = useState<string | null>(null)
  const [products, setProducts]       = useState<TrendingProduct[]>([])
  const [page, setPage]               = useState(1)
  const [hasMore, setHasMore]         = useState(true)
  const [loading, setLoading]         = useState(false)
  const [initialLoad, setInitialLoad] = useState(false)

  // Lock body scroll when open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Auto-focus mobile input when overlay opens
  useEffect(() => {
    if (open) {
      setTimeout(() => mobileInputRef.current?.focus(), 80)
    } else {
      setQ('')
    }
  }, [open])

  const loadPage = useCallback(async (tab: string | null, p: number, reset = false) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(p) })
      if (tab) qs.set('category', tab)
      const res  = await fetch(`/api/browse-products?${qs}`)
      const data = await res.json()
      setProducts(prev => reset ? (data.products ?? []) : [...prev, ...(data.products ?? [])])
      setHasMore(data.hasMore ?? false)
      setPage(p)
    } catch { if (reset) setProducts([]) }
    finally  { setLoading(false); setInitialLoad(true) }
  }, [])

  // Reset + load when panel opens or tab changes
  useEffect(() => {
    if (!open) return
    setProducts([]); setPage(1); setHasMore(true); setInitialLoad(false)
    loadPage(activeTab, 1, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeTab])

  // Desktop: lazy-load via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !initialLoad || !scrollRef.current) return
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loading) loadPage(activeTab, page + 1) },
      { root: scrollRef.current, rootMargin: '150px' }
    )
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, hasMore, loading, page, activeTab])

  // Mobile: lazy-load via IntersectionObserver
  useEffect(() => {
    if (!mobileSentinel.current || !initialLoad || !mobileScrollRef.current) return
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loading) loadPage(activeTab, page + 1) },
      { root: mobileScrollRef.current, rootMargin: '150px' }
    )
    obs.observe(mobileSentinel.current)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, hasMore, loading, page, activeTab])

  function handleTabChange(v: string | null) {
    if (v === activeTab) return
    scrollRef.current?.scrollTo({ top: 0 })
    mobileScrollRef.current?.scrollTo({ top: 0 })
    setActiveTab(v)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
    onClose()
  }

  /* ── Shared product grid — called as a function, not a component ────────── */
  function renderProductGrid() {
    return (
      <>
        {!initialLoad && loading && (
          <div className="grid grid-cols-2 gap-3">
            {[0,1,2,3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 aspect-[3/4] mb-1.5" />
                <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1" />
                <div className="h-2.5 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}
        {initialLoad && (
          <>
            {products.length === 0
              ? <p className="text-[11px] text-[#aaa] text-center py-10">No products found</p>
              : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                  {products.map(p => <TrendingCard key={p.id} product={p} onClose={onClose} />)}
                </div>
              )
            }
            {loading && (
              <div className="flex justify-center py-4">
                <div className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <p className="text-center text-[9px] uppercase tracking-[0.2em] text-[#ccc] py-4">All caught up</p>
            )}
          </>
        )}
      </>
    )
  }

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════════
          MOBILE: full-screen takeover (hidden on md+)
      ════════════════════════════════════════════════════════════════════════ */}
      <div
        className={`md:hidden fixed inset-0 z-[65] bg-white flex flex-col transition-all duration-250 ${
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* ── Mobile search header row ── */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 px-3 h-[82px] pt-8 border-b border-[#f0f0f0] flex-shrink-0"
        >
          {/* Back / close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-[#111] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Real search input */}
          <div className="flex-1 flex items-center gap-2 border border-[#e0e0e0] bg-[#f8f8f8] px-3 h-[38px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M21 21l-5.5-5.5" />
            </svg>
            <input
              ref={mobileInputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Search "FORMAL SHIRT"'
              className="flex-1 text-[14px] text-[#111] bg-transparent outline-none placeholder:text-[#bbb]"
              aria-label="Search products"
              autoComplete="off"
            />
            {q && (
              <button type="button" onClick={() => { setQ(''); mobileInputRef.current?.focus() }}
                className="text-[#bbb] hover:text-[#555] transition-colors flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* ── Mobile scrollable content ── */}
        <div ref={mobileScrollRef} className="flex-1 overflow-y-auto">
          <div className="px-4 pt-5 pb-6">

            {/* TOP SEARCHES */}
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#111] text-center mb-3">
              Top Searches
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {TOP_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => { router.push(`/search?q=${encodeURIComponent(term)}`); onClose() }}
                  className="px-4 py-1.5 border border-[#ccc] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#111] hover:border-[#111] hover:bg-[#111] hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* TRENDING */}
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#111] text-center mb-3">
              Trending
            </p>

            {/* Category filter tabs — horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
              {TRENDING_TABS.map((tab) => (
                <button
                  key={String(tab.value)}
                  onClick={() => handleTabChange(tab.value)}
                  className={`flex-shrink-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] border transition-colors ${
                    activeTab === tab.value
                      ? 'bg-[#111] text-white border-[#111]'
                      : 'bg-white text-[#111] border-[#ddd] hover:border-[#111]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Product grid */}
            {renderProductGrid()}
            <div ref={mobileSentinel} className="h-1 mt-2" />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          DESKTOP: backdrop + dropdown panel (hidden on mobile)
      ════════════════════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className={`hidden md:block fixed inset-0 z-[60] transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0,0,0,0.20)', top: '137px' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown panel */}
      <div
        className={`hidden md:flex fixed z-[61] bg-white flex-col transition-all duration-300 ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{
          top:       '92px',
          left:      '38vw',
          right:     '8vw',
          maxHeight: 'min(540px, 76vh)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          border:    '1px solid #e0e0e0',
          borderTop: '1px solid #e8e8e8',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Search suggestions"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#ddd transparent' }}
        >
          <div className="grid py-6" style={{ gridTemplateColumns: '1fr 1.4fr' }}>

            {/* LEFT: TOP SEARCHES */}
            <div className="px-6 border-r border-[#f0f0f0]">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#111] mb-4 text-center">
                Top Searches
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {TOP_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => { router.push(`/search?q=${encodeURIComponent(term)}`); onClose() }}
                    className="px-3 py-1.5 border border-[#ccc] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#111] hover:border-[#111] hover:bg-[#111] hover:text-white transition-colors leading-none"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: TRENDING */}
            <div className="px-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#111] mb-4 text-center">
                Trending
              </p>
              <div className="flex items-center gap-1 mb-4 flex-wrap">
                {TRENDING_TABS.map((tab) => (
                  <button
                    key={String(tab.value)}
                    onClick={() => handleTabChange(tab.value)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] border transition-colors flex-shrink-0 leading-none ${
                      activeTab === tab.value
                        ? 'bg-[#111] text-white border-[#111]'
                        : 'bg-white text-[#111] border-[#ddd] hover:border-[#111]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {renderProductGrid()}
              <div ref={sentinelRef} className="h-1 mt-2" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Trending product card ─────────────────────────────────────────────────── */
function TrendingCard({ product, onClose }: { product: TrendingProduct; onClose: () => void }) {
  const hasSale      = product.salePrice !== null && product.salePrice < product.price
  const displayPrice = hasSale ? product.salePrice! : product.price
  const colors       = product.colors ?? []

  return (
    <Link href={`/products/${product.slug}`} onClick={onClose} className="group block">
      <div className="relative aspect-[3/4] bg-[#f5f5f5] overflow-hidden mb-1.5">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width:768px) 45vw, 140px"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 bg-[#e8e8e8]" />
        )}
        {hasSale && (
          <span className="absolute top-1.5 left-1.5 bg-[#111] text-white text-[8px] font-bold uppercase px-1 py-0.5 leading-none">
            Sale
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          aria-label={`Wishlist ${product.name}`}
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-white/80 rounded-full text-[#888] hover:text-red-500 transition-colors"
        >
          <Heart size={11} strokeWidth={1.75} />
        </button>
      </div>
      <p className="text-[11px] font-semibold text-[#111] line-clamp-2 leading-tight mb-0.5">{product.name}</p>
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-[11px] font-bold text-[#111]">৳{displayPrice.toLocaleString()}</span>
        {hasSale && <span className="text-[10px] text-[#aaa] line-through">৳{product.price.toLocaleString()}</span>}
      </div>
      {colors.length > 0 && (
        <div className="flex items-center gap-0.5">
          {colors.slice(0, MAX_SW).map(c => (
            <span key={c.color} title={c.color}
              className="w-3 h-3 rounded-full border border-[#ddd] flex-shrink-0"
              style={{ backgroundColor: c.hex ?? '#ccc' }} />
          ))}
          {colors.length > MAX_SW && (
            <span className="text-[9px] text-[#888] ml-0.5">+{colors.length - MAX_SW}</span>
          )}
        </div>
      )}
    </Link>
  )
}
