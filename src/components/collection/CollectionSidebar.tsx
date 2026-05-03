'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, X, Plus, Minus } from 'lucide-react'

/** Header height: AnnouncementBar(32) + DesktopNav row(56) + category strip(40) = 128px */
const HEADER_H = 128

interface ColorOption {
  value: string
  hex?: string | null
}

interface Props {
  activeSort?: string
  baseUrl: string
  priceMin?: string
  priceMax?: string
  size?: string
  color?: string
  colors?: ColorOption[]
  sizes?: string[]
  total?: number
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

const PRESET_COLORS: ColorOption[] = [
  { value: 'White',    hex: '#f5f5f5' },
  { value: 'Black',    hex: '#111111' },
  { value: 'Navy',     hex: '#1b2a4a' },
  { value: 'Blue',     hex: '#1a5fb4' },
  { value: 'Grey',     hex: '#888888' },
  { value: 'Red',      hex: '#e00000' },
  { value: 'Green',    hex: '#2e7d32' },
  { value: 'Beige',    hex: '#d9c9a3' },
  { value: 'Brown',    hex: '#5d4037' },
  { value: 'Olive',    hex: '#6b7c2a' },
  { value: 'Maroon',   hex: '#800000' },
  { value: 'Pink',     hex: '#e91e8c' },
  { value: 'Yellow',   hex: '#f9c722' },
  { value: 'Orange',   hex: '#e65c00' },
  { value: 'Mustard',  hex: '#e3a900' },
  { value: 'Charcoal', hex: '#404040' },
]

const PRICE_MIN = 0
const PRICE_MAX = 5000

function PriceRangeSlider({
  initialMin,
  initialMax,
  onApply,
}: {
  initialMin: number
  initialMax: number
  onApply: (min: number, max: number) => void
}) {
  const [lo, setLo] = useState(initialMin)
  const [hi, setHi] = useState(initialMax)

  const loPercent = ((lo - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const hiPercent = ((hi - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100

  function handleLo(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value), hi - 100)
    setLo(v)
  }

  function handleHi(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value), lo + 100)
    setHi(v)
  }

  return (
    <div className="px-5 pb-5">
      <div className="flex justify-between mb-3">
        <span className="text-[12px] text-[#111] font-semibold">৳{lo.toLocaleString()}</span>
        <span className="text-[12px] text-[#111] font-semibold">৳{hi.toLocaleString()}</span>
      </div>

      <div className="relative h-1 rounded-full mb-5" style={{ background: '#e0e0e0' }}>
        <div
          className="absolute h-full rounded-full bg-[#111]"
          style={{ left: `${loPercent}%`, width: `${hiPercent - loPercent}%` }}
        />
        <input
          type="range" min={PRICE_MIN} max={PRICE_MAX} step={100} value={lo} onChange={handleLo}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: lo > PRICE_MAX - 200 ? 5 : 3 }}
          aria-label="Minimum price"
        />
        <input
          type="range" min={PRICE_MIN} max={PRICE_MAX} step={100} value={hi} onChange={handleHi}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
          aria-label="Maximum price"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#111] pointer-events-none shadow-sm"
          style={{ left: `calc(${loPercent}% - 8px)` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#111] pointer-events-none shadow-sm"
          style={{ left: `calc(${hiPercent}% - 8px)` }}
        />
      </div>

      <button
        onClick={() => onApply(lo, hi)}
        className="w-full py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] bg-[#111] text-white hover:bg-[#333] transition-colors"
      >
        Apply
      </button>
    </div>
  )
}

export default function CollectionSidebar({
  baseUrl,
  priceMin,
  priceMax,
  size,
  color,
  colors = [],
  sizes = [],
  total = 0,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['size', 'color', 'price'])
  )

  const displaySizes  = sizes
  const displayColors = colors

  function buildUrl(overrides: Record<string, string | undefined>): string {
    if (typeof window === 'undefined') return baseUrl
    const u = new URL(baseUrl, window.location.origin)
    new URLSearchParams(window.location.search).forEach((v, k) => {
      u.searchParams.set(k, v)
    })
    Object.entries(overrides).forEach(([k, v]) => {
      if (v !== undefined && v !== '') u.searchParams.set(k, v)
      else u.searchParams.delete(k)
    })
    return u.pathname + (u.search || '')
  }

  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const applyPrice = useCallback((lo: number, hi: number) => {
    const url = buildUrl({
      priceMin: lo > PRICE_MIN ? String(lo) : undefined,
      priceMax: hi < PRICE_MAX ? String(hi) : undefined,
      page: '1',
    })
    window.location.href = url
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl])

  function clearAll() {
    const u = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    if (typeof window !== 'undefined') {
      const subcat = new URLSearchParams(window.location.search).get('subcat')
      if (subcat) u.searchParams.set('subcat', subcat)
    }
    window.location.href = u.pathname + (u.search || '')
  }

  const hasActiveFilters = !!(size || color || priceMin || priceMax)

  function SectionHeader({ id, label }: { id: string; label: string }) {
    const isOpen = openSections.has(id)
    return (
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#fafafa] transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#111]">{label}</span>
        {isOpen
          ? <Minus size={12} strokeWidth={2.5} className="text-[#666] flex-shrink-0" />
          : <Plus  size={12} strokeWidth={2.5} className="text-[#666] flex-shrink-0" />}
      </button>
    )
  }

