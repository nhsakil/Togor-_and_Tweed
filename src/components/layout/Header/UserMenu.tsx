'use client'

import Link from 'next/link'
import { User } from 'lucide-react'

export default function UserMenu({ scrolled }: { scrolled?: boolean }) {
  return (
    <Link
      href="/account"
      aria-label="Account"
      className={`p-1.5 transition-colors hover:text-brand-gold ${
        scrolled === false ? 'text-white' : 'text-brand-black'
      }`}
    >
      <User size={20} />
    </Link>
  )
}
