'use client'

import { useState, forwardRef } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { addToCart } from '@/actions/cart'
import { trackAddToCart } from '@/lib/analytics'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'
import type { CartItem } from '@/types/cart'

interface Props {
  variantId: string
  productId: string
  name: string
  price: number
  image: string | null
  size?: string | null
  color?: string | null
  stock: number
  reservedQty: number
  slug?: string
  category?: string
}

const AddToCartButton = forwardRef<HTMLButtonElement, Props>(function AddToCartButton(
  { variantId, productId, name, price, image, size, color, stock, reservedQty, slug, category },
  ref
) {
  const [loading, setLoading] = useState(false)
  const addItem  = useCartStore((s) => s.addItem)
  const openCart = useUIStore((s) => s.openCart)
  const available = stock - reservedQty

  async function handleAddToCart() {
    if (available <= 0 || loading) return
    setLoading(true)

    // Optimistic add + open drawer immediately
    const newItem: CartItem = {
      variantId,
      productId,
      name,
      price,
      image:    image ?? null,
      size:     size  ?? null,
      color:    color ?? null,
      quantity: 1,
      slug:     slug  ?? '',
    }
    addItem(newItem)
    openCart()

    // GA4 add_to_cart event
    trackAddToCart({
      item_id:       variantId,
      item_name:     name,
      item_category: category,
      item_brand:    'Togor & Tweed',
      price,
      quantity:      1,
      item_variant:  [size, color].filter(Boolean).join(' / ') || undefined,
    })

    // Persist server-side silently
    addToCart({ variantId, quantity: 1 }).then(result => {
      if (!result.success) {
        toast.error(result.error ?? 'Could not save cart')
      }
    }).catch(() => {})

    setLoading(false)
  }

  if (available <= 0) {
    return (
      <button disabled
        className="w-full h-[52px] bg-[#ccc] text-white text-[12px] font-bold uppercase tracking-[0.15em] cursor-not-allowed flex items-center justify-center">
        Out of Stock
      </button>
    )
  }

  return (
    <button
      ref={ref}
      onClick={handleAddToCart}
      disabled={loading}
      className="w-full h-[52px] bg-[#111] text-white text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-[#333] transition-colors disabled:bg-[#aaa] disabled:cursor-wait flex items-center justify-center gap-2"
    >
      <ShoppingBag size={16} strokeWidth={1.75} />
      {loading ? 'Adding…' : 'Add to Cart'}
    </button>
  )
})

export default AddToCartButton
