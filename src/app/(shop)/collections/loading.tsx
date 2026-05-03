import ProductGridSkeleton from '@/components/product/ProductGridSkeleton'

export default function CollectionsLoading() {
  return (
    <div className="container-shop py-8 md:py-12">
      {/* Header skeleton */}
      <div className="animate-pulse mb-8">
        <div className="h-9 bg-gray-200 rounded w-56 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>

      {/* Filters + sort bar skeleton */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-32" />
      </div>

      <ProductGridSkeleton count={12} />
    </div>
  )
}
