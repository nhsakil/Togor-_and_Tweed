'use client'

interface Option { label: string; value: string }

interface Props {
  value: string
  options: Option[]
  baseUrl: string
}

export default function SortSelect({ value, options, baseUrl }: Props) {
  return (
    <div>
      <label htmlFor="sort-select" className="sr-only">Sort products by</label>
      <select
        id="sort-select"
        defaultValue={value}
        onChange={(e) => {
          const url = new URL(baseUrl, window.location.origin)
          url.searchParams.set('sort', e.target.value)
          url.searchParams.set('page', '1')
          window.location.href = url.toString()
        }}
        className="border border-gray-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-gold"
        aria-label="Sort products by"
      >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
      </select>
    </div>
  )
}
