import Link from 'next/link'
import CartRecos from './CartRecos'

export default function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ paddingTop: 12 }}>
      {/* Empty state message */}
      <div style={{ textAlign: 'center', paddingTop: 32, paddingBottom: 28 }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 18,
          fontWeight: 700,
          color: '#111',
          marginBottom: 10,
        }}>
          Your cart is empty
        </div>
        <p style={{
          fontSize: 12,
          color: '#aaa',
          margin: '0 0 20px',
          lineHeight: 1.6,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          Discover pieces worth keeping.
        </p>
        <Link
          href="/collections"
          onClick={onClose}
          style={{
            display: 'inline-block',
            background: '#111',
            color: '#fff',
            padding: '12px 28px',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textDecoration: 'none',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          SHOP ALL
        </Link>
      </div>

      {/* Slot C — START WITH WHAT'S SELLING */}
      <CartRecos slot="C" onClose={onClose} />
    </div>
  )
}
