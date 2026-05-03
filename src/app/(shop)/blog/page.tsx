import Link from 'next/link'
import { getAllArticles } from '@/lib/blog/articles'
import JsonLd from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

export const metadata: Metadata = {
  title: "Men's Fashion Blog — Style Guides & Tips | Togor & Tweed Bangladesh",
  description: "Read men's fashion guides, style tips, and clothing advice tailored for Bangladesh. Eid outfits, office wear, size guides, fabric advice and more from Togor & Tweed.",
  keywords: [
    "men's fashion blog bangladesh",
    'style guide men dhaka',
    'clothing tips men bangladesh',
    'eid fashion guide',
    'office wear guide bangladesh',
    'men fashion advice bangladesh',
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
    types: { 'application/rss+xml': `${SITE_URL}/blog/feed.xml` },
  },
  openGraph: {
    title: "Men's Fashion Blog — Togor & Tweed Bangladesh",
    description: "Style guides, fabric advice, size tips, and outfit ideas for men in Bangladesh.",
    type: 'website',
    images: [{ url: `${SITE_URL}/og?title=Style+Blog&subtitle=Fashion+Guides+for+Men+in+Bangladesh`, width: 1200, height: 630 }],
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Style Guide': 'bg-[#111] text-white',
  'Fit & Sizing': 'bg-[#e8e8e8] text-[#111]',
  'Fashion Education': 'bg-[#f5f0e8] text-[#555]',
}

const BREADCRUMB_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Style Journal', item: `${SITE_URL}/blog` },
  ],
}

export default function BlogPage() {
  const articles = getAllArticles()

  return (
    <div className="min-h-screen">
      <JsonLd data={BREADCRUMB_JSON_LD} />
      {/* Header */}
      <div className="border-b border-[#e8e8e8] py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#aaa] mb-1">Togor & Tweed</p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#111]">
          Style Journal
        </h1>
        <p className="text-[13px] text-[#888] mt-2 max-w-md mx-auto">
          Fashion guides, style tips, and clothing advice for the modern Bangladeshi man.
        </p>
      </div>

      {/* Articles grid */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {articles.map((article) => (
            <article key={article.slug} className="group border border-[#e8e8e8] hover:border-[#111] transition-colors">
              {/* Category tag */}
              <div className="p-5 pb-0">
                <span className={`inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 ${CATEGORY_COLORS[article.category] ?? 'bg-[#eee] text-[#666]'}`}>
                  {article.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <Link href={`/blog/${article.slug}`}>
                  <h2 className="text-[17px] font-black uppercase tracking-tight text-[#111] leading-snug mb-2 group-hover:text-[#555] transition-colors">
                    {article.title}
                  </h2>
                </Link>
                <p className="text-[13px] text-[#666] leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#aaa] uppercase tracking-[0.1em]">
                    {new Date(article.publishedAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="text-[11px] text-[#aaa]">{article.readingTime} min read</span>
                </div>
              </div>

              <div className="px-5 pb-5">
                <Link
                  href={`/blog/${article.slug}`}
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] text-[#111] underline hover:text-[#555] transition-colors"
                >
                  Read Article →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Internal links section */}
        <div className="mt-16 border-t border-[#e8e8e8] pt-12 text-center">
          <p className="text-[12px] uppercase tracking-[0.2em] text-[#aaa] mb-4">Shop Our Collections</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Shirts', href: '/collections/shirts' },
              { label: 'Panjabi', href: '/collections/panjabi' },
              { label: 'T-Shirts', href: '/collections/t-shirt' },
              { label: 'Polo', href: '/collections/polo' },
              { label: 'Trousers', href: '/collections/trousers' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 py-2 border border-[#111] text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#111] hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
