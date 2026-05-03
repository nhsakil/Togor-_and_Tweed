'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'

interface RecoProduct {
  id: string
  name: string
  slug: string
  price: number
  originalPrice: number | null
  image: string | null
  imageAlt: string
}

interface Props {
  slot: 'B' | 'C'  // B = cart with items, C = empty cart
  onClose?: () => void
}

export default function CartRecos({ slot, onClose }: Props) {
  const [products, setProducts] = useState<RecoProduct[]>([])
  const [loading, setLoading] = useState(true)
  const items = useCartStore(s => s.items)

  const fetchRecos = useCallback(async () => {
    setLoading(true)
    const excludeIds = items.map(i => i.productId).join(',')
    const url = `/api/recommendations?limit=6${excludeIds ? `&exclude=${excludeIds}` : ''}`
    try {
      const res = await fetch(url)
      if (res.ok) setProducts(await res.json())
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [items])

  useEffect(() => { fetchRecos() }, [fetchRecos])

  if (loading || products.length === 0) return null

  const heading = slot === 'B' ? 'COMPLETE THE FIT' : 'START WITH WHAT\'S SELLING'

  return (
    <div style={{
      borderTop: '1px solid #e5e3df',
      paddingTop: 20,
      marginTop: 20,
    }}>
      {/* Section heading */}
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.18em',
        color: '#aaa',
        marginBottom: 14,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {heading}
      </div>

      {/* Horizontal scroll */}
      <div style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 4,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
        className="hide-scrollbar"
      >
        {products.map(p => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: 120,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            {/* Image */}
            <div style={{
              width: 120,
              height: 150,
              background: '#f7f7f6',
              overflow: 'hidden',
              marginBottom: 8,
            }}>
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.imageAlt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ccc', fontSize: 11,
                }}>
                  No image
                </div>
              )}
            </div>

            {/* Name */}
            <div style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#222',
              lineHeight: 1.3,
              marginBottom: 4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {p.name}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>
                ${p.price.toFixed(0)}
              </span>
              {p.originalPrice && (
                <span style={{ fontSize: 10, color: '#aaa', textDecoration: 'line-through' }}>
                  ${p.originalPrice.toFixed(0)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
