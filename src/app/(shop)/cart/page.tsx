'use client'

import { useEffect, useState, useRef, useCallback, useTransition } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, Heart, Lock, Tag, X, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { toggleWishlist } from '@/actions/account'
import { toast } from 'sonner'
import LoginModal from '@/components/product/LoginModal'
import QuickAddModal from '@/components/product/QuickAddModal'

/* ─── Types ─────────────────────────────────────────────────────── */
interface DealProduct {
  id: string; name: string; slug: string
  basePrice: number; salePrice: number; discount: number
  image: string | null; variantId: string
  size: string | null; color: string | null
}

/* ─── Deal card ──────────────────────────────────────────────────── */
function DealCard({ p }: { p: DealProduct }) {
  const items   = useCartStore(s => s.items)
  const [quickAdd, setQuickAdd] = useState(false)
  const inCart = items.some(i => i.variantId === p.variantId)

  return (
    <>
      <div className="group">
        <div className="relative overflow-hidden bg-[#f2f2f2]" style={{ aspectRatio: '3/4' }}>
          <Link href={`/products/${p.slug}`}>
            {p.image
              ? <Image src={p.image} alt={p.name} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
              : <div className="absolute inset-0 bg-[#e8e8e8] flex items-center justify-center">
                  <span className="text-[#bbb] text-[10px] uppercase tracking-widest">No Image</span>
                </div>}
          </Link>

          {/* Discount badge */}
          <span className="absolute top-2 left-2 bg-[#e00000] text-white text-[10px] font-bold px-2 py-0.5 uppercase">
            -{p.discount}%
          </span>

          {/* + button → open size modal */}
          <button
            onClick={(e) => { e.preventDefault(); if (!inCart) setQuickAdd(true) }}
            disabled={inCart}
            className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center shadow transition-colors
              ${inCart ? 'bg-[#27ae60] text-white cursor-default' : 'bg-white/90 text-[#111] hover:bg-[#111] hover:text-white'}`}
            aria-label={inCart ? 'In cart' : `Add ${p.name}`}
          >
            {inCart ? <Check size={14} strokeWidth={2.5} /> : <span className="text-[16px] font-light leading-none">+</span>}
          </button>
        </div>

        <div className="mt-2">
          <Link href={`/products/${p.slug}`}>
            <p className="text-[13px] font-medium text-[#111] leading-snug line-clamp-2 hover:text-[#555] transition-colors">
              {p.name}
            </p>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[13px] font-bold text-[#e00000]">{formatCurrency(p.salePrice)}</span>
            <span className="text-[12px] text-[#aaa] line-through">{formatCurrency(p.basePrice)}</span>
          </div>
        </div>
      </div>

      {quickAdd && <QuickAddModal slug={p.slug} onClose={() => setQuickAdd(false)} />}
    </>
  )
}

/* ─── Mobile sticky checkout bar ────────────────────────────────── */
function MobileCheckoutBar({ onPay }: { onPay: () => void }) {
  const subtotal = useCartStore(s => s.subtotal)
  const sub      = subtotal()
  const shipping = sub >= 2000 ? 0 : 80
  const total    = sub + shipping

  return (
    <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-50 bg-white border-t border-[#e8e8e8] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#888] uppercase tracking-[0.1em]">Grand Total</span>
          <span className="text-[18px] font-bold text-[#111] leading-tight">{formatCurrency(total)}</span>
          {shipping === 0 && (
            <span className="text-[10px] text-green-600 font-semibold">Free delivery</span>
          )}
        </div>
        <button
          onClick={onPay}
          className="flex-1 bg-[#111] text-white text-[12px] font-bold uppercase tracking-[0.15em] py-4 hover:bg-[#c8a96e] transition-colors"
        >
          Checkout
        </button>
      </div>
    </div>
  )
}

/* ─── Price sidebar ──────────────────────────────────────────────── */
function PriceSidebar({ isLoggedIn, onNeedLogin, onPay }: {
  isLoggedIn: boolean
  onNeedLogin: () => void
  onPay: () => void
}) {
  const subtotal = useCartStore(s => s.subtotal)
  const sub      = subtotal()
  const shipping = sub >= 2000 ? 0 : 80

  const [showCoupon, setShowCoupon]   = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [applied, setApplied]         = useState<{ code: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [isPending, startTransition]  = useTransition()

  const discount = applied?.discount ?? 0
  const total    = Math.max(0, sub + shipping - discount)

  function applyCode(code: string) {
    const c = code.trim().toUpperCase()
    if (!c) return
    setCouponError('')
    startTransition(async () => {
      const { validateCoupon } = await import('@/actions/coupon')
      const result = await validateCoupon(c, sub)
      if (result.valid && result.discountAmount !== undefined) {
        setApplied({ code: result.code!, discount: result.discountAmount })
        setCouponInput('')
      } else {
        setCouponError(result.error ?? 'Invalid coupon')
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Coupon collapsible */}
      <div className="border border-[#e0e0e0]">
        <button
          onClick={() => { if (!isLoggedIn) { onNeedLogin(); return } setShowCoupon(v => !v) }}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-[#fafafa] text-left"
        >
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111]">
            {isLoggedIn
              ? <Tag size={13} className="text-[#c26b47] flex-shrink-0" />
              : <Lock size={13} className="text-[#c26b47] flex-shrink-0" />}
            {isLoggedIn ? 'Apply Coupon / Gift Card' : 'Login to view Coupons and Gift Cards'}
          </span>
          {isLoggedIn
            ? (showCoupon ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
            : <ChevronDown size={13} className="text-[#aaa]" />}
        </button>

        {isLoggedIn && showCoupon && (
          <div className="px-4 pb-4 pt-3 border-t border-[#f0f0f0]">
            {applied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5 rounded">
                <div className="flex items-center gap-2">
                  <Tag size={12} className="text-green-600" />
                  <span className="text-[11px] font-mono font-bold text-green-700">{applied.code}</span>
                  <span className="text-[11px] text-green-600">(-{formatCurrency(applied.discount)})</span>
                </div>
                <button onClick={() => setApplied(null)} className="text-green-500 hover:text-green-700">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input value={couponInput}
                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                    onKeyDown={e => e.key === 'Enter' && applyCode(couponInput)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-[#ddd] px-3 py-2 text-[11px] uppercase font-mono focus:outline-none focus:border-[#111] transition-colors"
                  />
                  <button onClick={() => applyCode(couponInput)}
                    disabled={isPending || !couponInput.trim()}
                    className="px-4 bg-[#111] text-white text-[10px] font-bold uppercase tracking-wide hover:bg-[#333] disabled:opacity-40 transition-colors">
                    {isPending ? '…' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 mt-1.5">{couponError}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRICE DETAILS */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111] mb-4">Price Details</p>
        <div className="space-y-3">
          <div className="flex justify-between text-[13px]">
            <span className="text-[#666]">Bag Total</span>
            <span className="font-medium text-[#111]">{formatCurrency(sub)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#666]">Coupon Discount</span>
            <span className={discount > 0 ? 'text-green-600 font-medium' : 'text-[#aaa]'}>
              {discount > 0 ? `-${formatCurrency(discount)}` : '- ৳0'}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#666]">Delivery Charges</span>
            <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium text-[#111]'}>
              {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
            </span>
          </div>
          {sub < 2000 && (
            <p className="text-[10px] text-[#c26b47]">Add {formatCurrency(2000 - sub)} more for free delivery</p>
          )}
          <div className="flex justify-between text-[14px] font-bold text-[#111] border-t border-[#e8e8e8] pt-3 mt-1">
            <span>Grand Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* PAY */}
      <button onClick={onPay}
        className="w-full bg-[#111] text-white text-[13px] font-bold uppercase tracking-[0.15em] py-4 hover:bg-[#c8a96e] transition-colors">
        PAY {formatCurrency(total)}
      </button>

      <Link href="/collections"
        className="block text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[#999] hover:text-[#111] transition-colors">
        Continue Shopping
      </Link>
    </div>
  )
}

/* ─── Cart item row ──────────────────────────────────────────────── */
function CartRow({ item, isLoggedIn, onNeedLogin }: {
  item: ReturnType<typeof useCartStore.getState>['items'][0]
  isLoggedIn: boolean
  onNeedLogin: () => void
}) {
  const { removeItem, updateQuantity } = useCartStore()

  async function handleMoveToWishlist() {
    if (!isLoggedIn) { onNeedLogin(); return }
    const r = await toggleWishlist(item.productId)
    if (r.success) { removeItem(item.variantId); toast.success('Moved to wishlist') }
    else toast.error('Could not add to wishlist')
  }

  return (
    <div className="flex gap-5 py-6 border-b border-[#f0f0f0] last:border-0">
      {/* Tall image */}
      <Link href={`/products/${item.slug ?? ''}`} className="flex-shrink-0">
        <div className="relative bg-[#f2f2f2] overflow-hidden" style={{ width: 110, aspectRatio: '3/4' }}>
          {item.image
            ? <Image src={item.image} alt={item.name} fill sizes="110px" className="object-cover object-top" />
            : <div className="absolute inset-0 bg-[#e8e8e8]" />}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#111] leading-snug">{item.name}</p>
            {(item.size || item.color) && (
              <p className="text-[12px] text-[#888] mt-1 uppercase tracking-wide">
                {[item.size, item.color].filter(Boolean).join('  ·  ')}
                {'  '}QTY | {item.quantity}
              </p>
            )}
          </div>
          <button onClick={() => removeItem(item.variantId)}
            className="flex-shrink-0 p-1 text-[#ccc] hover:text-[#e00000] transition-colors mt-0.5">
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Qty */}
        <div className="flex items-center gap-0 border border-[#e0e0e0] w-fit mt-4">
          <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center text-[#555] hover:bg-[#f5f5f5] transition-colors">
            <Minus size={12} />
          </button>
          <span className="w-8 text-center text-[13px] font-semibold text-[#111] select-none">{item.quantity}</span>
          <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-[#555] hover:bg-[#f5f5f5] transition-colors">
            <Plus size={12} />
          </button>
        </div>

        {/* MOVE TO WISHLIST + price */}
        <div className="flex items-center justify-between mt-4">
          <button onClick={handleMoveToWishlist}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#555] hover:text-[#c26b47] transition-colors">
            <Heart size={12} strokeWidth={1.75} />
            Move to Wishlist
          </button>
          <span className="text-[15px] font-bold text-[#111]">{formatCurrency(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */
const PAGE_SIZE = 12

export default function CartPage() {
  const items             = useCartStore(s => s.items)
  const { data: session } = useSession()
  const router            = useRouter()
  const isLoggedIn        = !!session?.user

  const [showLogin, setShowLogin]   = useState(false)

  // Deals lazy load
  const [deals, setDeals]       = useState<DealProduct[]>([])
  const [dealsPage, setDealsPage] = useState(1)
  const [dealsTotal, setDealsTotal] = useState(0)
  const [dealsLoading, setDealsLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchDeals = useCallback(async (page: number) => {
    setDealsLoading(true)
    try {
      const res  = await fetch(`/api/products/deals?page=${page}`)
      const data = await res.json()
      setDeals(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const fresh = (data.items as DealProduct[]).filter(p => !existingIds.has(p.id))
        return [...prev, ...fresh]
      })
      setDealsTotal(data.total ?? 0)
      setDealsPage(page)
    } catch { /* silent */ }
    setDealsLoading(false)
  }, [])

  // Initial load
  useEffect(() => { fetchDeals(1) }, [fetchDeals])

  // IntersectionObserver for infinite scroll
  const loadMore = useCallback(() => {
    if (dealsLoading) return
    const loaded = dealsPage * PAGE_SIZE
    if (loaded < dealsTotal) fetchDeals(dealsPage + 1)
  }, [dealsLoading, dealsPage, dealsTotal, fetchDeals])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '300px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  function handlePay() {
    if (!isLoggedIn) { setShowLogin(true); return }
    router.push('/checkout')
  }

  /* Empty cart */
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <p className="font-playfair text-3xl text-[#111]">Your bag is empty</p>
        <p className="text-[13px] text-[#888]">Looks like you haven't added anything yet.</p>
        <Link href="/collections"
          className="bg-[#111] text-white text-[11px] font-bold uppercase tracking-[0.15em] px-8 py-4 hover:bg-[#333] transition-colors">
          Shop Now
        </Link>
      </div>
    )
  }

  const hasMoreDeals = dealsPage * PAGE_SIZE < dealsTotal

  return (
    <>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* Sticky mobile checkout bar */}
      <MobileCheckoutBar onPay={handlePay} />

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-14 pb-[144px] md:pb-14">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl font-normal text-[#111]">Your Bag</h1>
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#aaa] mt-1">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">

          {/* Left: cart items */}
          <div className="flex-1 min-w-0">
            {items.map(item => (
              <CartRow key={item.variantId} item={item} isLoggedIn={isLoggedIn} onNeedLogin={() => setShowLogin(true)} />
            ))}
          </div>

          {/* Right: sticky price sidebar */}
          <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-[140px]">
            <PriceSidebar isLoggedIn={isLoggedIn} onNeedLogin={() => setShowLogin(true)} onPay={handlePay} />
          </div>
        </div>

        {/* Steal Deals — full width below, lazy loaded */}
        {(deals.length > 0 || dealsLoading) && (
          <div className="mt-14 border-t border-[#e8e8e8] pt-10">
            <div className="text-center mb-8">
              <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#111]">Steal Deals</h2>
              <p className="text-[12px] text-[#c26b47] font-semibold mt-1">Worth adding to your bag</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {deals.map(p => <DealCard key={p.id} p={p} />)}

              {/* Skeleton placeholders while loading */}
              {dealsLoading && Array.from({ length: 6 }).map((_, i) => (
                <div key={`sk-${i}`}>
                  <div className="bg-[#f0f0f0] animate-pulse" style={{ aspectRatio: '3/4' }} />
                  <div className="mt-2 h-3 bg-[#f0f0f0] animate-pulse rounded w-3/4" />
                  <div className="mt-1.5 h-3 bg-[#f0f0f0] animate-pulse rounded w-1/2" />
                </div>
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4 mt-4" />

            {!hasMoreDeals && !dealsLoading && deals.length > 0 && (
              <p className="text-center text-[11px] text-[#bbb] uppercase tracking-widest mt-6">
                All deals shown
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
