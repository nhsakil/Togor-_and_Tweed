'use client'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { X, MessageCircle } from 'lucide-react'

// WhatsApp SVG icon
function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.468.671 4.779 1.838 6.766L2 30l7.447-1.818A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#fff"/>
      <path d="M16 3.6C9.15 3.6 3.6 9.15 3.6 16c0 2.302.629 4.456 1.726 6.306L3.6 28.4l6.26-1.705A12.356 12.356 0 0016 28.4c6.85 0 12.4-5.55 12.4-12.4S22.85 3.6 16 3.6z" fill="#25D366"/>
      <path d="M22.1 19.35c-.3-.15-1.77-.874-2.045-.974-.274-.1-.474-.15-.673.15-.2.3-.773.974-.947 1.174-.174.2-.348.225-.648.075-.3-.15-1.267-.467-2.413-1.488-.892-.794-1.494-1.774-1.669-2.074-.174-.3-.018-.462.131-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.673-1.624-.922-2.224-.243-.585-.49-.506-.673-.515l-.573-.01c-.2 0-.524.075-.798.375-.274.3-1.047 1.023-1.047 2.496 0 1.474 1.072 2.899 1.222 3.099.15.2 2.11 3.224 5.115 4.52.715.31 1.273.494 1.708.633.718.228 1.372.196 1.888.119.576-.086 1.77-.724 2.02-1.423.25-.7.25-1.3.175-1.424-.075-.124-.274-.199-.574-.349z" fill="#fff"/>
    </svg>
  )
}

interface ProductInfo {
  name: string
  price: string
  url: string
  image: string | null
}

export default function WhatsAppButton() {
  const pathname        = usePathname()
  const [phone, setPhone]         = useState('')
  const [product, setProduct]     = useState<ProductInfo | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [loaded, setLoaded]       = useState(false)
  const tooltipRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Extract product slug from /products/[slug]
  const productSlug = pathname.startsWith('/products/')
    ? pathname.split('/products/')[1]?.split('?')[0]?.split('#')[0]
    : null

  // Load WhatsApp number fresh from settings on every mount (no cache)
  useEffect(() => {
    fetch('/api/admin/settings?keys=whatsapp_number')
      .then(r => r.json())
      .then(d => {
        const num = d.data?.whatsapp_number ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
        setPhone(num)
        setLoaded(true)
      })
      .catch(() => {
        const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
        setPhone(num)
        setLoaded(true)
      })
  }, [])

  // Load product info when on a product page
  useEffect(() => {
    if (!productSlug) { setProduct(null); return }
    const siteUrl = window.location.origin

    fetch('/api/products/' + productSlug)
      .then(r => r.json())
      .then(d => {
        const p = d.data
        if (!p) return
        const v = p.variants?.[0]
        const price = v?.salePrice
          ? '৳' + Number(v.salePrice).toLocaleString()
          : v?.price
          ? '৳' + Number(v.price).toLocaleString()
          : p.salePrice
          ? '৳' + Number(p.salePrice).toLocaleString()
          : '৳' + Number(p.basePrice).toLocaleString()

        setProduct({
          name:  p.name,
          price,
          url:   siteUrl + '/products/' + p.slug,
          image: p.images?.[0]?.url ?? null,
        })
      })
      .catch(() => {})
  }, [productSlug])

  // Build WhatsApp message
  function buildMessage() {
    if (product) {
      return (
        'Hi! I\'m interested in this product from Togor & Tweed:\n\n' +
        '*' + product.name + '*\n' +
        'Price: ' + product.price + '\n' +
        'Link: ' + product.url + '\n\n' +
        'Please let me know about availability and ordering.'
      )
    }
    return 'Hi! I\'d like to know more about your products at Togor & Tweed. Please help me.'
  }

  function handleClick() {
    if (!phone) return
    const msg = encodeURIComponent(buildMessage())
    const cleanPhone = phone.replace(/\D/g, '')
    window.open('https://wa.me/' + cleanPhone + '?text=' + msg, '_blank', 'noopener')
  }

  function handleMouseEnter() {
    if (tooltipRef.current) clearTimeout(tooltipRef.current)
    setShowTooltip(true)
  }
  function handleMouseLeave() {
    tooltipRef.current = setTimeout(() => setShowTooltip(false), 300)
  }

  // Don't render until number is loaded / if no number set
  if (!loaded || !phone) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tooltip / preview card */}
      {showTooltip && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-[260px] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <WhatsAppIcon size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-900 leading-tight">Chat with us</p>
                <p className="text-[10px] text-gray-400">Usually replies quickly</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowTooltip(false) }}
              className="text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Product preview if on product page */}
          {product && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl mb-3">
              {product.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-800 truncate">{product.name}</p>
                <p className="text-[11px] text-[#25D366] font-bold">{product.price}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleClick}
            className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {product ? 'Ask about this product' : 'Start a conversation'}
          </button>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={handleClick}
        aria-label="Chat on WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1fb855] shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center relative"
      >
        <WhatsAppIcon size={30} />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      </button>
    </div>
  )
}
