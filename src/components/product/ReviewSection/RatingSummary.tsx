interface Props { avgRating: number; count: number; fiveStarCount: number }

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)))
        return (
          <span key={i} className="relative inline-block text-[22px] leading-none text-[#ddd]">
            ★
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden text-[#111]"
                style={{ width: `${fill * 100}%` }}
              >★</span>
            )}
          </span>
        )
      })}
    </div>
  )
}

export default function RatingSummary({ avgRating, count, fiveStarCount }: Props) {
  return (
    <div className="text-center py-4">
      <p className="text-[40px] font-bold text-[#111] leading-none mb-2">{avgRating.toFixed(1)}</p>
      <StarDisplay rating={avgRating} />
      {fiveStarCount > 0 && count > 0 && (
        <p className="text-[12px] text-[#555] mt-3">
          Loved by our users!&nbsp;
          <strong className="text-[#111]">{fiveStarCount}</strong>
          &nbsp;out of&nbsp;
          <strong className="text-[#111]">{count}</strong>
          &nbsp;rated 5 stars
        </p>
      )}
    </div>
  )
}
