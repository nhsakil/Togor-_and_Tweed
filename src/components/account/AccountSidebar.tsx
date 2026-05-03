'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react'

const NAV = [
  { href: '/account', label: 'Profile', icon: User, exact: true },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
]

export default function AccountSidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null }
}) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="space-y-1">
      {/* User info */}
      <div className="bg-white p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user.name ?? 'Guest'}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      </div>

      <nav className="bg-white overflow-hidden">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-gray-100 last:border-0 transition-colors ${
              isActive(href, exact)
                ? 'bg-brand-black text-white font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </nav>
    </aside>
  )
}
