import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/product/ProductCard'
import SearchTracker from '@/components/search/SearchTracker'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search — Togor & Tweed',
  description: 'Search for shirts, panjabi, t-shirts, polo, trousers and more at Togor & Tweed Bangladesh.',
  robots: { index: false, follow: true },
}

interface RawProduct {
  id: string
  name: string
  slug: string
  brand: string | null
  basePrice: number
  salePrice: number | null
  createdAt: Date
  isFeatured: boolean
}

interface SearchProduct extends RawProduct {
  images: { url: string; isDefault: boolean }[]
  variants: { price: number; salePrice: number | null }[]
}

export default async function SearchPage(props: { searchParams: Promise<{ q?: string }> }) {
  const sp = await props.searchParams
  const query = sp.q?.trim() ?? ''

  let products: SearchProduct[] = []

  if (query) {
    try {
      // Try MATCH AGAINST for full-text search (MySQL)
      const rawProducts = await prisma.$queryRaw`
        SELECT
          p.id,
          p.name,
          p.slug,
          p.brand,
          p.basePrice,
          p.salePrice,
          p.createdAt,
          p.isFeatured
        FROM products p
        WHERE p.isActive = true
        AND MATCH(p.name, p.tags) AGAINST(${query} IN BOOLEAN MODE)
        ORDER BY p.isFeatured DESC, p.createdAt DESC
        LIMIT 48
      `

      // Fetch related data for formatted results
      products = await Promise.all(
        (rawProducts as RawProduct[]).map(async (p) => ({
          ...p,
          images: await prisma.productImage.findMany({
            where: { productId: p.id, isDefault: true },
            take: 1,
          }),
          variants: await prisma.productVariant.findMany({
            where: { productId: p.id, isActive: true },
            orderBy: { price: 'asc' },
            take: 1,
          }),
        }))
      )
    } catch (_err) {
      // Fallback to LIKE query if FULLTEXT index not available
      products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query } },
            { tags: { contains: query } },
            { brand: { contains: query } },
          ],
        },
        take: 48,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 2 },
          variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => [])
    }
  }

  return (
    <div className='container-shop py-8 md:py-12'>
      {query && <SearchTracker query={query} />}
      <h1 className='font-playfair text-2xl md:text-3xl font-semibold mb-2'>Search Results</h1>
      {query && (
        <p className='text-sm text-gray-500 mb-6'>
          {products.length} result{products.length !== 1 ? 's' : ''} for{' '}
          <span className='font-medium text-brand-black'>&quot;{query}&quot;</span>
        </p>
      )}
      {!query && (
        <p className='text-sm text-gray-500 mb-6'>Enter a search term above to find products.</p>
      )}
      {products.length === 0 && query && (
        <div className='text-center py-20'>
          <p className='text-gray-500 mb-4'>No products found for &quot;{query}&quot;</p>
          <a href='/collections' className='text-sm text-brand-gold underline'>Browse all collections</a>
        </div>
      )}
      {products.length > 0 && (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
          {products.map((p) => {
            const v = p.variants[0]
            const price = Number(v?.price ?? p.basePrice)
            const salePrice = v?.salePrice ? Number(v.salePrice) : p.salePrice ? Number(p.salePrice) : undefined
            return <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} price={price} salePrice={salePrice} image={p.images[0]?.url ?? null} hoverImage={p.images[1]?.url ?? null} brand={p.brand} />
          })}
        </div>
      )}
    </div>
  )
}
