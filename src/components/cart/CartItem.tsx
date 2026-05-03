'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils/format'
import { trackRemoveFromCart } from '@/lib/analytics'
import { toggleWishlist } from '@/actions/account'
import { toast } from 'sonner'
import type { CartItem as CartItemType } from '@/types/cart'

interface Props {
  item: CartItemType
  isLoggedIn: boolean
  onNeedLogin: () => void
}

export default function CartItem({ item, isLoggedIn, onNeedLogin }: Props) {
  const { removeItem, updateQuantity } = useCartStore()

  async function handleMoveToWishlist() {
    if (!isLoggedIn) { onNeedLogin(); return }
    const result = await toggleWishlist(item.productId)
    if (result.success) {
      removeItem(item.variantId)
      toast.success('Moved to wishlist')
    } else {
      toast.error('Could not add to wishlist')
    }
  }

  return (
    <li className="flex gap-3 py-3 border-b border-[#f0f0f0] last:border-0">
      {/* Tall image */}
      <div
        className="relative flex-shrink-0 bg-[#f2f2f2] overflow-hidden"
        style={{ width: 88, aspectRatio: '3/4' }}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="88px"
            className="object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 bg-[#e8e8e8]" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Name + Trash */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold text-[#111] leading-snug line-clamp-2 flex-1">
              {item.name}
            </p>
            <button
              onClick={() => {
                trackRemoveFromCart({ item_id: item.variantId, item_name: item.name, price: item.price, quantity: item.quantity, item_brand: 'Togor & Tweed' })
                removeItem(item.variantId)
              }}
              aria-label={`Remove ${item.name}`}
              className="flex-shrink-0 p-0.5 text-[#bbb] hover:text-[#e00000] transition-colors"
            >
              <Trash2 size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Size / Color */}
          {(item.size || item.color) && (
            <p className="text-[11px] text-[#888] mt-1 uppercase tracking-[0.05em]">
              {[item.size, item.color].filter(Boolean).join('  ·  ')}
            </p>
          )}
        </div>

        {/* Bottom row: qty + price */}
        <div className="flex items-center justify-between mt-2">
          {/* Qty controls */}
          <div className="flex items-center gap-1 border border-[#e0e0e0]">
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              aria-label="Decrease"
              className="w-7 h-7 flex items-center justify-center text-[#555] hover:text-[#111] hover:bg-[#f5f5f5] transition-colors"
            >
              <Minus size={11} strokeWidth={2} />
            </button>
            <span className="text-[12px] font-semibold text-[#111] w-6 text-center leading-none">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              aria-label="Increase"
              className="w-7 h-7 flex items-center justify-center text-[#555] hover:text-[#111] hover:bg-[#f5f5f5] transition-colors"
            >
              <Plus size={11} strokeWidth={2} />
            </button>
          </div>

          {/* Price */}
          <span className="text-[14px] font-bold text-[#111]">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>

        {/* Move to wishlist */}
        <button
          onClick={handleMoveToWishlist}
          className="flex items-center gap-1 mt-1.5 w-fit text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888] hover:text-[#c26b47] transition-colors"
        >
          <Heart size={11} strokeWidth={1.75} />
          Move to Wishlist
        </button>
      </div>
    </li>
  )
}
