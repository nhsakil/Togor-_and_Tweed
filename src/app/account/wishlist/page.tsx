import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import WishlistProductCard from '@/components/account/WishlistProductCard'

export const metadata = { title: 'My Wishlist — Togor & Tweed' }

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: 'desc' },
    include: {
      product: {
        include: {
          images: { where: { isDefault: true }, take: 1 },
          variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
        },
      },
    },
  }).catch(() => [])

  return (
    <div className="bg-white p-6 md:p-8">
      <h2 className="font-playfair text-xl font-semibold mb-6">
        My Wishlist {wishlist.length > 0 && <span className="text-gray-400 font-normal text-lg">({wishlist.length})</span>}
      </h2>

      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1} />
          <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
          <Link
            href="/collections"
            className="inline-block bg-brand-black text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors"
          >
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <WishlistProductCard
              key={item.id}
              productId={item.productId}
              name={item.product.name}
              slug={item.product.slug}
              price={Number(item.product.variants[0]?.price ?? item.product.basePrice)}
              salePrice={
                item.product.variants[0]?.salePrice
                  ? Number(item.product.variants[0].salePrice)
                  : item.product.salePrice
                  ? Number(item.product.salePrice)
                  : undefined
              }
              image={item.product.images[0]?.url ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
