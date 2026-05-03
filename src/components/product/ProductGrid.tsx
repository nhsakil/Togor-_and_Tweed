import ProductCard from './ProductCard'

interface ProductCardItem { id: string; name: string; slug: string; price: number; salePrice?: number; image: string | null; brand?: string | null }
interface Props { products: ProductCardItem[]; className?: string }

export default function ProductGrid({ products, className }: Props) {
  if (!products.length) {
    return <div className="py-20 text-center text-[#aaa] text-sm uppercase tracking-widest">No products found.</div>
  }
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 ${className ?? ''}`}>
      {products.map((p) => (
        <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} price={p.price} salePrice={p.salePrice} image={p.image} brand={p.brand} />
      ))}
    </div>
  )
}
