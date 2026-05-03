'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'

export default function DuplicateProductButton({
  productId,
  productName,
}: {
  productId: string
  productName: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDuplicate() {
    if (!confirm(`Duplicate "${productName}"? A draft copy will be created.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/duplicate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Duplicate failed')
      router.push(`/admin/products/${data.data.id}/edit`)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Duplicate failed')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      title="Duplicate product"
      className="p-1.5 text-gray-400 hover:text-amber-600 disabled:opacity-40 transition-colors"
    >
      <Copy className="h-4 w-4" />
    </button>
  )
}
