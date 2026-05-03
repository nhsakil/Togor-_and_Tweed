'use client'

import { ChevronDown } from 'lucide-react'

interface Option {
  label: string
  value: string
}

interface Props {
  baseUrl:     string
  currentSort: string
  options:     Option[]
}

export default function SortDropdown({ baseUrl, currentSort, options }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = new URL(baseUrl, window.location.origin)
    // preserve existing search params
    new URLSearchParams(window.location.search).forEach((v, k) => {
      url.searchParams.set(k, v)
    })
    url.searchParams.set('sort', e.target.value)
    url.searchParams.set('page', '1')
    window.location.href = url.toString()
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        defaultValue={currentSort}
        onChange={handleChange}
        aria-label="Sort products"
        className="appearance-none pl-3 pr-8 py-2 border border-[#ddd] text-[12px] text-[#444] bg-white focus:outline-none focus:border-[#111] cursor-pointer hover:border-[#111] transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={13}
        strokeWidth={2}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none"
      />
    </div>
  )
}
