'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Props {
  categories: Category[]
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function AddCategoryForm({ categories }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    metaTitle: '',
    metaDesc: '',
    metaKeywords: '',
  })
  const [showSeo, setShowSeo] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setForm((prev) => ({ ...prev, name, slug: slugify(name) }))
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Name and slug are required')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            description: form.description || null,
            parentId: form.parentId || null,
            metaTitle: form.metaTitle || null,
            metaDesc: form.metaDesc || null,
            metaKeywords: form.metaKeywords || null,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Failed to create category')
        }

        setForm({ name: '', slug: '', description: '', parentId: '', metaTitle: '', metaDesc: '', metaKeywords: '' })
        setShowSeo(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Add Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleNameChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Men"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              placeholder="e.g. men"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
            <select
              name="parentId"
              value={form.parentId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">None (top-level)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {isPending ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full max-w-lg px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Optional description"
          />
        </div>

        {/* SEO toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowSeo(s => !s)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {showSeo ? '▲ Hide SEO fields' : '▼ Add SEO meta (optional)'}
          </button>
          {showSeo && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Meta Title <span className="font-normal text-gray-400">(≤70 chars)</span>
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={form.metaTitle}
                  onChange={handleChange}
                  maxLength={70}
                  placeholder={`${form.name || 'Category'} for Men | Togor & Tweed`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-0.5 text-[10px] text-gray-400">{form.metaTitle.length}/70</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Meta Description <span className="font-normal text-gray-400">(≤155 chars)</span>
                </label>
                <textarea
                  name="metaDesc"
                  value={form.metaDesc}
                  onChange={handleChange}
                  rows={2}
                  maxLength={155}
                  placeholder="Shop … for men in Bangladesh at Togor & Tweed."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <p className="mt-0.5 text-[10px] text-gray-400">{form.metaDesc.length}/155</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Meta Keywords <span className="font-normal text-gray-400">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  name="metaKeywords"
                  value={form.metaKeywords}
                  onChange={handleChange}
                  placeholder="men's shirts, formal shirt bangladesh"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
