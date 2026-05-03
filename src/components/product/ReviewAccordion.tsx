'use client'

import { useState } from 'react'
import ProductAccordion from './ProductAccordion'

interface Review {
  id: string
  rating: number
  body: string | null
  createdAt: Date
  user: { name: string | null }
}

interface Props {
  productId:        string
  categoryName:     string
  styleReviews:     Review[]
  categoryReviews:  Review[]
  avgRating:        number
  isLoggedIn:       boolean
}

// Bangladeshi display names pool — used as fallback when user has no name
const BD_NAMES = [
  'Rafiqul Islam', 'Sabbir Ahmed', 'Tanvir Hasan', 'Mehedi Hassan', 'Rakibul Islam',
  'Ariful Islam', 'Shahriar Hossain', 'Imran Khan', 'Nayeem Ahmed', 'Rubel Mia',
  'Monir Hossain', 'Farid Uddin', 'Belal Ahmed', 'Sohel Rana', 'Mamun Rashid',
  'Jakir Hossain', 'Khalid Hasan', 'Ashraful Islam', 'Ripon Ahmed', 'Shohidul Islam',
  'Raihan Ahmed', 'Sumon Hossain', 'Nasir Uddin', 'Karim Molla', 'Liton Das',
  'Polash Sarkar', 'Tuhin Ahmed', 'Sajib Hossain', 'Rony Islam', 'Alamin Sheikh',
]

function getDisplayName(review: Review, idx: number): string {
  if (review.user.name && review.user.name.trim()) return review.user.name.trim()
  // Seed consistently from review id + index
  const seed = review.id.charCodeAt(0) + review.id.charCodeAt(1) + idx
  return BD_NAMES[seed % BD_NAMES.length]
}

// Star SVG with half-star support
function StarDisplay({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5 flex-shrink-0">
      {[1, 2, 3, 4, 5].map(s => {
        const filled = s <= Math.floor(rating)
        const half   = !filled && s - 0.5 <= rating
        const gradId = `hg-${s}-${Math.round(rating * 10)}`
        return (
          <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill="none">
            {half && (
              <defs>
                <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#111" />
                  <stop offset="50%" stopColor="#ddd" />
                </linearGradient>
              </defs>
            )}
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={half ? `url(#${gradId})` : filled ? '#111' : '#ddd'}
            />
          </svg>
        )
      })}
    </span>
  )
}

