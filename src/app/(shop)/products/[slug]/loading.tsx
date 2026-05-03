export default function ProductLoading() {
  return (
    <div className="container-shop py-8 md:py-12 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-3 bg-gray-200 rounded w-2" />
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-3 bg-gray-200 rounded w-2" />
        <div className="h-3 bg-gray-200 rounded w-36" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
        {/* Gallery skeleton */}
        <div className="space-y-3">
          <div className="aspect-[3/4] bg-gray-200 rounded" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* Details skeleton */}
        <div className="space-y-5 pt-2">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-4/5" />
            <div className="h-8 bg-gray-200 rounded w-3/5" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-8 bg-gray-200 rounded w-36" />

          {/* Size buttons skeleton */}
          <div>
            <div className="h-3 bg-gray-200 rounded w-10 mb-3" />
            <div className="flex gap-2">
              {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                <div key={s} className="w-12 h-10 bg-gray-200 rounded" />
              ))}
            </div>
          </div>

          {/* Add to cart skeleton */}
          <div className="flex gap-3 pt-2">
            <div className="flex-1 h-14 bg-gray-200 rounded" />
            <div className="w-14 h-14 bg-gray-200 rounded" />
          </div>

          {/* Description skeleton */}
          <div className="pt-4 border-t space-y-2">
            <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
