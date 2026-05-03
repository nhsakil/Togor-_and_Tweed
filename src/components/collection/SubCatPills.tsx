'use client'

import Link from 'next/link'

interface Pill {
  label: string
  value: string | null
}

interface Props {
  pills:       Pill[]
  activeValue: string | null
  baseUrl:     string
  /** Current search params — sort, size, color, priceMin, priceMax are preserved */
  currentSp: {
    sort?:     string
    size?:     string
    color?:    string
    priceMin?: string
    priceMax?: string
    subcat?:   string
    page?:     string
    [key: string]: string | undefined
  }
}

export default function SubCatPills({ pills, activeValue, baseUrl, currentSp }: Props) {
  function buildUrl(value: string | null): string {
    const params = new URLSearchParams()
    const preserve = ['sort', 'size', 'color', 'priceMin', 'priceMax']
    preserve.forEach((k) => {
      const v = currentSp[k]
      if (v) params.set(k, v)
    })
    if (value) params.set('subcat', value)
    const qs = params.toString()
    return `${baseUrl}${qs ? '?' + qs : ''}`
  }

  return (
    <div className="overflow-x-auto -mx-1 scrollbar-hide">
      <div className="flex items-center gap-1.5 pb-2 px-1 min-w-max">
        {pills.map((pill) => {
          const isActive = pill.value === activeValue || (pill.value === null && !activeValue)
          return (
            <Link
              key={String(pill.value)}
              href={buildUrl(pill.value)}
              className={`whitespace-nowrap px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] border transition-colors ${
                isActive
                  ? 'bg-[#111] text-white border-[#111]'
                  : 'bg-white text-[#555] border-[#ddd] hover:border-[#111] hover:text-[#111]'
              }`}
            >
              {pill.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
