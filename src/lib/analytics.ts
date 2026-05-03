/**
 * GA4 Event Tracking Utilities
 * ─────────────────────────────
 * Usage:
 *   import { trackEvent, trackAddToCart, trackViewItem, trackPurchase } from '@/lib/analytics'
 *
 * All functions are no-ops when GA4 is not configured (no NEXT_PUBLIC_GA_MEASUREMENT_ID).
 * Never throws — analytics should never break the shopping experience.
 *
 * Setup:
 *   1. Get your GA4 Measurement ID from Google Analytics console (starts with G-)
 *   2. Add to .env.local: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 *   3. GA4 is automatically loaded in layout.tsx when this variable is set
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { gtag?: (...args: any[]) => void; dataLayer?: any[] }
}

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag(...args)
}

// ── Core event ───────────────────────────────────────────────────────────────

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    gtag('event', eventName, params)
  } catch {
    // silent
  }
}

// ── E-commerce events (GA4 standard) ─────────────────────────────────────────

export interface TrackItem {
  item_id:       string
  item_name:     string
  item_category?: string
  item_brand?:   string
  price:         number
  quantity?:     number
  item_variant?: string
}

/** Fire when a user adds a product to their cart */
export function trackAddToCart(item: TrackItem) {
  trackEvent('add_to_cart', {
    currency: 'BDT',
    value: item.price * (item.quantity ?? 1),
    items: [item],
  })
}

/** Fire when a product detail page is viewed */
export function trackViewItem(item: TrackItem) {
  trackEvent('view_item', {
    currency: 'BDT',
    value: item.price,
    items: [item],
  })
}

/** Fire when a user begins checkout */
export function trackBeginCheckout(items: TrackItem[], value: number) {
  trackEvent('begin_checkout', {
    currency: 'BDT',
    value,
    items,
  })
}

/** Fire when a purchase is completed */
export function trackPurchase(params: {
  transaction_id: string
  value: number
  items: TrackItem[]
  coupon?: string
}) {
  trackEvent('purchase', {
    currency: 'BDT',
    ...params,
  })
}

/** Fire when a product list / category page is viewed */
export function trackViewItemList(items: TrackItem[], listName: string) {
  trackEvent('view_item_list', {
    item_list_name: listName,
    items,
  })
}

/** Fire when a user clicks on a product in a list */
export function trackSelectItem(item: TrackItem, listName: string) {
  trackEvent('select_item', {
    item_list_name: listName,
    items: [item],
  })
}

/** Fire when a user searches */
export function trackSearch(searchTerm: string) {
  trackEvent('search', { search_term: searchTerm })
}

/** Fire when a user removes an item from cart */
export function trackRemoveFromCart(item: TrackItem) {
  trackEvent('remove_from_cart', {
    currency: 'BDT',
    value: item.price * (item.quantity ?? 1),
    items: [item],
  })
}
