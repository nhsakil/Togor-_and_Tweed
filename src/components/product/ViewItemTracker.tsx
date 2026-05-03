'use client'

import { useEffect } from 'react'
import { trackViewItem } from '@/lib/analytics'

interface Props {
  itemId: string
  itemName: string
  itemCategory?: string
  price: number
}

/** Fires a GA4 view_item event once when the product page mounts. */
export default function ViewItemTracker({ itemId, itemName, itemCategory, price }: Props) {
  useEffect(() => {
    trackViewItem({
      item_id:       itemId,
      item_name:     itemName,
      item_category: itemCategory,
      item_brand:    'Togor & Tweed',
      price,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId])

  return null
}
