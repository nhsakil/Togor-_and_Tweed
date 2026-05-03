import ProductGridSkeleton from '@/components/product/ProductGridSkeleton'

export default function SearchLoading() {
  return (
    <div className="container-shop py-8 md:py-12 animate-pulse">
      <div className="h-9 bg-gray-200 rounded w-48 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-32 mb-8" />
      <ProductGridSkeleton count={8} />
    </div>
  )
}
