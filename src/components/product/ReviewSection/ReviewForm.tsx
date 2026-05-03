'use client'

import { useState, useTransition } from 'react'
import { submitReview } from '@/actions/review'

interface Props {
  productId: string
  isLoggedIn: boolean
}

export default function ReviewForm({ productId, isLoggedIn }: Props) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (submitted) {
    return (
      <div className="border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-green-700 font-medium">Thank you for your review!</p>
        <p className="text-sm text-green-600 mt-1">
          Your review is pending approval and will appear shortly.
        </p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="border border-gray-100 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600 mb-3">Sign in to leave a review</p>
        <a
          href="/login"
          className="inline-block bg-brand-black text-white text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-brand-gold transition-colors"
        >
          Sign In
        </a>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a star rating.')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await submitReview({ productId, rating, title, body })
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star picker */}
      <div>
        <label id="rating-legend" className="label-xs">Your Rating *</label>
        <div className="flex gap-1 mt-1" role="radiogroup" aria-labelledby="rating-legend">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
              className="text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
              aria-label={`${s} star${s > 1 ? 's' : ''}`}
              role="radio"
              aria-checked={rating === s}
            >
              <span className={(hover || rating) >= s ? 'text-brand-gold' : 'text-gray-300'}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="review-title" className="label-xs">
          Review Title
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Summarise your experience"
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-gold transition-colors"
        />
      </div>

      {/* Body */}
      <div>
        <label htmlFor="review-body" className="label-xs">
          Your Review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Tell us what you think about fit, quality, and style..."
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-gold transition-colors resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-black text-white text-xs uppercase tracking-widest py-3 hover:bg-brand-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
