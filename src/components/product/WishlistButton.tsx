'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { toggleWishlist } from '@/actions/account'

interface Props {
  productId: string
  initialWishlisted: boolean
}

export default function WishlistButton({ productId, initialWishlisted }: Props) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const result = await toggleWishlist(productId)
    setLoading(false)

    if (result.success) {
      setWishlisted(result.added)
      toast.success(result.added ? 'Added to wishlist' : 'Removed from wishlist')
    } else {
      toast.error('Sign in to save to wishlist')
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="w-12 h-12 border border-gray-300 flex items-center justify-center hover:border-brand-gold transition-colors disabled:opacity-60"
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={20}
        className={wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600'}
      />
    </button>
  )
}
