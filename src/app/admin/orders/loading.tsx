export default function OrdersLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-28" />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-6 px-6 py-4 border-b border-gray-50">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
