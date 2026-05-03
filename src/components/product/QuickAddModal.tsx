'use client'

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { addToCart } from '@/actions/cart'
import { toast } from 'sonner'

interface Variant {
  id: string
  size: string | null
  color: string | null
  price: number
  salePrice: number | null
  available: number
}

interface ProductData {
  id: string
  name: string
  slug: string
  image: string | null
  variants: Variant[]
}

interface Props {
  slug: string
  onClose: () => void
}

export default function QuickAddModal({ slug, onClose }: Props) {
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding]   = useState<string | null>(null)
  const addItem               = useCartStore(s => s.addItem)
  const openCart              = useUIStore(s => s.openCart)

  const fetchVariants = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/products/slug-variants?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      setProduct(data)
    } catch {
      toast.error('Could not load sizes')
      onClose()
    }
    setLoading(false)
  }, [slug, onClose])

  useEffect(() => { fetchVariants() }, [fetchVariants])

  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSelect(variant: Variant) {
    if (variant.available <= 0 || !product) return
    setAdding(variant.id)

    addItem({
      variantId: variant.id,
      productId: product.id,
      name:      product.name,
      slug:      product.slug,
      image:     product.image,
      size:      variant.size,
      color:     variant.color,
      price:     variant.salePrice ?? variant.price,
      quantity:  1,
    })

    onClose()
    openCart()   // open drawer after adding

    addToCart({ variantId: variant.id, quantity: 1 }).catch(() => {})
    setAdding(null)
  }

  const sizes    = product?.variants ?? []
  const hasSizes = sizes.some(v => v.size)

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <div className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[90vw] max-w-[600px] shadow-2xl"
        role="dialog" aria-modal="true" aria-label="Select a size">

        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#111]">Select a Size</p>
          <button onClick={onClose} className="p-1 text-[#888] hover:text-[#111] transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 min-h-[120px]">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#e0e0e0] border-t-[#111] rounded-full animate-spin" />
            </div>
          ) : !product || sizes.length === 0 ? (
            <p className="text-center text-[13px] text-[#999] py-6">No sizes available</p>
          ) : hasSizes ? (
            <div className="grid grid-cols-2 divide-y divide-[#f0f0f0]">
              {sizes.map((v) => {
                const oos      = v.available <= 0
                const lowStock = !oos && v.available <= 5
                return (
                  <button key={v.id} onClick={() => handleSelect(v)} disabled={oos || !!adding}
                    className={`flex items-center justify-center gap-2 px-4 py-4 text-[13px] font-medium border-r border-[#f0f0f0] odd:border-r even:border-r-0 transition-colors
                      ${oos ? 'text-[#ccc] line-through cursor-not-allowed bg-[#fafafa]'
                             : 'text-[#555] hover:bg-[#f5f5f5] hover:text-[#111] cursor-pointer'}
                      ${adding === v.id ? 'bg-[#f0f0f0]' : ''}`}
                  >
                    <span>{v.size}</span>
                    {lowStock && <span className="text-[10px] text-[#e00000] font-semibold">{v.available} left</span>}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="py-2">
              {sizes.map(v => (
                <button key={v.id} onClick={() => handleSelect(v)} disabled={v.available <= 0 || !!adding}
                  className="w-full py-4 text-[13px] font-medium text-[#555] hover:bg-[#f5f5f5] hover:text-[#111] transition-colors border border-[#f0f0f0] disabled:text-[#ccc] disabled:cursor-not-allowed">
                  {v.available > 0 ? 'One Size' : 'Out of Stock'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
