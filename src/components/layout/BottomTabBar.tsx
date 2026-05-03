'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'

/* ── SVG tab icons ─────────────────────────────────────────────────────────── */

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {/* Filled roof when active */}
      {active
        ? <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill="currentColor" stroke="none" />
        : <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      }
      {/* Door */}
      <path d="M9 21V12h6v9" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.75" />
    </svg>
  )
}

function IconExplore({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" fill={active ? 'currentColor' : 'none'} />
      <rect x="14" y="3" width="7" height="7" fill={active ? 'currentColor' : 'none'} />
      <rect x="3" y="14" width="7" height="7" fill={active ? 'currentColor' : 'none'} />
      <rect x="14" y="14" width="7" height="7" fill={active ? 'currentColor' : 'none'} />
    </svg>
  )
}

function IconCart({ count }: { count: number }) {
  const label = count > 9 ? '9+' : String(count)
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V9z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 19.5C10 17.5 7.5 16 7.5 14C7.5 12.5 8.7 11.5 10 11.5C10.9 11.5 11.6 12 12 12.7C12.4 12 13.1 11.5 14 11.5C15.3 11.5 16.5 12.5 16.5 14C16.5 16 14 17.5 12 19.5Z"
        fill="#e8572a" stroke="none"
      />
      <rect x="16" y="5" width="8" height="5.5" fill="white" stroke="none" />
      <text x="20" y="8.5" textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="700" fill="#111111" stroke="none">
        {label}
      </text>
    </svg>
  )
}

function IconProfile({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" fill={active ? 'currentColor' : 'none'} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function BottomTabBar() {
  const pathname  = usePathname()
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))

  const isHome     = pathname === '/'
  const isExplore  = pathname.startsWith('/collections') || pathname.startsWith('/products')
  const isCart     = pathname === '/cart'
  const isProfile  = pathname.startsWith('/account')

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e8e8e8]"
      aria-label="Bottom navigation"
    >
      <div className="max-w-[480px] mx-auto flex items-center h-[60px]">

        {/* Home */}
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors ${isHome ? 'text-[#111]' : 'text-[#aaa]'}`}
          aria-label="Home"
        >
          <IconHome active={isHome} />
          <span className="text-[9px] uppercase tracking-[0.06em] font-semibold">Home</span>
        </Link>

        {/* Explore */}
        <Link
          href="/collections"
          className={`flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors ${isExplore ? 'text-[#111]' : 'text-[#aaa]'}`}
          aria-label="Explore collections"
        >
          <IconExplore active={isExplore} />
          <span className="text-[9px] uppercase tracking-[0.06em] font-semibold">Explore</span>
        </Link>

        {/* NEW — centre pill (Snitch-style orange) */}
        <Link
          href="/collections/new-arrivals"
          className="flex-1 flex flex-col items-center justify-center"
          aria-label="New arrivals"
        >
          <span className="bg-[#e8572a] text-white text-[11px] font-bold uppercase tracking-[0.08em] px-4 py-[5px]">
            NEW
          </span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className={`flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors ${isCart ? 'text-[#111]' : 'text-[#aaa]'}`}
          aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
        >
          <IconCart count={itemCount} />
          <span className="text-[9px] uppercase tracking-[0.06em] font-semibold">Cart</span>
        </Link>

        {/* Profile */}
        <Link
          href="/account"
          className={`flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors ${isProfile ? 'text-[#111]' : 'text-[#aaa]'}`}
          aria-label="Account"
        >
          <IconProfile active={isProfile} />
          <span className="text-[9px] uppercase tracking-[0.06em] font-semibold">Profile</span>
        </Link>

      </div>
    </nav>
  )
}
