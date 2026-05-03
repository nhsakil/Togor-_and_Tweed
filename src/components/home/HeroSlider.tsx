'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

export interface HeroSlide {
  image:     string
  badge?:    string
  tags?:     string[]
  title:     string
  subtitle?: string
  cta?:      string
  href:      string
}

// ── Layout constants ──────────────────────────────────────────────────────────
// Center slide = 62vw, gap = 1.5vw, side peek = (100 - 62) / 2 = 19vw each
const SLIDE_VW  = 62        // width of each slide card (vw)
const GAP_VW    = 1.5       // gap between cards (vw)
const STEP_VW   = SLIDE_VW + GAP_VW   // = 63.5vw per slide step
const OFFSET_VW = (100 - SLIDE_VW) / 2 // = 19vw start offset (centers slide 0)

const AUTOPLAY_MS = 5000

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const touchX = useRef<number | null>(null)
  const total  = slides.length

  // Detect mobile for layout switching
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % total) + total) % total)
  }, [total])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  // Auto-play — pauses on hover
  useEffect(() => {
    if (total < 2 || paused) return
    const id = setInterval(next, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [next, total, paused])

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const dx = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 40) dx > 0 ? next() : prev()
    touchX.current = null
  }

  if (!slides.length) return null

  // Mobile: full-width slides, no peek; Desktop: 62vw peek carousel
  const trackTranslateX = isMobile
    ? -(current * 100)                    // -100vw per slide step
    : OFFSET_VW - current * STEP_VW       // desktop peek offset

  const slideWidthStyle = isMobile ? '100vw' : `${SLIDE_VW}vw`

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        // Mobile: 32px announcement + 50px row1 + 38px category strip = 120px
        // Desktop: 32px announcement + 60px nav + 45px category strip = 137px
        height: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 137px)',
        minHeight: isMobile ? 300 : 460,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Slide track ────────────────────────────────────────────────────── */}
      <div
        className="flex h-full"
        style={{
          columnGap: isMobile ? '0' : `${GAP_VW}vw`,
          transform:  `translateX(${trackTranslateX}vw)`,
          transition: 'transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
        }}
      >
        {slides.map((slide, i) => {
          const isActive = i === current
          return (
            <div
              key={i}
              className="relative shrink-0 h-full overflow-hidden"
              style={{
                width: slideWidthStyle,
                // Side cards slightly dimmed — only on desktop peek layout
                opacity:    (!isMobile && !isActive) ? 0.7 : 1,
                transform:  (!isMobile && !isActive) ? 'scale(0.98)' : 'scale(1)',
                transition: 'opacity 0.5s ease, transform 0.65s ease',
              }}
            >
              <SlideContent slide={slide} active={isActive} isFirst={i === 0} />
            </div>
          )
        })}
      </div>

      {/* ── Pagination dots (centered below active panel) ─────────────────── */}
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                height:     8,
                width:      i === current ? 28 : 8,
                borderRadius: 9999,
                background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
                border:     'none',
                padding:    0,
                cursor:     'pointer',
                transition: 'width 0.35s ease, background 0.35s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Arrow buttons (desktop) ───────────────────────────────────────── */}
      {total > 1 && (
        <>
          <button onClick={prev} aria-label="Previous"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={next} aria-label="Next"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}

      {/* ── Auto-play progress bar ────────────────────────────────────────── */}
      {total > 1 && !paused && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20 overflow-hidden">
          <div
            key={current}
            className="h-full bg-white/50"
            style={{ animation: `ttProgress ${AUTOPLAY_MS}ms linear forwards` }}
          />
        </div>
      )}

      <style>{`@keyframes ttProgress { from { width:0% } to { width:100% } }`}</style>
    </section>
  )
}

// ── Individual slide content ──────────────────────────────────────────────────

function SlideContent({ slide, active, isFirst }: { slide: HeroSlide; active: boolean; isFirst: boolean }) {
  return (
    <Link href={slide.href} className="block w-full h-full relative group">
      {/* Background — first slide gets fetchpriority="high" for LCP */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.image}
        alt={`${slide.title} — Togor & Tweed Bangladesh Fashion`}
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        fetchPriority={isFirst ? 'high' : 'auto'}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

      {/* Badge — top right */}
      {slide.badge && (
        <div className="absolute top-5 right-5 z-10">
          <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/30">
            {slide.badge}
          </span>
        </div>
      )}

      {/* Sub-tags — mid left (only on active) */}
      {active && slide.tags && slide.tags.length > 0 && (
        <div className="absolute top-1/2 left-6 md:left-10 -translate-y-1/2 flex gap-5 md:gap-8 z-10">
          {slide.tags.map(tag => (
            <span key={tag} className="text-white/60 text-[10px] font-bold uppercase tracking-[0.25em]">{tag}</span>
          ))}
        </div>
      )}

      {/* Copy — bottom left */}
      <div className="absolute bottom-12 md:bottom-16 left-6 md:left-10 z-10 max-w-sm">
        {slide.subtitle && active && (
          <p className="text-white/65 text-[10px] uppercase tracking-[0.25em] font-medium mb-2">
            {slide.subtitle}
          </p>
        )}
        <h2
          className="text-white font-black uppercase leading-[0.9] tracking-tight"
          style={{ fontSize: active ? 'clamp(2rem, 4vw, 4.5rem)' : 'clamp(1.25rem, 2.5vw, 2.5rem)' }}
        >
          {slide.title}
        </h2>
        {slide.cta && active && (
          <span className="mt-4 inline-flex items-center bg-white text-[#111] text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors">
            {slide.cta}
          </span>
        )}
      </div>
    </Link>
  )
}
