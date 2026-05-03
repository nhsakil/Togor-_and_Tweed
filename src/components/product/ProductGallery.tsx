'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images: { url: string; altText?: string | null }[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-[#f2f2f2] flex items-center justify-center text-[#bbb] text-[11px] uppercase tracking-widest">
        No image
      </div>
    )
  }

  return (
    /* Mobile: col-reverse so thumbnails appear BELOW main image
       Desktop: row so thumbnails are on the LEFT */
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto md:max-h-[600px] pb-1 md:pb-0" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                i === current
                  ? 'ring-2 ring-[#111] ring-offset-1'
                  : 'ring-1 ring-transparent hover:ring-[#ccc]'
              }`}
              aria-label={`View image ${i + 1}`}
              role="tab"
              aria-selected={i === current}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} - view ${i + 1} | Togor & Tweed Bangladesh`}
                fill
                className="object-cover object-top"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 relative aspect-[3/4] bg-[#f2f2f2] overflow-hidden" role="tabpanel" aria-label={`${productName} - Image ${current + 1} of ${images.length}`}>
        <Image
          src={images[current].url}
          alt={images[current].altText ?? `Buy ${productName} - Togor & Tweed Bangladesh`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
    </div>
  )
}
