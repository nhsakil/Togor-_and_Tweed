'use client'

import { useEffect } from 'react'
import { trackPurchase } from '@/lib/analytics'

interface OrderItem {
  id: string
  productName: string
  totalPrice: number
  quantity: number
  size?: string | null
  color?: string | null
}

interface Props {
  orderId: string
  orderNumber: string
  total: number
  couponCode?: string | null
  items: OrderItem[]
}

/**
 * Fires a GA4 purchase event once when the order confirmation page mounts.
 * Rendered as a client component so it can call the browser gtag().
 */
export default function PurchaseTracker({ orderId, orderNumber, total, couponCode, items }: Props) {
  useEffect(() => {
    trackPurchase({
      transaction_id: orderNumber,
      value: total,
      coupon: couponCode ?? undefined,
      items: items.map(item => ({
        item_id:       item.id,
        item_name:     item.productName,
        item_brand:    'Togor & Tweed',
        price:         Number(item.totalPrice) / item.quantity,
        quantity:      item.quantity,
        item_variant:  [item.size, item.color].filter(Boolean).join(' / ') || undefined,
      })),
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  return null
}
