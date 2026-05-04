import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/settings'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import BottomTabBar from '@/components/layout/BottomTabBar'
import HeroSlider from '@/components/home/HeroSlider'
import type { HeroSlide } from '@/components/home/HeroSlider'
import FeaturedCategories from '@/components/home/FeaturedCategories'
import NewAndPopular from '@/components/home/NewAndPopular'
import PromoBanner from '@/components/home/PromoBanner'
import JsonLd from '@/components/seo/JsonLd'
import HomeSeoSection from '@/components/home/HomeSeoSection'

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Men's Clothing Online Bangladesh | Shirts, Panjabi & More | Togor & Tweed",
  description: "Shop men's shirts, panjabi, t-shirts, polo & trousers online in Bangladesh. Free delivery over ৳1,500. Cash on delivery. Sizes XS–3XL. 7-day returns.",
  keywords: [
    "men's clothing online Bangladesh",
    'buy clothes online Bangladesh',
    'panjabi online Bangladesh',
    'shirts for men Bangladesh',
    "men's fashion Bangladesh",
    'clothing Dhaka',
    'Togor & Tweed',
  ],
  alternates: {
    canonical: 'https://togorandtweed.com',
  },
}

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Togor & Tweed',
  alternateName: ['Togor and Tweed', 'TogorAndTweed'],
  url: 'https://togorandtweed.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://togorandtweed.com/logo.png',
    width: 200,
    height: 60,
  },
  description: 'Togor & Tweed is a premium Bangladeshi fashion brand selling men\'s clothing including shirts, panjabi, t-shirts, polo, and trousers. Based in Dhaka, Bangladesh, with nationwide delivery.',
  foundingLocation: {
    '@type': 'Place',
    name: 'Dhaka, Bangladesh',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Bangladesh',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'Bengali'],
    areaServed: 'BD',
  },
  sameAs: [
    'https://instagram.com/togorandtweed',
    'https://facebook.com/togorandtweed',
  ],
}

const LOCAL_BUSINESS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'ClothingStore'],
  name: 'Togor & Tweed',
  description: 'Premium men\'s fashion store in Bangladesh. Shop shirts, panjabi, t-shirts, polo shirts, and trousers online with nationwide delivery. Cash on delivery available.',
  url: 'https://togorandtweed.com',
  logo: 'https://togorandtweed.com/logo.png',
  image: 'https://togorandtweed.com/og?title=Togor+%26+Tweed&subtitle=Wear+the+Story',
  priceRange: '৳৳',
  currenciesAccepted: 'BDT',
  paymentAccepted: 'Cash, bKash, Nagad, Cash on Delivery',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dhaka',
    addressCountry: 'BD',
  },
  areaServed: [
    { '@type': 'State', name: 'Dhaka' },
    { '@type': 'State', name: 'Chattogram' },
    { '@type': 'State', name: 'Rajshahi' },
    { '@type': 'State', name: 'Khulna' },
    { '@type': 'State', name: 'Sylhet' },
    { '@type': 'State', name: 'Barishal' },
    { '@type': 'State', name: 'Rangpur' },
    { '@type': 'State', name: 'Mymensingh' },
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Men\'s Fashion Collections',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Shirts', url: 'https://togorandtweed.com/collections/shirts' },
      { '@type': 'OfferCatalog', name: 'Panjabi', url: 'https://togorandtweed.com/collections/panjabi' },
      { '@type': 'OfferCatalog', name: 'T-Shirts', url: 'https://togorandtweed.com/collections/t-shirt' },
      { '@type': 'OfferCatalog', name: 'Polo', url: 'https://togorandtweed.com/collections/polo' },
      { '@type': 'OfferCatalog', name: 'Trousers', url: 'https://togorandtweed.com/collections/trousers' },
    ],
  },
  sameAs: [
    'https://instagram.com/togorandtweed',
    'https://facebook.com/togorandtweed',
  ],
}

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Togor & Tweed',
  url: 'https://togorandtweed.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://togorandtweed.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const HOME_FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Where can I buy men\'s clothing online in Bangladesh?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Togor & Tweed (togorandtweed.com) is a premium Bangladeshi online fashion store offering shirts, panjabi, t-shirts, polo shirts, and trousers for men. We deliver nationwide with cash on delivery available across all divisions of Bangladesh.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods does Togor & Tweed accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Togor & Tweed accepts Cash on Delivery (COD), bKash, and Nagad. Cash on delivery is available everywhere in Bangladesh — you pay only when your order arrives at your door.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Togor & Tweed offer free delivery in Bangladesh?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Togor & Tweed offers free delivery on all orders over ৳1,500. Orders to Dhaka and Chattogram are delivered in 1–2 business days. All other divisions receive orders within 3–5 business days.',
      },
    },
    {
      '@type': 'Question',
      name: 'What sizes does Togor & Tweed carry?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Togor & Tweed stocks men\'s clothing in sizes XS, S, M, L, XL, XXL, and 3XL for tops (shirts, panjabi, t-shirts, polo). Trousers are available in waist sizes 28 to 42 inches. Full size guides are available on every product page.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the return policy at Togor & Tweed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Togor & Tweed accepts returns within 7 days of delivery. Items must be unworn, unwashed, and have all tags attached. Free pickup is arranged from your address anywhere in Bangladesh. Refunds are processed within 5–7 business days.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I buy panjabi online in Bangladesh?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Togor & Tweed (togorandtweed.com/collections/panjabi) offers a wide selection of panjabi for men including cotton, silk, embroidered, and Eid special styles. All panjabis ship nationwide with cash on delivery.',
      },
    },
  ],
}

