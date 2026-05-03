export default function ProductsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-8 bg-gray-200 rounded w-32" />
        <div className="h-10 bg-gray-200 rounded w-32" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-4 px-6 py-4 border-b border-gray-50">
            <div className="h-10 w-10 bg-gray-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
