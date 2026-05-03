import ProductGridSkeleton from '@/components/product/ProductGridSkeleton'

export default function CollectionLoading() {
  return (
    <div className="container-shop py-10">
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
      <ProductGridSkeleton count={12} />
    </div>
  )
}
