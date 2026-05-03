'use client'
import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'

interface ReviewCardProps {
  rating: number
  title: string | null
  body: string | null
  userName: string | null
  isVerified: boolean
  createdAt: Date
}

export default function ReviewCard({ rating, title, body, userName, isVerified }: ReviewCardProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)

  function handleLike() {
    if (liked) { setLiked(false); setLikes(l => l - 1) }
    else        { setLiked(true);  setLikes(l => l + 1) }
  }

  return (
    <div className="flex items-start gap-4 py-5 border-b border-[#f0f0f0] last:border-b-0">
      {/* Star badge */}
      <div className="flex-shrink-0 bg-[#111] text-white text-[11px] font-bold px-2 py-0.5 flex items-center gap-0.5 leading-none mt-0.5">
        {rating}<span className="text-[10px]">★</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[13px] font-semibold text-[#111]">{userName ?? 'Customer'}</span>
          {isVerified && (
            <span className="text-[10px] font-semibold text-[#c8a96e] uppercase tracking-[0.06em]">
              Verified User
            </span>
          )}
        </div>
        {title && <p className="text-[12px] font-semibold text-[#222] mb-0.5">{title}</p>}
        {body  && <p className="text-[12px] text-[#555] leading-relaxed">{body}</p>}
      </div>

      {/* Thumbs up */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1 flex-shrink-0 text-[11px] transition-colors mt-0.5 ${
          liked ? 'text-[#111]' : 'text-[#bbb] hover:text-[#777]'
        }`}
      >
        {likes > 0 && <span className="font-semibold">{likes}</span>}
        <ThumbsUp size={13} strokeWidth={1.75} className={liked ? 'fill-[#111]' : ''} />
      </button>
    </div>
  )
}
