'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PRODUCT_CATEGORY_LINKS } from '@/lib/constants'
import { useCartStore } from '@/store/cartStore'
import CategoriesDrawer from './CategoriesDrawer'
import SearchOverlay from './SearchOverlay'

// Discover tab + all product categories for the horizontal strip
const CATEGORY_TABS = [
  { label: 'Discover', href: '/collections' },
  ...PRODUCT_CATEGORY_LINKS.map((c) => ({ label: c.label, href: c.href })),
]

export default function MobileNav({ logoUrl }: { logoUrl?: string | null }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname  = usePathname()
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  return (
    <>
      {/* ── Mobile header ─────────────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-8 left-0 right-0 z-40 bg-white border-b border-[#ececec]">
        <div className="w-full max-w-[480px] mx-auto">

          {/* ── Row 1: hamburger · logo (center) · search + cart ───────────── */}
          <div className="relative flex items-center px-3 h-[50px]">

            {/* Hamburger — left */}
            <button
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-[#111] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
            >
              {drawerOpen
                ? <X size={20} strokeWidth={1.75} />
                : (
                  <svg width="22" height="16" viewBox="0 0 24 17" fill="none" strokeLinecap="round">
                    <line x1="0" y1="1"   x2="24" y2="1"   stroke="currentColor" strokeWidth="1.5" />
                    <line x1="0" y1="8.5" x2="24" y2="8.5" stroke="#e8572a"      strokeWidth="1.5" />
                    <line x1="0" y1="16"  x2="24" y2="16"  stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
            </button>

            {/* Logo — absolute center */}
            <Link
              href="/"
              aria-label="Home"
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center max-w-[140px]"
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Togor & Tweed"
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <span className="text-[15px] font-bold tracking-[0.08em] text-[#111] whitespace-nowrap uppercase">
                  Togor &amp; Tweed
                </span>
              )}
            </Link>

            {/* Search + Cart — right */}
            <div className="ml-auto flex items-center gap-0.5">
              {/* Search icon */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search products"
                className="w-9 h-9 flex items-center justify-center text-[#111] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="M21 21l-5.5-5.5" />
                </svg>
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
                className="w-9 h-9 flex items-center justify-center text-[#111] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 9h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V9z" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M9 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" />
                  <path
                    d="M12 19.5C10 17.5 7.5 16 7.5 14C7.5 12.5 8.7 11.5 10 11.5C10.9 11.5 11.6 12 12 12.7C12.4 12 13.1 11.5 14 11.5C15.3 11.5 16.5 12.5 16.5 14C16.5 16 14 17.5 12 19.5Z"
                    fill="#e8572a" stroke="none"
                  />
                  <rect x="16" y="5" width="8" height="5.5" fill="white" stroke="none" />
                  <text x="20" y="8.5" textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="700" fill="#111111" stroke="none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </text>
                </svg>
              </Link>
            </div>
          </div>

          {/* ── Row 2: horizontally scrollable category tab strip ─────────── */}
          <div className="flex overflow-x-auto scrollbar-hide border-t border-[#f0f0f0]" role="navigation" aria-label="Product categories">
            {CATEGORY_TABS.map((tab) => {
              const isActive =
                tab.href === '/collections'
                  ? pathname === '/collections' || pathname === '/'
                  : pathname === tab.href || pathname.startsWith(tab.href + '/')
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex-shrink-0 px-4 py-2.5 text-[13px] whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#e8572a] text-[#111] font-semibold'
                      : 'border-transparent text-[#555] font-normal hover:text-[#111]'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>

        </div>
      </header>

      {/* Drawers */}
      <CategoriesDrawer open={drawerOpen} onClose={closeDrawer} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  )
}