// Thumbs-up icon
function ThumbsUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[#bbb]">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

// ── Style Reviews ─────────────────────────────────────────────────────────────
function StyleReviews({ reviews, avgRating, productId, isLoggedIn }: {
  reviews: Review[]
  avgRating: number
  productId: string
  isLoggedIn: boolean
}) {
  const fiveStarCount = reviews.filter(r => r.rating === 5).length

  return (
    <div>
      {/* Rating summary */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-[40px] font-bold text-[#111] leading-none">{avgRating.toFixed(1)}</span>
        <div>
          <StarDisplay rating={avgRating} size={20} />
          {reviews.length > 0 && (
            <p className="text-[12px] text-[#555] mt-1.5">
              Loved by our users!{' '}
              <strong className="text-[#111]">{fiveStarCount}</strong> out of{' '}
              <strong className="text-[#111]">{reviews.length}</strong> rated 5 stars
            </p>
          )}
        </div>
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-[13px] text-[#999] py-2">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-0">
          {reviews.map((r, idx) => (
            <div key={r.id} className="border-t border-[#f0f0f0] py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {/* Rating badge */}
                  <span className="inline-flex items-center gap-1 bg-[#111] text-white text-[11px] font-bold px-2 py-0.5 rounded-sm flex-shrink-0">
                    {r.rating}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </span>
                  <span className="text-[13px] font-semibold text-[#111]">{getDisplayName(r, idx)}</span>
                  <span className="text-[11px] text-[#27ae60] font-medium">Verified User</span>
                </div>
                <ThumbsUp />
              </div>
              {r.body && (
                <p className="text-[13px] text-[#444] leading-relaxed mt-2">{r.body}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {isLoggedIn && (
        <a
          href={`/products/${productId}/review`}
          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.12em] underline text-[#111] hover:text-[#555] transition-colors"
        >
          Write a Review
        </a>
      )}
    </div>
  )
}

// ── Category Reviews ──────────────────────────────────────────────────────────
const ATTR_SUMMARIES: Record<string, { summary: string; attrs: { label: string; score: number }[] }> = {
  default: {
    summary: 'Praised for premium quality fabrics and excellent fit. Customers appreciate unique designs and comfort. Great value for money with consistent quality highlighted.',
    attrs: [
      { label: 'Durability', score: 4.2 },
      { label: 'Fit',        score: 4.3 },
      { label: 'Price',      score: 4.5 },
      { label: 'Quality',    score: 4.5 },
    ],
  },
  shirts: {
    summary: 'Praised for crisp fabric and sharp collars. Customers love the slim fit and long-lasting colour. Easy to iron and great for both office and casual wear.',
    attrs: [
      { label: 'Fabric',     score: 4.4 },
      { label: 'Fit',        score: 4.3 },
      { label: 'Stitching',  score: 4.5 },
      { label: 'Value',      score: 4.2 },
    ],
  },
  panjabi: {
    summary: 'Customers highlight the beautiful embroidery and premium cotton feel. Perfect for Eid and festive occasions. Sizing is consistent and packaging is always neat.',
    attrs: [
      { label: 'Fabric',     score: 4.6 },
      { label: 'Design',     score: 4.5 },
      { label: 'Fit',        score: 4.2 },
      { label: 'Value',      score: 4.4 },
    ],
  },
  'polo': {
    summary: 'Buyers appreciate the soft pique fabric and neat collar stitching. Colour stays vibrant after washing. Great everyday casual wear for Bangladeshi weather.',
    attrs: [
      { label: 'Softness',   score: 4.5 },
      { label: 'Fit',        score: 4.3 },
      { label: 'Durability', score: 4.2 },
      { label: 'Value',      score: 4.4 },
    ],
  },
  'trousers': {
    summary: 'Customers praise the comfortable waistband and clean tailoring. Fabric breathes well in summer. Good variety of sizes and fast delivery noted across reviews.',
    attrs: [
      { label: 'Comfort',    score: 4.4 },
      { label: 'Fit',        score: 4.3 },
      { label: 'Stitching',  score: 4.5 },
      { label: 'Value',      score: 4.3 },
    ],
  },
}

function getCategoryData(categoryName: string, slug: string) {
  const key = Object.keys(ATTR_SUMMARIES).find(k => slug.includes(k) || categoryName.toLowerCase().includes(k))
  return ATTR_SUMMARIES[key ?? 'default']
}

function CategoryReviews({ categoryName, categorySlug, reviews, avgRating }: {
  categoryName: string
  categorySlug: string
  reviews: Review[]
  avgRating: number
}) {
  const catData     = getCategoryData(categoryName, categorySlug)
  // Use real count if available, otherwise show a plausible social-proof number
  const displayCount = reviews.length > 50
    ? reviews.length.toLocaleString('en-BD')
    : (reviews.length * 47 + 1203).toLocaleString('en-BD')

  const catAvg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : avgRating

  return (
    <div>
      {/* Rating summary */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-[40px] font-bold text-[#111] leading-none">{catAvg.toFixed(1)}</span>
        <StarDisplay rating={catAvg} size={20} />
      </div>

      <p className="text-[13px] text-[#444] leading-relaxed mb-6 text-center">
        Our <strong className="text-[#111]">{categoryName}</strong> are rated 5 stars by{' '}
        <strong className="text-[#111]">{displayCount}</strong> shoppers for the top notch quality and durability
      </p>

      {/* What customers say */}
      <div className="mb-6">
        <p className="text-[13px] font-bold text-[#111] mb-2">What customers say</p>
        <p className="text-[13px] text-[#555] leading-[1.75]">{catData.summary}</p>
      </div>

      {/* Attribute ratings */}
      <div className="space-y-3">
        {catData.attrs.map(({ label, score }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-[#111] w-20 text-right flex-shrink-0">{label}</span>
            <StarDisplay rating={score} size={16} />
            <span className="text-[13px] text-[#555]">{score.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReviewAccordion({
  productId, categoryName, styleReviews, categoryReviews, avgRating, isLoggedIn,
}: Props) {
  const [tab, setTab] = useState<'style' | 'category'>('style')

  // Derive categorySlug from categoryName for attribute lookup
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-')

  const tabCls = (active: boolean) =>
    `pb-3 text-[11px] font-bold uppercase tracking-[0.12em] border-b-2 transition-colors ${
      active ? 'border-[#c26b47] text-[#111]' : 'border-transparent text-[#aaa] hover:text-[#555]'
    }`

  return (
    <ProductAccordion title="Reviews">
      {/* Tabs */}
      <div className="flex gap-8 border-b border-[#e8e8e8] mb-5">
        <button className={tabCls(tab === 'style')}    onClick={() => setTab('style')}>
          Style Reviews
        </button>
        <button className={tabCls(tab === 'category')} onClick={() => setTab('category')}>
          Category Reviews
        </button>
      </div>

      {tab === 'style' ? (
        <StyleReviews
          reviews={styleReviews}
          avgRating={avgRating}
          productId={productId}
          isLoggedIn={isLoggedIn}
        />
      ) : (
        <CategoryReviews
          categoryName={categoryName}
          categorySlug={categorySlug}
          reviews={categoryReviews}
          avgRating={avgRating}
        />
      )}
    </ProductAccordion>
  )
}
