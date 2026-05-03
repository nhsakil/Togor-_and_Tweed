import Link from 'next/link'
import ProductGrid from '@/components/product/ProductGrid'

interface ProductItem { id: string; name: string; slug: string; price: number; salePrice?: number; image: string | null; brand?: string | null }
interface Props { title: string; subtitle?: string; products: ProductItem[]; viewAllHref?: string }

export default function FeaturedProducts({ title, subtitle, products, viewAllHref }: Props) {
  if (!products.length) return null
  return (
    <section className="py-12 md:py-16 px-4 md:px-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#111]">{title}</h2>
          {subtitle && <p className="text-[#888] text-sm mt-1">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#111] underline underline-offset-4 hover:text-[#888] transition-colors whitespace-nowrap ml-4">
            View All
          </Link>
        )}
      </div>
      <ProductGrid products={products} />
    </section>
  )
}
