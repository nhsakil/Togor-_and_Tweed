import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/product/ProductCard'
import CollectionSidebar from '@/components/collection/CollectionSidebar'
import SortDropdown from '@/components/collection/SortDropdown'
import JsonLd from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

export const revalidate = 3600

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

export async function generateMetadata(props: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp   = await props.searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const ogImg = `${SITE_URL}/og?title=All+Collections&subtitle=Premium+Menswear+Bangladesh`

  return {
    title: 'Shop All Collections — Men\'s Fashion Bangladesh',
    description: 'Browse premium shirts, panjabi, t-shirts, polo & trousers at Togor & Tweed Bangladesh. Free delivery on orders over ৳1,500. Cash on delivery available.',
    keywords: [
      'fashion collections Bangladesh',
      'men clothing Dhaka',
      'panjabi online Bangladesh',
      'shirts Bangladesh',
      'premium fashion Dhaka',
      'polo shirts Bangladesh',
      't-shirts online Bangladesh',
      'men trousers Bangladesh',
      'buy clothes online Bangladesh',
      'menswear Bangladesh',
    ],
    alternates: { canonical: `${SITE_URL}/collections` },
    // Noindex page 2+ to avoid duplicate content; canonical already signals the root
    ...(page > 1 ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: "Shop All Collections — Togor & Tweed Bangladesh",
      description: "Browse premium shirts, panjabi, t-shirts, polo & trousers at Togor & Tweed Bangladesh. Free delivery on orders over ৳1,500.",
      type: 'website',
      images: [{ url: ogImg, width: 1200, height: 630, alt: 'Shop All Collections at Togor & Tweed Bangladesh' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Shop All Collections — Togor & Tweed Bangladesh",
      description: "Browse premium shirts, panjabi, t-shirts, polo & trousers at Togor & Tweed Bangladesh.",
      images: [ogImg],
    },
  }
}

interface SP {
  category?: string
  sort?: string
  page?: string
  priceMin?: string
  priceMax?: string
  size?: string
}
const PER_PAGE = 24

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))

  const orderBy: Array<Record<string, string>> =
    sp.sort === 'price_asc'
      ? [{ basePrice: 'asc' }]
      : sp.sort === 'price_desc'
        ? [{ basePrice: 'desc' }]
        : sp.sort === 'featured'
          ? [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
          : [{ createdAt: 'desc' }]

  const where: Record<string, any> = {
    isActive: true,
    ...(sp.category ? { category: { slug: sp.category } } : {}),
    ...(sp.priceMin || sp.priceMax
      ? {
          basePrice: {
            ...(sp.priceMin ? { gte: parseFloat(sp.priceMin) } : {}),
            ...(sp.priceMax ? { lte: parseFloat(sp.priceMax) } : {}),
          },
        }
      : {}),
    ...(sp.size
      ? {
          variants: {
            some: {
              size: {
                equals: sp.size,
                mode: 'insensitive',
              },
              isActive: true,
            },
          },
        }
      : {}),
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 2 },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
    }).catch(() => []),
    prisma.product.count({ where }).catch(() => 0),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    }).catch(() => []),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)

  function url(p: Partial<SP & { page: string }>) {
    const c = { ...sp, ...p }
    const qs = Object.entries(c)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/collections${qs ? `?${qs}` : ''}`
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Collections', item: `${SITE_URL}/collections` },
    ],
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbJsonLd} />
      {/* Page title */}
      <div className="border-b border-[#e8e8e8] py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#aaa] mb-1">Browse</p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#111]">
          All Collections
        </h1>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 flex">
        {/* Left Sidebar */}
        <CollectionSidebar
          activeSort={sp.sort}
          baseUrl="/collections"
          priceMin={sp.priceMin}
          priceMax={sp.priceMax}
          size={sp.size}
          total={total}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 py-8 md:pl-8">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] md:text-[22px] font-bold uppercase tracking-tight text-[#111]">
              All Collections
            </h2>
            <SortDropdown
              baseUrl="/collections"
              currentSort={sp.sort ?? 'newest'}
              options={[
                { label: 'Newest First',       value: 'newest'     },
                { label: 'Price: Low to High', value: 'price_asc'  },
                { label: 'Price: High to Low', value: 'price_desc' },
                { label: 'Featured',           value: 'featured'   },
              ]}
            />
          </div>
          <p className="text-[12px] text-[#888] mb-4">{total} {total === 1 ? 'product' : 'products'}</p>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-2xl font-black uppercase text-[#111] mb-4">No Products Found</p>
              <a
                href="/collections"
                className="text-[12px] font-bold uppercase tracking-[0.1em] underline text-[#111] hover:text-[#888]"
              >
                Clear Filters
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pb-16">
              {products.map((p, idx) => {
                const v = p.variants[0]
                const price = Number(v?.price ?? p.basePrice)
                const salePrice = v?.salePrice
                  ? Number(v.salePrice)
                  : p.salePrice
                    ? Number(p.salePrice)
                    : undefined
                return (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={price}
                    salePrice={salePrice}
                    image={p.images[0]?.url ?? null}
                    hoverImage={p.images[1]?.url ?? null}
                    brand={p.brand}
                    priority={idx === 0}
                  />
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-10 border-t border-[#e8e8e8]">
              {page > 1 && (
                <a
                  href={url({ page: String(page - 1) })}
                  className="px-6 py-3 border border-[#111] text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#111] hover:text-white transition-colors"
                >
                  ← Prev
                </a>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <a
                    key={p}
                    href={url({ page: String(p) })}
                    className={`w-11 h-11 flex items-center justify-center border text-[12px] font-bold transition-colors ${
                      p === page
                        ? 'bg-[#111] text-white border-[#111]'
                        : 'border-[#e0e0e0] text-[#555] hover:border-[#111]'
                    }`}
                  >
                    {p}
                  </a>
                ))}
              {page < totalPages && (
                <a
                  href={url({ page: String(page + 1) })}
                  className="px-6 py-3 border border-[#111] text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#111] hover:text-white transition-colors"
                >
                  Next →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
