import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils/format'
import ProductGallery from '@/components/product/ProductGallery'
import ProductActions from '@/components/product/ProductActions'
import JsonLd from '@/components/seo/JsonLd'
import ViewItemTracker from '@/components/product/ViewItemTracker'
import DescriptionAccordion from '@/components/product/DescriptionAccordion'
import ReturnsAccordion from '@/components/product/ReturnsAccordion'
import DeliveryAccordion from '@/components/product/DeliveryAccordion'
import ReviewAccordion from '@/components/product/ReviewAccordion'
import CouponCards from '@/components/product/CouponCards'
import YouMayAlsoLike from '@/components/product/YouMayAlsoLike'
import type { Metadata } from 'next'
import type { SizeChartData } from '@/components/product/SizeChartModal'

export const revalidate = 3600

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true } }).catch(() => [])
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true, basePrice: true, salePrice: true,
      images: { where: { isDefault: true }, take: 1, select: { url: true } },
      variants: { where: { isActive: true }, take: 1, orderBy: { price: 'asc' }, select: { price: true, salePrice: true } },
    },
  }).catch(() => null)
  if (!product) return { title: 'Not Found' }

  let metaTitle: string | null = null
  let metaDesc: string | null = null
  let metaKeywords: string | null = null
  try {
    const seo = await prisma.product.findUnique({
      where: { slug },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      select: { metaTitle: true, metaDesc: true, metaKeywords: true } as any,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = seo as any
    metaTitle    = s?.metaTitle    ?? null
    metaDesc     = s?.metaDesc     ?? null
    metaKeywords = s?.metaKeywords ?? null
  } catch { /* columns not migrated yet */ }

  const siteUrl     = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const productImage = product.images[0]?.url
  const v           = product.variants[0]
  const displayPrice = Number(v?.price ?? product.basePrice)
  const saleP       = v?.salePrice ? Number(v.salePrice) : product.salePrice ? Number(product.salePrice) : null
  const priceLabel  = '৳' + (saleP ?? displayPrice).toLocaleString('en-BD')

  const ogParams = new URLSearchParams({
    title: metaTitle ?? product.name,
    price: priceLabel,
    ...(productImage ? { image: productImage } : {}),
  })

  const title       = (metaTitle ?? product.name) + ' — Togor & Tweed'
  const description = metaDesc ?? ('Buy ' + product.name + ' at Togor & Tweed Bangladesh. ' + priceLabel + '. Premium quality fashion delivered across Bangladesh.')
  const ogUrl       = siteUrl + '/og?' + ogParams.toString()

  return {
    title,
    description,
    ...(metaKeywords ? { keywords: metaKeywords } : {}),
    alternates: { canonical: `${siteUrl}/products/${slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: product.name + ' — Togor & Tweed Bangladesh' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl],
    },
  }
}

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const session  = await auth()

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images:   { orderBy: { sortOrder: 'asc' } },
      variants: { where: { isActive: true }, orderBy: { size: 'asc' } },
      category: { select: { name: true, slug: true } },
      reviews:  {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  }).catch(() => null)

  if (!product) notFound()

  // Fetch category reviews (approved reviews from other products in same category)
  const categoryReviews = await prisma.review.findMany({
    where: {
      isApproved: true,
      productId: { not: product.id },
      product: { category: { slug: product.category.slug } },
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 30,
  }).catch(() => [])

  // Fetch banner coupons
  const rawCoupons = await prisma.coupon.findMany({
    where: { isActive: true, showOnBanner: true },
    select: { code: true, description: true, bannerLabel: true, discountType: true, discountValue: true },
    orderBy: { createdAt: 'asc' },
  }).catch(() => [])
  const coupons = rawCoupons.map(c => ({ ...c, discountValue: Number(c.discountValue) }))

  // Fetch related products (same category, excluding current) + total count
  const relatedWhere = { isActive: true, id: { not: product.id }, category: { slug: product.category.slug } }
  const [relatedRaw, relatedTotal] = await Promise.all([
    prisma.product.findMany({
      where: relatedWhere,
      select: {
        id: true, name: true, slug: true, basePrice: true, salePrice: true,
        images:   { where: { isDefault: true }, take: 1, select: { url: true } },
        variants: { where: { isActive: true }, select: { color: true }, distinct: ['color'] },
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.product.count({ where: relatedWhere }).catch(() => 0),
  ])

  const relatedProducts = relatedRaw.map(p => ({
    id:        p.id,
    name:      p.name,
    slug:      p.slug,
    basePrice: Number(p.basePrice),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    image:     p.images[0]?.url ?? null,
    colors:    p.variants.map(v => v.color).filter(Boolean) as string[],
  }))

  // Fetch which related products are wishlisted by the current user
  let wishlistedIds: string[] = []
  if (session?.user?.id && relatedProducts.length > 0) {
    try {
      const wlItems = await prisma.wishlist.findMany({
        where: { userId: session.user.id, productId: { in: relatedProducts.map(p => p.id) } },
        select: { productId: true },
      })
      wishlistedIds = wlItems.map(w => w.productId)
    } catch { /* silent */ }
  }

  // Fetch size chart separately so a missing migration column doesn't 404 the page
  let sizeChart: SizeChartData | null = null
  try {
    const productWithChart = await prisma.product.findUnique({
      where: { id: product.id },
      select: {
        sizeChartId: true,
        category: { select: { sizeChartId: true } },
      },
    })
    const sizeChartId = productWithChart?.sizeChartId ?? productWithChart?.category?.sizeChartId ?? null
    if (sizeChartId) {
      const raw = await prisma.sizeChart.findUnique({
        where: { id: sizeChartId },
        include: { rows: { orderBy: { sortOrder: 'asc' } } },
      })
      if (raw) {
        sizeChart = {
          id: raw.id,
          name: raw.name,
          columns: JSON.parse(raw.columns) as string[],
          rows: raw.rows.map(r => ({ id: r.id, values: JSON.parse(r.values) as string[] })),
        }
      }
    }
  } catch {
    // size_charts table / sizeChartId column not yet migrated — sizeChart stays null
  }

  // Wishlist check
  let isWishlisted = false
  if (session?.user?.id) {
    try {
      const wl = await prisma.wishlist.findUnique({
        where: { userId_productId: { userId: session.user.id, productId: product.id } },
        select: { id: true },
      })
      isWishlisted = !!wl
    } catch { /* wishlist table not migrated */ }
  }

  // Derived price values
  const defaultVariant  = product.variants[0]
  const displayPrice    = Number(defaultVariant?.price ?? product.basePrice)
  const displaySalePrice = defaultVariant?.salePrice
    ? Number(defaultVariant.salePrice)
    : product.salePrice ? Number(product.salePrice) : undefined
  const activePrice = displaySalePrice ?? displayPrice
  const discount    = displaySalePrice
    ? Math.round(((displayPrice - displaySalePrice) / displayPrice) * 100)
    : 0

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0

  const siteUrl      = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const defaultImage = product.images.find((i) => i.isDefault)?.url ?? product.images[0]?.url

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    brand: { '@type': 'Brand', name: product.brand ?? 'Togor & Tweed' },
    image: defaultImage ?? undefined,
    offers: {
      '@type': 'Offer',
      url: siteUrl + '/products/' + product.slug,
      priceCurrency: 'BDT',
      price: activePrice,
      availability: (defaultVariant?.stock ?? 0) - (defaultVariant?.reservedQty ?? 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Togor & Tweed' },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'BDT',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'BD',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BD',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Collections', item: `${siteUrl}/collections` },
      { '@type': 'ListItem', position: 3, name: product.category.name, item: `${siteUrl}/collections/${product.category.slug}` },
      { '@type': 'ListItem', position: 4, name: product.name,  item: `${siteUrl}/products/${product.slug}` },
    ],
  }

  const isLoggedIn = !!session?.user

  return (
    <div className="min-h-screen pb-[140px] md:pb-0">
      <JsonLd data={jsonLdData} />
      <JsonLd data={breadcrumbJsonLd} />
      <ViewItemTracker
        itemId={product.id}
        itemName={product.name}
        itemCategory={product.category.name}
        price={activePrice}
      />

      {/* Breadcrumb — hidden on mobile */}
      <nav className="hidden md:block border-b border-[#e8e8e8]">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
          <a href="/" className="hover:text-[#1a1a1a] transition-colors">Home</a>
          <span>/</span>
          <a href="/collections" className="hover:text-[#1a1a1a] transition-colors">Collections</a>
          <span>/</span>
          <a href={'/collections/' + product.category.slug} className="hover:text-[#1a1a1a] transition-colors">
            {product.category.name}
          </a>
          <span>/</span>
          <span className="text-[#1a1a1a]">{product.name}</span>
        </div>
      </nav>

      {/* Product grid */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-4 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 lg:gap-20">

          {/* Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Details column */}
          <div className="space-y-4 md:space-y-5 md:pt-4 px-0 py-4 md:py-0">
            {product.brand && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#999]">{product.brand}</p>
            )}
            <h1 className="font-playfair text-[22px] md:text-4xl font-bold md:font-normal text-[#1a1a1a] leading-tight">
              {product.name}
            </h1>

            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={'text-sm ' + (s <= Math.round(avgRating) ? 'text-[#c8a96e]' : 'text-[#ddd]')}>{'★'}</span>
                  ))}
                </div>
                <span className="text-xs text-[#999]">({product.reviews.length})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-medium text-[#1a1a1a]">{formatCurrency(activePrice)}</span>
              {displaySalePrice && (
                <>
                  <span className="text-base text-[#aaa] line-through">{formatCurrency(displayPrice)}</span>
                  <span className="text-xs bg-[#1a1a1a] text-white px-2 py-0.5 uppercase tracking-[0.1em]">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <div className="border-t border-[#e8e8e8] pt-5">
              <ProductActions
                variants={product.variants}
                productId={product.id}
                productName={product.name}
                basePrice={displayPrice}
                baseSalePrice={displaySalePrice}
                defaultImage={product.images.find((i) => i.isDefault)?.url ?? product.images[0]?.url ?? null}
                initialWishlisted={isWishlisted}
                sizeChart={sizeChart}
              />
            </div>

            {/* Coupon cards */}
            <CouponCards coupons={coupons} />

            {/* Accordions: Details / Reviews / Delivery / Returns */}
            <DescriptionAccordion
              description={product.description}
              categorySlug={product.category.slug}
              sizeChart={sizeChart}
            />

            <ReviewAccordion
              productId={product.id}
              categoryName={product.category.name}
              styleReviews={product.reviews}
              categoryReviews={categoryReviews}
              avgRating={avgRating}
              isLoggedIn={isLoggedIn}
            />

            <DeliveryAccordion />

            <ReturnsAccordion />
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      <YouMayAlsoLike
        initialProducts={relatedProducts}
        total={relatedTotal}
        categorySlug={product.category.slug}
        excludeId={product.id}
        isLoggedIn={isLoggedIn}
        wishlistedIds={wishlistedIds}
      />
    </div>
  )
}
