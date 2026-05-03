'use client'
import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface Props {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function ProductAccordion({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-[#e8e8e8]">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#111]">
          {title}
        </span>
        {open
          ? <Minus size={16} strokeWidth={2} className="text-[#111] flex-shrink-0" />
          : <Plus  size={16} strokeWidth={2} className="text-[#111] flex-shrink-0" />}
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  )
}
