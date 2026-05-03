import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { PRODUCT_CATEGORY_LINKS } from '@/lib/constants'

// Fallback images from constants (used when a category has no imageUrl set)
const FALLBACK: Record<string, string> = Object.fromEntries(
  PRODUCT_CATEGORY_LINKS.map(c => [c.href.split('/').pop() ?? '', c.imageUrl])
)

export default async function FeaturedCategories() {
  // Read top-level categories from DB (with imageUrl)
  const dbCats = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, slug: true, imageUrl: true },
  }).catch(() => [])

  // Merge with constants fallback for any missing images
  const cats: { name: string; href: string; imageUrl: string }[] = dbCats.length > 0
    ? dbCats.map(c => ({
        name:     c.name,
        href:     '/collections/' + c.slug,
        imageUrl: c.imageUrl ?? FALLBACK[c.slug] ?? 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
      }))
    : PRODUCT_CATEGORY_LINKS.map(c => ({ name: c.label, href: c.href, imageUrl: c.imageUrl }))

  return (
    <section className="py-10 md:py-14 px-4 md:px-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#111]">
          Featured Categories
        </h2>
        <Link
          href="/collections"
          className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#111] underline underline-offset-4 hover:text-[#888] transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Desktop: 5-column equal grid — Mobile: horizontal scroll */}
      <div className="flex md:grid md:grid-cols-5 gap-2 md:gap-3 overflow-x-auto md:overflow-visible scrollbar-hide pb-2 md:pb-0">
        {cats.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group relative flex-shrink-0 w-[44vw] md:w-auto overflow-hidden bg-[#f2f2f2] block"
          >
            {/* 3:4 portrait tile */}
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={cat.imageUrl}
                alt={`Shop ${cat.name} at Togor & Tweed Bangladesh`}
                fill
                sizes="(max-width: 768px) 44vw, 20vw"
                className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                <p className="text-white text-[13px] md:text-[15px] font-bold uppercase tracking-[0.06em]">
                  {cat.name}
                </p>
                <p className="text-white/0 group-hover:text-white/75 text-[10px] font-semibold uppercase tracking-[0.12em] mt-0.5 transition-all duration-300">
                  Shop Now →
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
