import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import CollectionSidebar from '@/components/collection/CollectionSidebar'
import CategorySeoSection from '@/components/collection/CategorySeoSection'
import DiscountBanner from '@/components/collection/DiscountBanner'
import JsonLd from '@/components/seo/JsonLd'
import SortDropdown from '@/components/collection/SortDropdown'
import SubCatPills from '@/components/collection/SubCatPills'
import { getCategoryConfig } from '@/lib/collections/seoConfig'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'

export const revalidate = 3600

export async function generateStaticParams() {
  const cats = await prisma.category
    .findMany({ where: { isActive: true }, select: { slug: true } })
    .catch(() => [])
  return cats.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }
): Promise<Metadata> {
  const slug    = (await props.params).slug
  const sp      = await props.searchParams
  const page    = Math.max(1, parseInt(sp.page ?? '1', 10))
  const cat     = await prisma.category.findUnique({ where: { slug } }).catch(() => null)
  if (!cat) return { title: 'Not Found' }

  const siteUrl    = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'
  const title      = `${cat.name} for Men in Bangladesh | Free Delivery | Togor & Tweed`
  const description = cat.description
    ? cat.description.replace(/<[^>]+>/g, '').slice(0, 155)
    : `Shop ${cat.name} for men in Bangladesh at Togor & Tweed. Free delivery over ৳1,500. Cash on delivery. Sizes XS–3XL. Easy 7-day returns.`

  const ogImageUrl = cat.imageUrl
    ? cat.imageUrl
    : `${siteUrl}/og?title=${encodeURIComponent(cat.name)}&subtitle=Togor+%26+Tweed+Bangladesh`

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/collections/${slug}` },
    // Noindex paginated pages 2+ — canonical already consolidates signals to page 1
    ...(page > 1 ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `Shop ${cat.name} at Togor & Tweed Bangladesh` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

interface SP {
  sort?:     string
  page?:     string
  size?:     string
  color?:    string
  priceMin?: string
  priceMax?: string
  subcat?:   string
}

const ITEMS_PER_PAGE = 24

function buildUrl(base: string, current: SP, overrides: Partial<SP>): string {
  const merged = { ...current, ...overrides }
  const qs = Object.entries(merged)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&')
  return `${base}${qs ? `?${qs}` : ''}`
}

export default async function CategoryPage(props: {
  params:       Promise<{ slug: string }>
  searchParams: Promise<SP>
}) {
  const slug     = (await props.params).slug
  const sp       = await props.searchParams
  const pageBase = `/collections/${slug}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const category = await (prisma.category as any)
    .findUnique({ where: { slug } })
    .catch(() => null)
  if (!category || !category.isActive) notFound()

  const config = getCategoryConfig(slug)
  const page   = Math.max(1, parseInt(sp.page ?? '1', 10))
  const skip   = (page - 1) * ITEMS_PER_PAGE

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sp.sort === 'price_asc'  ? [{ basePrice: 'asc' }]  :
    sp.sort === 'price_desc' ? [{ basePrice: 'desc' }] :
    sp.sort === 'featured'   ? [{ isFeatured: 'desc' }, { createdAt: 'desc' }] :
                               [{ createdAt: 'desc' }]

  const activeSubCat  = config.subCategories.find((s) => s.value !== null && s.value === sp.subcat)
  const subcatKeyword = activeSubCat?.keyword ?? null

  const where: Prisma.ProductWhereInput = {
    isActive:   true,
    categoryId: category.id,
    ...(sp.priceMin || sp.priceMax
      ? { basePrice: {
            ...(sp.priceMin ? { gte: parseFloat(sp.priceMin) } : {}),
            ...(sp.priceMax ? { lte: parseFloat(sp.priceMax) } : {}),
          }}
      : {}),
    ...(sp.size || sp.color
      ? { variants: { some: {
            isActive: true,
            ...(sp.size  ? { size:  sp.size  } : {}),
            ...(sp.color ? { color: sp.color } : {}),
          }}}
      : {}),
    ...(subcatKeyword
      ? { OR: [
            { name:        { contains: subcatKeyword } },
            { tags:        { contains: subcatKeyword } },
            { description: { contains: subcatKeyword } },
          ]}
      : {}),
  }

  const [products, total, colorRows, sizeRows, relatedCategories, bannerCoupons] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        images:   { orderBy: { sortOrder: 'asc' }, take: 2 },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
      },
    }).catch(() => []),

    prisma.product.count({ where }).catch(() => 0),

    prisma.productVariant.findMany({
      where: {
        isActive: true,
        color:    { not: null },
        product:  { categoryId: category.id, isActive: true },
      },
      select:   { color: true, colorHex: true },
      distinct: ['color'],
      orderBy:  { color: 'asc' },
    }).catch(() => []),

    prisma.productVariant.findMany({
      where: {
        isActive: true,
        size:     { not: null },
        product:  { categoryId: category.id, isActive: true },
      },
      select:   { size: true },
      distinct: ['size'],
    }).catch(() => []),

    prisma.category.findMany({
      where: { isActive: true, id: { not: category.id } },
      select: { name: true, slug: true, imageUrl: true },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    }).catch(() => []),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.coupon as any).findMany({
      where: { isActive: true, showOnBanner: true },
      select: { code: true, discountType: true, discountValue: true, bannerLabel: true },
      orderBy: { createdAt: 'asc' },
      take: 3,
    }).catch(() => []),
  ])

  const totalPages             = Math.ceil(total / ITEMS_PER_PAGE)
  const colors                 = colorRows.filter((r) => r.color).map((r) => ({ value: r.color!, hex: r.colorHex }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bannerCouponsSerialized = (bannerCoupons as any[]).map((c) => ({ code: c.code, discountType: c.discountType, discountValue: Number(c.discountValue), bannerLabel: c.bannerLabel ?? null }))

  const SIZE_ORDER = ['XS','S','M','L','XL','XXL','3XL','4XL','5XL','28','30','32','34','36','38','40','42']
  const sizes = sizeRows
    .filter((r) => r.size)
    .map((r) => r.size!)
    .sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a.toUpperCase())
      const bi = SIZE_ORDER.indexOf(b.toUpperCase())
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      return a.localeCompare(b)
    })

  const hasFilters = !!(sp.size || sp.color || sp.priceMin || sp.priceMax)
  const capName    = category.name.charAt(0).toUpperCase() + category.name.slice(1)

  const siteUrl = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Collections', item: `${siteUrl}/collections` },
      { '@type': 'ListItem', position: 3, name: category.name, item: `${siteUrl}/collections/${slug}` },
    ],
  }

  // ItemList schema — top products in this category for AI and rich results
  const itemListJsonLd = products.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} — Togor & Tweed Bangladesh`,
    description: `Shop ${category.name} at Togor & Tweed. Premium quality menswear with free delivery over ৳1,500.`,
    url: `${siteUrl}/collections/${slug}`,
    numberOfItems: total,
    itemListElement: products.slice(0, 10).map((p, i) => {
      const v = p.variants[0]
      const price = Number(v?.price ?? p.basePrice)
      const salePrice = v?.salePrice ? Number(v.salePrice) : p.salePrice ? Number(p.salePrice) : null
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          url: `${siteUrl}/products/${p.slug}`,
          image: p.images[0]?.url ?? undefined,
          brand: { '@type': 'Brand', name: 'Togor & Tweed' },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'BDT',
            price: salePrice ?? price,
            availability: 'https://schema.org/InStock',
            url: `${siteUrl}/products/${p.slug}`,
          },
        },
      }
    }),
  } : null

  const SORT_OPTIONS = [
    { label: 'Newest First',       value: 'newest'     },
    { label: 'Price: Low to High', value: 'price_asc'  },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Featured',           value: 'featured'   },
  ]

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbJsonLd} />
      {itemListJsonLd && <JsonLd data={itemListJsonLd} />}

      {/* Hero banner — only shown when category has a cover image */}
      {category.imageUrl && (
        <div className="relative h-44 md:h-56 overflow-hidden">
          <Image
            src={category.imageUrl}
            alt={`Shop ${category.name} collection at Togor & Tweed Bangladesh`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <p className="text-white/60 text-[10px] uppercase tracking-[0.35em] mb-2">Collections</p>
            <h1 className="font-playfair text-3xl md:text-5xl text-white font-normal">
              {category.name}
            </h1>
          </div>
        </div>
      )}

      {/* Body: sidebar + main content */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 flex items-start">

        <CollectionSidebar
          baseUrl={pageBase}
          activeSort={sp.sort}
          priceMin={sp.priceMin}
          priceMax={sp.priceMax}
          size={sp.size}
          color={sp.color}
          colors={colors}
          sizes={sizes}
          total={total}
        />

        {/* Main content column */}
        <div className="flex-1 min-w-0 py-6 md:pl-8">

          {/* Discount coupon banner */}
          <DiscountBanner coupons={bannerCouponsSerialized} />

          {/* Collection title + sort */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] md:text-[22px] font-bold uppercase tracking-tight text-[#111]">
              {config.heading || category.name.toUpperCase()}
            </h2>
            <SortDropdown
              baseUrl={pageBase}
              currentSort={sp.sort ?? 'newest'}
              options={SORT_OPTIONS}
            />
          </div>

          {/* Description + Shop by Style */}
          {(category.description || config.subCategories.length > 1) && (
            <div className="mb-4 pb-4 border-b border-[#efefef]">
              {category.description && (
                <p className="text-[12px] text-[#666] leading-[1.7] mb-2 max-w-3xl">
                  {category.description.replace(/<[^>]+>/g, '').slice(0, 220)}
                  {category.description.length > 220 ? '…' : ''}
                </p>
              )}
              {config.subCategories.length > 1 && (
                <p className="text-[12px] text-[#444]">
                  <span className="font-semibold text-[#111]">Shop by Style</span>
                  {' '}
                  {config.subCategories
                    .filter((s) => s.value !== null)
                    .map((s, i, arr) => (
                      <span key={String(s.value)}>
                        <Link
                          href={`${pageBase}?subcat=${encodeURIComponent(s.value!)}`}
                          className={`hover:text-[#111] transition-colors ${
                            sp.subcat === s.value ? 'text-[#111] font-semibold' : 'text-[#888]'
                          }`}
                        >
                          {s.label}
                        </Link>
                        {i < arr.length - 1 && <span className="text-[#ccc] mx-1.5">&middot;</span>}
                      </span>
                    ))}
                </p>
              )}
            </div>
          )}

          {/* Sub-category filter pills */}
          {config.subCategories.length > 1 && (
            <SubCatPills
              pills={config.subCategories}
              activeValue={sp.subcat ?? null}
              baseUrl={pageBase}
              currentSp={{ ...sp }}
            />
          )}

          {/* Active filter chips + count */}
          <div className="flex flex-wrap items-center gap-2 mb-5 mt-3">
            <p className="text-[12px] text-[#888]">
              {total} {total === 1 ? 'product' : 'products'}
            </p>
            {sp.size && (
              <a href={buildUrl(pageBase, sp, { size: undefined, page: '1' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#111] text-white text-[10px] uppercase tracking-[0.08em]">
                Size: {sp.size} &times;
              </a>
            )}
            {sp.color && (
              <a href={buildUrl(pageBase, sp, { color: undefined, page: '1' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#111] text-white text-[10px] uppercase tracking-[0.08em]">
                Colour: {sp.color} &times;
              </a>
            )}
            {(sp.priceMin || sp.priceMax) && (
              <a href={buildUrl(pageBase, sp, { priceMin: undefined, priceMax: undefined, page: '1' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#111] text-white text-[10px] uppercase tracking-[0.08em]">
                ৳{sp.priceMin ?? '0'} &ndash; ৳{sp.priceMax ?? '∞'} &times;
              </a>
            )}
            {hasFilters && (
              <a href={pageBase}
                className="text-[10px] uppercase tracking-[0.08em] text-[#888] underline hover:text-[#111] transition-colors">
                Clear all
              </a>
            )}
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#999] mb-3">
                {hasFilters || sp.subcat ? 'No results' : 'Empty'}
              </p>
              <p className="font-playfair text-2xl text-[#1a1a1a] mb-6">
                {hasFilters || sp.subcat
                  ? 'No products match your filters'
                  : `No ${category.name} yet`}
              </p>
              <a href={hasFilters || sp.subcat ? pageBase : '/collections'}
                className="text-[10px] uppercase tracking-[0.2em] border-b border-[#1a1a1a] pb-0.5 hover:text-[#c8a96e] hover:border-[#c8a96e] transition-colors">
                {hasFilters || sp.subcat ? 'Clear filters →' : 'Browse All Collections →'}
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 pb-4">
              {products.map((p, idx) => {
                const v         = p.variants[0]
                const price     = Number(v?.price ?? p.basePrice)
                const salePrice = v?.salePrice
                  ? Number(v.salePrice)
                  : p.salePrice ? Number(p.salePrice) : undefined
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
            <div className="flex justify-center items-center gap-2 mt-10 pt-8 border-t border-[#e8e8e8]">
              {page > 1 && (
                <a href={buildUrl(pageBase, sp, { page: String(page - 1) })}
                  className="px-6 py-3 border border-[#111] text-[10px] uppercase tracking-[0.2em] hover:bg-[#111] hover:text-white transition-colors">
                  &larr; Prev
                </a>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <a key={p}
                    href={buildUrl(pageBase, sp, { page: String(p) })}
                    className={`w-10 h-10 flex items-center justify-center border text-[11px] font-bold transition-colors ${
                      p === page
                        ? 'bg-[#111] text-white border-[#111]'
                        : 'border-[#e0e0e0] text-[#555] hover:border-[#111]'
                    }`}>
                    {p}
                  </a>
                ))}
              {page < totalPages && (
                <a href={buildUrl(pageBase, sp, { page: String(page + 1) })}
                  className="px-6 py-3 border border-[#111] text-[10px] uppercase tracking-[0.2em] hover:bg-[#111] hover:text-white transition-colors">
                  Next &rarr;
                </a>
              )}
            </div>
          )}

        </div>
      </div>

      {/* SEO section — full width, outside sidebar flex so background spans edge-to-edge */}
      <CategorySeoSection
        categoryName={category.name}
        categorySlug={slug}
        description={category.description}
        relatedCategories={relatedCategories}
        dbSeoSections={
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Array.isArray((category as any).seoSections)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? (category as any).seoSections
            : null
        }
      />
    </div>
  )
}
