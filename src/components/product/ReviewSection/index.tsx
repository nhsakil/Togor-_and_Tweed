'use client'
import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import RatingSummary from './RatingSummary'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'

interface Review {
  id: string; rating: number; title: string | null; body: string | null
  isVerified: boolean; createdAt: Date; user: { name: string | null }
}
interface Props { productId: string; reviews: Review[]; avgRating: number; isLoggedIn: boolean }

const PREVIEW = 4

export default function ReviewSection({ productId, reviews, avgRating, isLoggedIn }: Props) {
  const [open, setOpen]         = useState(true)
  const [tab, setTab]           = useState<'style'|'category'>('style')
  const [showAll, setShowAll]   = useState(false)

  const fiveStarCount = reviews.filter(r => r.rating === 5).length
  const visible = showAll ? reviews : reviews.slice(0, PREVIEW)

  return (
    <section className="border-t border-[#e8e8e8] mt-10">
      {/* Section header */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between py-5"
        >
          <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#111]">Reviews</span>
          {open
            ? <Minus size={16} strokeWidth={2} className="text-[#111]" />
            : <Plus  size={16} strokeWidth={2} className="text-[#111]" />}
        </button>

        {open && (
          <>
            {/* STYLE / CATEGORY tabs */}
            <div className="flex border-b border-[#e8e8e8] mb-6">
              {(['style','category'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] border-b-2 transition-colors ${
                    tab === t
                      ? 'border-[#c8a96e] text-[#111]'
                      : 'border-transparent text-[#aaa] hover:text-[#555]'
                  }`}
                >
                  {t === 'style' ? 'Style Reviews' : 'Category Reviews'}
                </button>
              ))}
            </div>

            {tab === 'style' ? (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 pb-10">
                {/* Left: summary + cards */}
                <div>
                  {reviews.length > 0 ? (
                    <>
                      <RatingSummary avgRating={avgRating} count={reviews.length} fiveStarCount={fiveStarCount} />
                      <div className="mt-4">
                        {visible.map(r => (
                          <ReviewCard
                            key={r.id}
                            rating={r.rating}
                            title={r.title}
                            body={r.body}
                            userName={r.user.name}
                            isVerified={r.isVerified}
                            createdAt={r.createdAt}
                          />
                        ))}
                      </div>
                      {reviews.length > PREVIEW && (
                        <button
                          onClick={() => setShowAll(v => !v)}
                          className="mt-5 w-full py-2.5 border border-[#111] text-[11px] font-bold uppercase tracking-[0.15em] text-[#111] hover:bg-[#111] hover:text-white transition-colors"
                        >
                          {showAll ? 'Show Less' : `View All (${reviews.length})`}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="py-12 text-center text-[#aaa] border border-dashed border-[#e0e0e0]">
                      <p className="text-[12px] uppercase tracking-[0.15em]">No reviews yet — be the first!</p>
                    </div>
                  )}
                </div>

                {/* Right: write a review */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111] mb-4">
                    Write a Review
                  </p>
                  <ReviewForm productId={productId} isLoggedIn={isLoggedIn} />
                </div>
              </div>
            ) : (
              <div className="pb-10 text-center py-12">
                <p className="text-[12px] text-[#aaa] uppercase tracking-[0.15em]">
                  Category reviews coming soon
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
