'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { PRODUCT_CATEGORY_LINKS } from '@/lib/constants'

interface Props {
  open: boolean
  onClose: () => void
}

interface ProductColor { color: string; hex: string | null }
interface Product {
  id: string; name: string; slug: string
  price: number; salePrice: number | null
  imageUrl: string | null; colors: ProductColor[]
}

const TOP_LINKS = [
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Bestsellers',  href: '/collections/best-sellers' },
  { label: 'View All',     href: '/collections' },
]

const CATEGORY_ITEMS = [
  { label: 'Shirts',          href: '/collections/shirts'   },
  { label: 'Panjabi',         href: '/collections/panjabi'  },
  { label: 'T-Shirts | Polo', href: '/collections/t-shirt'  },
  { label: 'Trousers',        href: '/collections/trousers' },
]

const TABS = [
  { label: 'All', value: '' },
  ...PRODUCT_CATEGORY_LINKS.map(l => ({
    label: l.label,
    value: l.href.replace('/collections/', ''),
  })),
]

const MAX_SWATCHES = 3

export default function CategoriesDrawer({ open, onClose }: Props) {
  const [activeTab, setActiveTab]     = useState('')
  const [products, setProducts]       = useState<Product[]>([])
  const [page, setPage]               = useState(1)
  const [hasMore, setHasMore]         = useState(true)
  const [loading, setLoading]         = useState(false)
  const [initialLoad, setInitialLoad] = useState(false)
  const scrollRef                     = useRef<HTMLDivElement>(null)
  const sentinelRef                   = useRef<HTMLDivElement>(null)

  // Escape key + body lock
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  // Reset + load first page when drawer opens or tab changes
  useEffect(() => {
    if (!open) return
    setProducts([])
    setPage(1)
    setHasMore(true)
    setInitialLoad(false)
    fetchPage(1, activeTab, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeTab])

  async function fetchPage(p: number, tab: string, reset = false) {
    if (loading) return
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(p) })
      if (tab) qs.set('category', tab)
      const res  = await fetch(`/api/browse-products?${qs}`)
      const data = await res.json()
      setProducts(prev => reset ? data.products : [...prev, ...data.products])
      setHasMore(data.hasMore)
      setPage(p)
    } catch { /* silent */ } finally {
      setLoading(false)
      setInitialLoad(true)
    }
  }

  // IntersectionObserver — root is the drawer scroll container
  useEffect(() => {
    if (!sentinelRef.current || !initialLoad || !scrollRef.current) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPage(page + 1, activeTab)
        }
      },
      { root: scrollRef.current, rootMargin: '300px' }
    )
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, hasMore, loading, page, activeTab])

  function handleTabChange(tab: string) {
    if (tab === activeTab) return
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setActiveTab(tab)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — full-height, single scroll container */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed left-0 top-0 h-full w-full sm:w-[360px] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ── Fixed header ── */}
        <div className="flex items-center justify-between px-3 h-14 border-b border-[#e8e8e8] flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="hover:bg-[rgba(0,0,0,0.05)] p-2 rounded text-[#111] transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
          <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#111]">Categories</span>
          <div className="w-9" aria-hidden="true" />
        </div>

        {/* ── Single scrollable body ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">

          {/* Top nav links */}
          <ul>
            {TOP_LINKS.map((link) => (
              <li key={link.href} className="border-b border-[#f0f0f0]">
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block px-5 py-4 text-[13px] font-bold uppercase tracking-[0.1em] text-[#111] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Category links — no "Shop by Category" label */}
          <ul>
            {CATEGORY_ITEMS.map((item) => (
              <li key={item.href} className="border-b border-[#f0f0f0]">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block px-5 py-4 text-[13px] font-bold uppercase tracking-[0.1em] text-[#111] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── NEW AND POPULAR ── */}
          <div className="pt-6 pb-3 px-5">
            <h2 className="text-[16px] font-black uppercase tracking-tight text-[#111] text-center">
              New and Popular
            </h2>
          </div>

          {/* Category filter pills */}
          <div className="px-3 pb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`whitespace-nowrap px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] border transition-colors flex-shrink-0 ${
                    activeTab === tab.value
                      ? 'bg-[#111] text-white border-[#111]'
                      : 'bg-white text-[#555] border-[#ddd] hover:border-[#111] hover:text-[#111]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          {!initialLoad && loading ? (
            <div className="grid grid-cols-2 gap-2 px-3 pb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 aspect-[3/4] w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 && initialLoad ? (
            <div className="flex flex-col items-center py-12 px-6 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa]">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 px-3 pb-6">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={onClose}
                  className="group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative bg-[#f5f5f5] aspect-[3/4] w-full overflow-hidden mb-2">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 180px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#ebebeb]" />
                    )}
                    {p.salePrice && (
                      <span className="absolute top-2 left-2 bg-[#111] text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                        Sale
                      </span>
                    )}
                    <button
                      onClick={(e) => e.preventDefault()}
                      aria-label={`Wishlist ${p.name}`}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/80 rounded-full text-[#888] hover:text-red-500 transition-colors"
                    >
                      <Heart size={13} strokeWidth={1.75} />
                    </button>
                  </div>

                  {/* Name */}
                  <p className="text-[12px] font-semibold text-[#111] leading-tight line-clamp-2 mb-1 px-0.5">
                    {p.name}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                    {p.salePrice ? (
                      <>
                        <span className="text-[12px] font-bold text-[#111]">\u09f3{p.salePrice.toLocaleString()}</span>
                        <span className="text-[11px] text-[#aaa] line-through">\u09f3{p.price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-[12px] font-bold text-[#111]">\u09f3{p.price.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Color swatches */}
                  {p.colors.length > 0 && (
                    <div className="flex items-center gap-1 px-0.5">
                      {p.colors.slice(0, MAX_SWATCHES).map((c) => (
                        <span
                          key={c.color}
                          title={c.color}
                          className="w-4 h-4 rounded-full border border-[#ddd] flex-shrink-0"
                          style={{ backgroundColor: c.hex ?? '#ccc' }}
                        />
                      ))}
                      {p.colors.length > MAX_SWATCHES && (
                        <span className="text-[10px] text-[#888] font-medium">
                          +{p.colors.length - MAX_SWATCHES}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}

              {/* Sentinel for IntersectionObserver */}
              <div ref={sentinelRef} className="col-span-2 h-4" />

              {/* Spinner while loading more */}
              {loading && initialLoad && (
                <div className="col-span-2 flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* End of list */}
              {!hasMore && products.length > 0 && (
                <p className="col-span-2 text-center text-[10px] uppercase tracking-[0.2em] text-[#ccc] py-6">
                  All caught up
                </p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
