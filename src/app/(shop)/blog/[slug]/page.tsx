import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticle, getAllArticles } from '@/lib/blog/articles'
import { extractToc } from '@/lib/blog/toc'
import JsonLd from '@/components/seo/JsonLd'
import BackToTop from '@/components/blog/BackToTop'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

export function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const article = getArticle(slug)
  if (!article) return { title: 'Not Found' }

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: article.keywords,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      images: [{
        url: `${SITE_URL}/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent('Togor & Tweed Style Journal')}`,
        width: 1200,
        height: 630,
        alt: article.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
    },
  }
}

export default async function BlogArticlePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const article = getArticle(slug)
  if (!article) notFound()

  const allArticles = getAllArticles()
  const related = allArticles.filter(a => a.slug !== slug && a.category === article.category).slice(0, 3)
  const others   = related.length < 3
    ? [...related, ...allArticles.filter(a => a.slug !== slug && !related.some(r => r.slug === a.slug)).slice(0, 3 - related.length)]
    : related

  const { toc, content: contentWithIds } = extractToc(article.content)
  const hasToc = toc.length >= 3

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author.name,
      worksFor: { '@type': 'Organization', name: 'Togor & Tweed', url: SITE_URL },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Togor & Tweed',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/blog/${slug}` },
    ],
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BackToTop />

      {/* Breadcrumb */}
      <div className="border-b border-[#e8e8e8] px-4 md:px-6 py-3 max-w-[900px] mx-auto">
        <nav className="text-[11px] text-[#aaa] flex items-center gap-1.5 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#111] transition-colors">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href="/blog" className="hover:text-[#111] transition-colors">Blog</Link>
          <span aria-hidden="true">›</span>
          <span className="text-[#555]">{article.title}</span>
        </nav>
      </div>

      {/* Article header */}
      <header className="max-w-[900px] mx-auto px-4 md:px-6 pt-10 pb-8 border-b border-[#e8e8e8]">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] bg-[#111] text-white px-2 py-0.5">
            {article.category}
          </span>
          <span className="text-[11px] text-[#aaa]">{article.readingTime} min read</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-[#111] leading-tight mb-4">
          {article.title}
        </h1>
        <p className="text-[15px] text-[#555] leading-relaxed mb-4">{article.excerpt}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-[11px] text-[#aaa] uppercase tracking-[0.1em]">
            By <span className="text-[#555]">{article.author.name}</span>
            {' '}&mdash; {article.author.role}
          </p>
          <p className="text-[11px] text-[#aaa] uppercase tracking-[0.1em]">
            <time dateTime={article.publishedAt}>
              Published{' '}
              {new Date(article.publishedAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            {article.updatedAt && article.updatedAt !== article.publishedAt && (
              <> &bull; <time dateTime={article.updatedAt}>Updated{' '}
                {new Date(article.updatedAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time></>
            )}
          </p>
        </div>
      </header>

      {/* Article body */}
      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-10">

        {/* Table of Contents */}
        {hasToc && (
          <nav aria-label="Table of contents" className="mb-10 border border-[#e8e8e8] p-5 bg-[#fafafa]">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#aaa] mb-3">In This Article</p>
            <ol className="space-y-1.5 list-none">
              {toc.map((entry, i) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="flex items-start gap-2 text-[13px] text-[#555] hover:text-[#111] transition-colors group"
                  >
                    <span className="flex-shrink-0 text-[11px] font-bold text-[#ccc] group-hover:text-[#aaa] mt-0.5 w-4">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="underline decoration-[#ddd] underline-offset-2">{entry.text}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div
          className="prose prose-sm md:prose-base max-w-none
            prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-[#111]
            prose-h2:text-[20px] prose-h2:mt-10 prose-h2:mb-3 prose-h2:scroll-mt-[150px]
            prose-h3:text-[16px] prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-[14px] prose-p:text-[#333] prose-p:leading-relaxed
            prose-li:text-[14px] prose-li:text-[#333]
            prose-a:text-[#111] prose-a:underline hover:prose-a:text-[#555]
            prose-table:border-collapse prose-th:border prose-th:border-[#e0e0e0] prose-th:p-2 prose-th:bg-[#f8f8f8] prose-th:text-[13px]
            prose-td:border prose-td:border-[#e0e0e0] prose-td:p-2 prose-td:text-[13px]
            prose-strong:text-[#111]"
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
        />

        {/* CTA */}
        <div className="mt-12 border border-[#111] p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] mb-2">Shop Now</p>
          <p className="text-[18px] font-black uppercase tracking-tight text-[#111] mb-4">
            Ready to upgrade your wardrobe?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/collections"
              className="px-6 py-3 bg-[#111] text-white text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#333] transition-colors"
            >
              Shop All Collections
            </Link>
            <Link
              href="/why-us"
              className="px-6 py-3 border border-[#111] text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#111] hover:text-white transition-colors"
            >
              Why Togor &amp; Tweed?
            </Link>
          </div>
        </div>

        {/* Author bio — E-E-A-T signal */}
        <div className="mt-12 border-t border-[#e8e8e8] pt-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#aaa] mb-4">About the Author</p>
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-12 h-12 bg-[#111] rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-[17px] font-black text-white">T</span>
            </div>
            <div>
              <p className="font-black uppercase text-[14px] text-[#111] mb-0.5">{article.author.name}</p>
              <p className="text-[12px] text-[#888] mb-2">{article.author.role}</p>
              <p className="text-[13px] text-[#555] leading-relaxed">
                The Togor &amp; Tweed editorial team brings together fashion consultants and style writers with
                deep expertise in Bangladeshi menswear. Our guides are grounded in real buying experience,
                industry knowledge, and feedback from thousands of customers across Bangladesh. We cover
                everything from Eid fashion to everyday office dressing — helping Bangladeshi men look
                and feel their best.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related articles */}
      {others.length > 0 && (
        <div className="border-t border-[#e8e8e8] py-12 px-4 md:px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#111] mb-6">More From The Journal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {others.map(a => (
                <Link
                  key={a.slug}
                  href={`/blog/${a.slug}`}
                  className="group border border-[#e8e8e8] hover:border-[#111] p-4 transition-colors"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaa] block mb-1">{a.category}</span>
                  <h3 className="text-[14px] font-black uppercase tracking-tight text-[#111] leading-snug group-hover:text-[#555] transition-colors">
                    {a.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
