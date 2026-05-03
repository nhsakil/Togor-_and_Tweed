import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CategorySeoEditor from '@/components/admin/CategorySeoEditor'
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO Content — {category.name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Edit the informational text sections shown below the product grid on{' '}
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

      <CategorySeoEditor
        categoryId={category.id}
        categoryName={category.name}
        initialSections={initialSections}
      />
    </div>
  )
}
