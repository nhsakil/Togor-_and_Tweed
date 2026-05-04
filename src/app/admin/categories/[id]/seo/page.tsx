import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CategorySeoEditor from '@/components/admin/CategorySeoEditor'
import CategoryMetaEditor from '@/components/admin/CategoryMetaEditor'
import { getCategoryConfig } from '@/lib/collections/seoConfig'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cat = await prisma.category.findUnique({ where: { id } })
  return { title: cat ? `SEO — ${cat.name}` : 'Not Found' }
}

export default async function CategorySeoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Fetch without select so Prisma does not validate seoSections (not in generated types yet)
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) notFound()

  const config = getCategoryConfig(category.slug)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (category as any).seoSections
  const dbSections = Array.isArray(raw) ? raw : null
  const initialSections = dbSections ?? config.seoSections.map(
    (s: { heading: string; body?: string }) => ({ heading: s.heading, body: s.body ?? '' })
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cat = category as any

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO — {category.name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage meta tags and on-page SEO content for{' '}
          <a
            href={`/collections/${category.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            /collections/{category.slug}
          </a>
        </p>
      </div>

      {/* Meta Tags section */}
      <CategoryMetaEditor
        categoryId={category.id}
        initialMetaTitle={cat.metaTitle ?? ''}
        initialMetaDesc={cat.metaDesc ?? ''}
        initialMetaKeywords={cat.metaKeywords ?? ''}
        initialOgImageUrl={cat.ogImageUrl ?? ''}
      />

      {/* On-page SEO content sections */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            On-Page SEO Content
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Informational text blocks shown below the product grid. Rich in keywords, good for rankings.
          </p>
        </div>
        <CategorySeoEditor
          categoryId={category.id}
          categoryName={category.name}
          initialSections={initialSections}
        />
      </div>
    </div>
  )
}
