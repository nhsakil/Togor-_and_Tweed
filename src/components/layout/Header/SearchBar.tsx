'use client'

import { Search, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency } from '@/lib/utils/format'

interface SearchResult {
  id: string
  name: string
  slug: string
  brand: string | null
  price: number
  salePrice: number | null
  image: string | null
}

interface Props {
  compact?: boolean
  scrolled?: boolean
}

export default function SearchBar({ compact, scrolled }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch live results
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      setOpen(false)
      setResults([])
    }
  }

  function handleResultClick(slug: string) {
    router.push(`/products/${slug}`)
    setQuery('')
    setOpen(false)
    setResults([])
  }

  const showDropdown = open && (loading || results.length > 0 || debouncedQuery.length >= 2)

  // Dropdown panel shared by both compact and full modes
  const dropdown = showDropdown ? (
    <div className="absolute top-full mt-1 bg-white border border-gray-200 shadow-xl z-50 w-[320px] right-0" role="region" aria-label="Search results">
      {loading && (
        <div className="px-4 py-3 text-sm text-gray-400 animate-pulse" role="status" aria-live="polite">Searching…</div>
      )}
      {!loading && results.length === 0 && debouncedQuery.length >= 2 && (
        <div className="px-4 py-3 text-sm text-gray-400" role="status">No results for &quot;{debouncedQuery}&quot;</div>
      )}
      {!loading && results.length > 0 && (
        <ul role="listbox">
          {results.map((r) => (
            <li key={r.id} role="option">
              <button
                type="button"
                onClick={() => handleResultClick(r.slug)}
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                aria-label={`${r.name} - ${r.brand ?? 'Togor & Tweed'}`}
              >
                {/* Thumbnail */}
                <div className="w-10 h-12 bg-gray-100 shrink-0 overflow-hidden relative">
                  {r.image ? (
                    <Image src={r.image} alt={r.name} fill sizes="40px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider truncate">
                    {r.brand ?? 'Togor & Tweed'}
                  </p>
                  <p className="text-sm font-medium text-brand-black leading-tight truncate">{r.name}</p>
                  <p className="text-sm font-semibold text-brand-black mt-0.5">
                    {formatCurrency(r.salePrice ?? r.price)}
                    {r.salePrice && (
                      <span className="ml-1.5 text-xs text-gray-400 line-through font-normal">
                        {formatCurrency(r.price)}
                      </span>
                    )}
                  </p>
                </div>
              </button>
            </li>
          ))}
          <li className="border-t" role="option">
            {/* SR: fixed — replaced unsafe `handleSubmit as unknown as React.MouseEventHandler` cast with
                an inline handler that calls the same navigation logic directly */}
            <button
              type="button"
              onClick={() => {
                if (query.trim()) {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`)
                  setQuery('')
                  setOpen(false)
                  setResults([])
                }
              }}
              className="w-full text-center py-2.5 text-xs text-brand-gold uppercase tracking-wider hover:bg-gray-50 transition-colors"
              aria-label={`View all results for "${query}"`}
            >
              View all results for &quot;{query}&quot;
            </button>
          </li>
        </ul>
      )}
    </div>
  ) : null

  // Compact icon-only mode (for desktop header, expands on click)
  if (compact) {
    return (
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Search"
          className={`p-1.5 transition-colors hover:text-brand-gold ${
            scrolled === false ? 'text-white' : 'text-brand-black'
          }`}
        >
          {open ? <X size={20} /> : <Search size={20} />}
        </button>

        {open && (
          <form
            onSubmit={handleSubmit}
            className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-lg flex items-center"
            style={{ minWidth: 240 }}
          >
            {/* SR: fixed — added aria-label for accessibility; placeholder alone is insufficient */}
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="flex-1 px-4 py-2.5 text-sm text-brand-black focus:outline-none bg-white"
            />
            <button
              type="submit"
              className="px-3 text-gray-400 hover:text-brand-gold"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </form>
        )}
        {open && dropdown}
      </div>
    )
  }

  // Full search bar (mobile drawer or standalone)
  return (
    <div className="relative" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search…"
          aria-label="Search products"
          className="w-44 py-1.5 pl-3 pr-8 text-sm border border-gray-200 focus:outline-none focus:border-brand-gold bg-gray-50"
        />
        <button
          type="submit"
          aria-label="Submit search"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-gold"
        >
          <Search size={15} />
        </button>
      </form>
      {dropdown}
    </div>
  )
}
