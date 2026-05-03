'use client'

const MESSAGES = [
  'Free Delivery on Orders Over ৳1,500',
  'Cash on Delivery Available',
  'New Season Arrivals — Shop Now',
  'Premium Quality · Made in Bangladesh',
  'Easy 7-Day Returns',
]

export default function AnnouncementBar() {
  const repeated = [...MESSAGES, ...MESSAGES, ...MESSAGES]
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-[#111] text-white h-8 overflow-hidden select-none"
      role="region"
      aria-label="Announcements"
    >
      {/* Inner constrained wrapper — mirrors body max-w-[480px] on mobile */}
      <div className="w-full max-w-[480px] md:max-w-none mx-auto h-full flex items-center overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee" aria-live="polite" aria-atomic="true">
          {repeated.map((msg, i) => (
            <span key={i} className="text-[10px] tracking-[0.1em] uppercase px-8">
              {msg}
              <span className="mx-6 opacity-40">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
