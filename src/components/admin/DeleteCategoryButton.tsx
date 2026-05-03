'use client'
import { Trash2 } from 'lucide-react'
import { deleteCategory } from '@/actions/admin'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  categoryId: string
  categoryName: string
  productCount: number
}

export default function DeleteCategoryButton({ categoryId, categoryName, productCount }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (productCount > 0) {
      alert(`Cannot delete "${categoryName}" — it has ${productCount} product(s).`)
      return
    }
    if (!confirm(`Delete category "${categoryName}"? This cannot be undone.`)) return

    startTransition(async () => {
      try {
        await deleteCategory(categoryId)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete category')
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending || productCount > 0}
      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      title={productCount > 0 ? `Has ${productCount} products` : 'Delete category'}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
