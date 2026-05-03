import Link from 'next/link'
import Image from 'next/image'

interface CategoryTile { name: string; slug: string; imageUrl: string }

export default function CategoryGrid({ categories }: { categories: CategoryTile[] }) {
  const tiles = categories.slice(0, 6)
  return (
    <section className="px-0 max-w-[1600px] mx-auto">
      {/* Label above grid */}
      <div className="px-4 md:px-6 py-6 md:py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#111] text-center">
          Featured Categories
        </p>
      </div>

      {/* 6-column grid: 3 on mobile, 6 on desktop */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-0">
        {tiles.map((cat, idx) => (
          <Link
            key={cat.slug}
            href={`/collections/${cat.slug}`}
            className="group relative overflow-hidden block bg-[#f2f2f2]"
          >
            {/* Square aspect ratio */}
            <div className="relative w-full aspect-square">
              <Image
                src={cat.imageUrl}
                alt={`Shop ${cat.name} collection at Togor & Tweed Bangladesh`}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              />
              {/* Dark overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {/* Category name centered at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center">
                <p className="text-white text-xs md:text-sm font-bold uppercase tracking-[0.08em] text-center line-clamp-2">
                  {cat.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