  const filterBody = (
    <div className="overflow-y-auto" style={{ maxHeight: `calc(100vh - ${HEADER_H}px - 64px)` }}>

      {/* SIZE */}
      {displaySizes.length > 0 && (
      <div className="border-b border-[#f0f0f0]">
        <SectionHeader id="size" label="Size" />
        {openSections.has('size') && (
          <div className="px-5 pb-4 flex flex-wrap gap-1.5">
            {displaySizes.map((s) => (
              <Link
                key={s}
                href={buildUrl({ size: size === s ? undefined : s, page: '1' })}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 text-[11px] font-semibold uppercase text-center border transition-colors ${
                  size === s
                    ? 'bg-[#111] text-white border-[#111]'
                    : 'bg-white text-[#555] border-[#ddd] hover:border-[#111] hover:text-[#111]'
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        )}
      </div>
      )}

      {/* COLOR */}
      {displayColors.length > 0 && (
      <div className="border-b border-[#f0f0f0]">
        <SectionHeader id="color" label="Color" />
        {openSections.has('color') && (
          <div className="px-5 pb-4 flex flex-wrap gap-3">
            {displayColors.map(({ value, hex }) => {
              const swatchHex = hex ?? '#cccccc'
              const isActive  = color?.toLowerCase() === value.toLowerCase()
              const isLight   = ['white', 'off-white', 'cream', 'beige'].includes(value.toLowerCase())
              return (
                <Link
                  key={value}
                  href={buildUrl({ color: isActive ? undefined : value, page: '1' })}
                  onClick={() => setMobileOpen(false)}
                  title={value}
                  aria-label={`${value}${isActive ? ' (active)' : ''}`}
                  className="group flex flex-col items-center gap-1"
                >
                  <span
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      isActive
                        ? 'border-[#111] scale-110'
                        : 'border-transparent group-hover:border-[#aaa]'
                    } ${isLight ? 'shadow-[inset_0_0_0_1px_#ddd]' : ''}`}
                    style={{ backgroundColor: swatchHex }}
                  />
                  <span className={`text-[9px] uppercase tracking-wide leading-none ${
                    isActive ? 'text-[#111] font-bold' : 'text-[#888]'
                  }`}>
                    {value.length > 7 ? value.slice(0, 6) + '\u2026' : value}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      )}

      {/* PRICE */}
      <div className="border-b border-[#f0f0f0]">
        <SectionHeader id="price" label="Price" />
        {openSections.has('price') && (
          <PriceRangeSlider
            initialMin={priceMin ? parseInt(priceMin) : PRICE_MIN}
            initialMax={priceMax ? parseInt(priceMax) : PRICE_MAX}
            onApply={applyPrice}
          />
        )}
      </div>

    </div>
  )

  return (
    <>
      {/* Ghost spacer — holds 256px layout space while the fixed aside floats */}
      <div className="hidden md:block flex-shrink-0" style={{ width: 256 }} />

      {/* Desktop fixed sidebar — stays visible through SEO section and footer */}
      <aside
        className="hidden md:flex flex-col bg-white border-r border-[#e8e8e8]"
        style={{
          position: 'fixed',
          top: HEADER_H,
          left: 0,
          width: 256,
          height: `calc(100vh - ${HEADER_H}px)`,
          zIndex: 20,
        }}
        aria-label="Collection filters"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e8] flex-shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#111]">Filters</span>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-[10px] uppercase tracking-[0.08em] text-[#888] hover:text-[#111] transition-colors">
              Clear All
            </button>
          )}
        </div>

        {filterBody}

        <div className="flex-shrink-0 border-t border-[#e8e8e8] p-4 grid grid-cols-2 gap-2">
          <button
            onClick={clearAll}
            className="py-3 text-[11px] font-bold uppercase tracking-[0.1em] border border-[#ddd] text-[#555] hover:border-[#111] hover:text-[#111] transition-colors"
          >
            Clear
          </button>
          <div className="py-3 text-[11px] font-bold uppercase tracking-[0.1em] bg-[#111] text-white text-center">
            Apply ({total})
          </div>
        </div>
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#111] text-white px-4 py-3 shadow-xl text-[11px] font-bold uppercase tracking-[0.1em]"
        aria-label="Open filters"
      >
        <SlidersHorizontal size={16} strokeWidth={2} />
        Filter
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <div
        role="dialog" aria-modal="true" aria-label="Collection filters"
        className={`fixed left-0 top-0 h-screen bg-white z-50 md:hidden flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        style={{ width: 288 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] flex-shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#111]">Filters</span>
          <button onClick={() => setMobileOpen(false)} aria-label="Close" className="p-1">
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>
        {filterBody}
        <div className="flex-shrink-0 border-t border-[#e8e8e8] p-4 grid grid-cols-2 gap-2">
          <button onClick={clearAll} className="py-3 text-[11px] font-bold uppercase tracking-[0.1em] border border-[#ddd] text-[#555] hover:border-[#111] transition-colors">
            Clear
          </button>
          <button onClick={() => setMobileOpen(false)} className="py-3 text-[11px] font-bold uppercase tracking-[0.1em] bg-[#111] text-white">
            Apply ({total})
          </button>
        </div>
      </div>
    </>
  )
}
