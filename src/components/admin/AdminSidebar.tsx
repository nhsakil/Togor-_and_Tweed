'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const MAIN_NAV = [
  { label: 'DASHBOARD',      href: '/admin' },
  { label: 'ORDERS',         href: '/admin/orders' },
  { label: 'BULK SHIPMENT',  href: '/admin/bulk-shipment' },
  { label: 'CART LEADS',     href: '/admin/cart-leads' },
  { label: 'PRODUCTS',       href: '/admin/products' },
  { label: 'CATEGORIES',     href: '/admin/categories' },
  { label: 'SIZE CHARTS',    href: '/admin/size-charts' },
  { label: 'CATEGORY SIZES', href: '/admin/category-sizes' },
  { label: 'COUPONS',        href: '/admin/coupons' },
  { label: 'USERS',          href: '/admin/users' },
]

const INSIGHTS_NAV = [
  { label: 'ANALYTICS', href: '/admin/analytics' },
  { label: 'AUDIT LOG',  href: '/admin/audit-log' },
]

const CONFIG_NAV = [
  { label: 'SITE SETTINGS', href: '/admin/settings' },
  { label: 'HOME SEO',      href: '/admin/home-seo'  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const navItemStyle = (href: string): React.CSSProperties => ({
    display: 'block',
    padding: '7px 28px',
    fontSize: 11,
    fontWeight: isActive(href) ? 700 : 400,
    letterSpacing: '0.12em',
    color: isActive(href) ? '#111' : '#888',
    textDecoration: 'none',
    borderLeft: isActive(href) ? '2px solid #c8a96e' : '2px solid transparent',
    transition: 'color 0.15s, border-color 0.15s',
    fontFamily: "'Inter', system-ui, sans-serif",
  })

  return (
    <div style={{
      width: 200,
      minWidth: 200,
      height: '100vh',
      background: '#f7f7f6',
      borderRight: '1px solid #e5e3df',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 28px 20px' }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 16,
          fontWeight: 700,
          color: '#111',
          lineHeight: 1.2,
          letterSpacing: '0.01em',
        }}>
          Togor <em style={{ fontStyle: 'italic' }}>&amp;</em> Tweed
        </div>
        <div style={{
          marginTop: 5,
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: '0.2em',
          color: '#aaa',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          ADMIN · V2.1
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#e5e3df', margin: '0 0 12px' }} />

      {/* Main Nav */}
      <nav style={{ flex: 1 }}>
        <div style={{ paddingBottom: 8 }}>
          {MAIN_NAV.map(item => (
            <Link key={item.href} href={item.href} style={navItemStyle(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#e5e3df', margin: '8px 0' }} />

        {/* Insights section */}
        <div style={{ padding: '10px 28px 4px' }}>
          <div style={{
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.2em',
            color: '#bbb',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            INSIGHTS
          </div>
        </div>
        {INSIGHTS_NAV.map(item => (
          <Link key={item.href} href={item.href} style={navItemStyle(item.href)}>
            {item.label}
          </Link>
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: '#e5e3df', margin: '8px 0' }} />

        {/* Config section */}
        <div style={{ padding: '10px 28px 4px' }}>
          <div style={{
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.2em',
            color: '#bbb',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            CONFIG
          </div>
        </div>
        {CONFIG_NAV.map(item => (
          <Link key={item.href} href={item.href} style={navItemStyle(item.href)}>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 28px 24px', borderTop: '1px solid #e5e3df', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link href="/" style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.12em',
          color: '#888',
          textDecoration: 'none',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          ← VIEW STORE
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            all: 'unset',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.12em',
            color: '#c0392b',
            cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  )
}
