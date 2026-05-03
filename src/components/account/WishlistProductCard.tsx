'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { toggleWishlist } from '@/actions/account'
import { formatCurrency } from '@/lib/utils/format'

interface Props {
  productId: string
  name: string
  slug: string
  price: number
  salePrice?: number
  image: string | null
}

export default function WishlistProductCard({ productId, name, slug, price, salePrice, image }: Props) {
  const [removed, setRemoved] = useState(false)

  async function handleRemove() {
    const result = await toggleWishlist(productId)
    if (result.success && !result.added) {
      setRemoved(true)
      toast.success('Removed from wishlist')
    }
  }

  if (removed) return null

  const displayPrice = salePrice ?? price

  return (
    <div className="group relative">
      <Link href={`/products/${slug}`} className="block">
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
        <h3 className="text-sm font-medium truncate">{name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold">{formatCurrency(displayPrice)}</span>
          {salePrice && (
            <span className="text-xs text-gray-400 line-through">{formatCurrency(price)}</span>
          )}
        </div>
      </Link>

      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
        title="Remove from wishlist"
      >
        <Heart size={14} className="text-red-500 fill-red-500" />
      </button>
    </div>
  )
}
