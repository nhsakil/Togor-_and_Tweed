'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useCartStore } from '@/store/cartStore'
import { useSession } from 'next-auth/react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CartItem from './CartItem'
import CartSummary, { type AvailableOffer } from './CartSummary'
import EmptyCart from './EmptyCart'
import StealDeals from '@/components/checkout/StealDeals'
import LoginModal from '@/components/product/LoginModal'
import { getAvailableOffers } from '@/actions/coupon'
import { formatCurrency } from '@/lib/utils/format'

interface DealProduct {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice: number
  image: string | null
  variantId: string
  size: string | null
  color: string | null
}

export default function CartDrawer() {
  const { cartOpen, closeCart }       = useUIStore()
  const items                         = useCartStore((s) => s.items)
  const subtotal                      = useCartStore((s) => s.subtotal)
  const { data: session }             = useSession()
  const router                        = useRouter()

  const [offers, setOffers]           = useState<AvailableOffer[]>([])
  const [deals, setDeals]             = useState<DealProduct[]>([])
  const [showLogin, setShowLogin]     = useState(false)
  const [grandTotal, setGrandTotal]   = useState<number | null>(null)

  const isLoggedIn = !!session?.user

  const sub     = subtotal()
  const shipping = sub >= 2000 ? 0 : 80
  const payTotal = grandTotal !== null ? grandTotal : sub + shipping

  const fetchData = useCallback(async () => {
    getAvailableOffers().then(setOffers).catch(() => {})
    fetch('/api/products/deals')
      .then(r => r.json())
      .then(d => setDeals(d.items ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (cartOpen) fetchData()
  }, [cartOpen, fetchData])

  function handlePay() {
    if (!isLoggedIn) {
      setShowLogin(true)
      return
    }
    closeCart()
    router.push('/checkout')
  }

  if (!cartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={closeCart}
        aria-hidden="true"
        role="presentation"
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col animate-slide-in-right"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e8]">
          <div>
            <p className="font-playfair text-[17px] font-bold text-[#111] leading-none">
              Your Bag
            </p>
            {items.length > 0 && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#aaa] mt-1">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </p>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-1.5 text-[#888] hover:text-[#111] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-5 py-5">
              <EmptyCart onClose={closeCart} />
            </div>
          ) : (
            <>
              {/* Cart items */}
              <ul className="px-5 list-none m-0 p-0">
                {items.map((item) => (
                  <CartItem
                    key={item.variantId}
                    item={item}
                    isLoggedIn={isLoggedIn}
                    onNeedLogin={() => setShowLogin(true)}
                  />
                ))}
              </ul>

              {/* Steal Deals */}
              {deals.length > 0 && (
                <div className="mt-2 border-t border-[#f0f0f0]">
                  <StealDeals products={deals} compact />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer: summary + pay button */}
        {items.length > 0 && (
          <div className="border-t border-[#e8e8e8] px-5 py-4 space-y-4">
            <CartSummary
              availableOffers={offers}
              isLoggedIn={isLoggedIn}
              onNeedLogin={() => setShowLogin(true)}
              onCouponApplied={(discount) => {
                const s = subtotal()
                const sh = s >= 2000 ? 0 : 80
                setGrandTotal(Math.max(0, s + sh - discount))
              }}
            />

            {/* PAY button */}
            <button
              onClick={handlePay}
              className="w-full bg-[#111] text-white text-[12px] font-bold uppercase tracking-[0.15em] py-4 hover:bg-[#c8a96e] transition-colors"
            >
              PAY {formatCurrency(payTotal)}
            </button>

            <button
              onClick={closeCart}
              className="w-full bg-none border-none text-[10px] font-semibold uppercase tracking-[0.1em] text-[#999] hover:text-[#111] transition-colors py-1"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>

      {/* Login modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
