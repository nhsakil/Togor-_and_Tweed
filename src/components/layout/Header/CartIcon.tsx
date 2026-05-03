'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export default function CartIcon({ scrolled }: { scrolled?: boolean }) {
  const totalItems = useCartStore((s) => s.totalItems)
  const count = totalItems()

  return (
    <Link
      href="/cart"
      aria-label={`Cart (${count} items)`}
      className={`relative p-1.5 transition-colors hover:text-brand-gold ${
        scrolled === false ? 'text-white' : 'text-brand-black'
      }`}
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-brand-gold text-white text-[10px] font-bold rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