const PAGE_SIZE = 12

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1440&q=85',
    title: 'WEAR THE STORY',
    subtitle: 'New Season',
    href: '/collections',
  },
  {
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1440&q=85',
    title: 'TIMELESS PIECES',
    subtitle: 'Best Sellers',
    href: '/collections/best-sellers',
  },
  {
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1440&q=85',
    title: 'FRESH EVERY WEEK',
    subtitle: 'New Arrivals',
    href: '/collections/new-arrivals',
  },
]

async function getHomeData() {
  const [popularProducts, total] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        salePrice: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 2, select: { url: true } },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1,
          select: { price: true, salePrice: true },
        },
        category: { select: { slug: true } },
      },
    }).catch(() => []),

    prisma.product.count({ where: { isActive: true } }).catch(() => 0),
  ])

  // Load hero slides, home seo sections, and top categories
  let heroSlides: HeroSlide[] = FALLBACK_SLIDES
  let homeSeoSections: { heading: string; body: string }[] | null = null
  let topCategories: { name: string; slug: string }[] = []
  try {
    const [heroSetting, seoSetting, cats] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { key: 'hero_slides' } }),
      prisma.siteSettings.findUnique({ where: { key: 'home_seo_sections' } }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { name: true, slug: true },
      }),
    ])
    if (heroSetting?.value) {
      const parsed: HeroSlide[] = JSON.parse(heroSetting.value)
      if (Array.isArray(parsed) && parsed.some(s => s.image)) heroSlides = parsed
    }
    if (seoSetting?.value) {
      const parsed = JSON.parse(seoSetting.value)
      if (Array.isArray(parsed) && parsed.length) homeSeoSections = parsed
    }
    topCategories = cats
  } catch { /* use defaults */ }

  return { popularProducts, total, heroSlides, homeSeoSections, topCategories }
}

export default async function HomePage() {
  const [{ popularProducts, total, heroSlides, homeSeoSections, topCategories }, gs] = await Promise.all([
    getHomeData(),
    getSettings(['gbp_url', 'social_facebook', 'social_instagram', 'social_tiktok']),
  ])

  // Build dynamic sameAs list — includes whatever social links + GBP the admin has set
  const sameAs = [
    gs.social_facebook  || 'https://facebook.com/togorandtweed',
    gs.social_instagram || 'https://instagram.com/togorandtweed',
    ...(gs.social_tiktok ? [gs.social_tiktok] : []),
    ...(gs.gbp_url      ? [gs.gbp_url]       : []),
  ].filter(Boolean)

  const orgJsonLd       = { ...ORG_JSON_LD,           sameAs }
  const localBizJsonLd  = { ...LOCAL_BUSINESS_JSON_LD, sameAs }

  const initialProducts = popularProducts.map((p) => {
    const v = p.variants[0]
    return {
      id:           p.id,
      name:         p.name,
      slug:         p.slug,
      price:        Number(v?.price ?? p.basePrice),
      salePrice:    v?.salePrice ? Number(v.salePrice) : p.salePrice ? Number(p.salePrice) : null,
      image:        p.images[0]?.url ?? null,
      hoverImage:   p.images[1]?.url ?? null,
      categorySlug: p.category?.slug ?? '',
    }
  })

  const initialHasMore = total > PAGE_SIZE

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <JsonLd data={localBizJsonLd} />
      <JsonLd data={WEBSITE_JSON_LD} />
      <JsonLd data={HOME_FAQ_JSON_LD} />
      <Header />
      {/* announcement: 32px + mobile nav row1 50px + row2 ~38px = 120px | desktop: 137px */}
      <div className="h-[120px] md:h-[137px]" />
      <main id="main-content" className="pb-[60px] md:pb-0">
        {/* Visually-hidden H1 for SEO — primary keyword target for the homepage */}
        <h1 className="sr-only">
          Men&apos;s Clothing Online Bangladesh — Shop Shirts, Panjabi, T-Shirts &amp; Trousers | Togor &amp; Tweed
        </h1>

        {/* Hero slider */}
        <HeroSlider slides={heroSlides} />

        {/* Shop by Category — Shirts, Panjabi, T-Shirt, Polo, Trousers */}
        <FeaturedCategories />

        {/* Promo strip */}
        <PromoBanner
          headline="Free Delivery on Orders Over ৳1,500"
          subtext="Shop our full collection and enjoy free delivery anywhere in Bangladesh."
          ctaLabel="Shop Now"
          ctaHref="/collections"
          dark
        />

        {/* New and Popular — infinite scroll, all products */}
        <NewAndPopular
          initialProducts={initialProducts}
          initialHasMore={initialHasMore}
        />

        {/* SEO text + FAQ */}
        <HomeSeoSection sections={homeSeoSections} topCategories={topCategories} />
      </main>
      <Footer />
      <CartDrawer />
      <BottomTabBar />
    </>
  )
}
