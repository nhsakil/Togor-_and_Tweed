'use client'
import { Trash2 } from 'lucide-react'
import { deleteProduct } from '@/actions/admin'
import { useTransition } from 'react'

interface Props {
  productId: string
  productName: string
}

export default function DeleteProductButton({ productId, productName }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return
    startTransition(async () => {
      try {
        await deleteProduct(productId)
      } catch (err) {
        console.error(err)
        alert('Failed to delete product')
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
      aria-label={`Delete ${productName}`}
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
