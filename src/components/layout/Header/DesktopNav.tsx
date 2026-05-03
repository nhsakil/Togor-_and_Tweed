'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { PRODUCT_CATEGORY_LINKS, SITE_NAME } from '@/lib/constants'
import { useCartStore } from '@/store/cartStore'
import { useCallback, useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import CategoriesDrawer from './CategoriesDrawer'
import SearchOverlay from './SearchOverlay'

/* ── Cycling search placeholders ──────────────────────────────────────────── */
const SEARCH_HINTS = [
  'Search "SHIRTS"',
  'Search "PANJABI"',
  'Search "T-SHIRTS"',
  'Search "POLO"',
  'Search "TROUSERS"',
]

/* ── SVG icons — thin stroke, matching Snitch line weight ─────────────────── */

/* Hamburger — scaled up, all 3 lines same weight 1.5px; middle is orange */
function IconHamburger() {
  return (
    <svg width="24" height="17" viewBox="0 0 24 17" fill="none" strokeLinecap="round">
      <line x1="0" y1="1"   x2="24" y2="1"   stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="8.5" x2="24" y2="8.5" stroke="#e8572a"      strokeWidth="1.5" />
      <line x1="0" y1="16"  x2="24" y2="16"  stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/* User — 26px, strokeWidth 1.2, open-bottom shoulder arc matching Snitch */
function IconUser() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

/* Cart bag — badge above the bag body, right of handle; white rect erases only the top-right corner line */
function IconBag({ count }: { count: number }) {
  const label = count > 9 ? '9+' : String(count)
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Rectangular bag body */}
      <path d="M4 9h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V9z" stroke="currentColor" strokeWidth="1.2" />
      {/* U-shaped handle — untouched, stays fully visible */}
      <path d="M9 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" />
      {/* Orange filled heart — centered inside bag body */}
      <path
        d="M12 19.5C10 17.5 7.5 16 7.5 14C7.5 12.5 8.7 11.5 10 11.5C10.9 11.5 11.6 12 12 12.7C12.4 12 13.1 11.5 14 11.5C15.3 11.5 16.5 12.5 16.5 14C16.5 16 14 17.5 12 19.5Z"
        fill="#e8572a" stroke="none"
      />
      {/* White knockout — only erases the top-right corner area (right of handle, above bag) */}
      <rect x="16" y="5" width="8" height="5.5" fill="white" stroke="none" />
      {/* Black count — sits above the bag top-right corner, handle untouched */}
      <text x="20" y="8.5" textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="700" fill="#111111" stroke="none">
        {label}
      </text>
    </svg>
  )
}

/* Magnifying glass */
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M21 21l-5.5-5.5" />
    </svg>
  )
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function DesktopNav({ logoUrl }: { logoUrl?: string | null }) {
  const { data: session } = useSession()
  const isAdmin   = (session?.user as { role?: string } | undefined)?.role === 'ADMIN'
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const pathname  = usePathname()
  const router    = useRouter()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ]                   = useState('')
  const [hintIdx, setHintIdx]       = useState(0)
  const [animating, setAnimating]   = useState(false)
  const inputRef                    = useRef<HTMLInputElement>(null)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  /* Cycle placeholder every 2.5s with fade */
  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setHintIdx((i) => (i + 1) % SEARCH_HINTS.length)
        setAnimating(false)
      }, 200)
    }, 2500)
    return () => clearInterval(id)
  }, [])

  /* Close categories drawer on Escape */
  useEffect(() => {
    if (!drawerOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [drawerOpen, closeDrawer])

  /* Close search overlay on Escape */
  useEffect(() => {
    if (!searchOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false) }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [searchOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
    setQ('')
    setSearchOpen(false)
  }

  return (
    <>
      <header className="hidden md:block fixed top-8 left-0 right-0 z-40 bg-white border-b border-[#e8e8e8]">

        {/* ── Top row — position:relative so logo can be absolute-centered ── */}
        <div className="relative max-w-[1600px] mx-auto px-6 h-[60px] flex items-center">

          {/* LEFT — hamburger */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? 'Close categories' : 'Browse categories'}
            aria-expanded={drawerOpen}
            className="p-2 text-[#111] hover:opacity-60 transition-opacity flex-shrink-0"
          >
            <IconHamburger />
          </button>

          {/* CENTER — logo, truly absolute-centered regardless of side widths */}
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <Link href="/" className="pointer-events-auto hover:opacity-75 transition-opacity flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={SITE_NAME}
                  style={{ height: 40, width: 'auto', maxWidth: 200, objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <span className="font-playfair text-[22px] font-bold tracking-tight text-[#111]">
                  {SITE_NAME}
                </span>
              )}
            </Link>
          </div>

          {/* RIGHT — search bar + user + cart */}
          <div className="ml-auto flex items-center gap-2">

            {/* Always-visible search bar — focus opens SearchOverlay */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 border border-[#c8c8c8] bg-white px-3 h-[38px] flex-shrink-0"
              style={{ width: 300 }}
              role="search"
            >
              <span className="text-[#888] flex-shrink-0">
                <IconSearch />
              </span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder={animating ? '' : SEARCH_HINTS[hintIdx]}
                className="flex-1 text-[13px] font-medium outline-none bg-transparent text-[#111] min-w-0 placeholder:text-[#999] placeholder:font-normal"
                style={{ transition: 'opacity 0.2s', opacity: animating ? 0 : 1 }}
                aria-label="Search products"
                aria-expanded={searchOpen}
              />
              {q && (
                <button
                  type="button"
                  onClick={() => { setQ(''); inputRef.current?.focus() }}
                  className="text-[#bbb] hover:text-[#555] transition-colors flex-shrink-0"
                  aria-label="Clear search"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </form>

            {/* User */}
            <Link
              href="/account"
              aria-label="Account"
              className="p-2 text-[#111] hover:opacity-60 transition-opacity flex-shrink-0"
            >
              <IconUser />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Cart, ${itemCount} items`}
              className="p-2 text-[#111] hover:opacity-60 transition-opacity flex-shrink-0"
            >
              <IconBag count={itemCount} />
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#c8a96e] hover:text-[#a8863f] px-2 py-1 transition-colors flex-shrink-0 ml-1"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* ── Category strip — orange active underline, title-case, no uppercase ── */}
        <div className="border-t border-[#f0f0f0] overflow-x-auto scrollbar-hide">
          <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-center">
            {PRODUCT_CATEGORY_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap px-4 py-3 text-[14px] font-medium tracking-[0.01em] transition-colors border-b-2 ${
                    isActive
                      ? 'border-b-[3px] border-[#e8572a] text-[#111]'
                      : 'border-b-2 border-transparent text-[#444] hover:text-[#111] hover:border-[#ccc]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      <CategoriesDrawer open={drawerOpen} onClose={closeDrawer} />
      {/* SearchOverlay — desktop search dropdown with Top Searches + Trending */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
