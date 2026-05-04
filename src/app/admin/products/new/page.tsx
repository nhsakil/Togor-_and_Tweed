'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Layers } from 'lucide-react'

interface Category  { id: string; name: string; slug: string }
interface SizeChart { id: string; name: string }
interface CatSize   { id: string; label: string; sortOrder: number; isActive: boolean }
interface VariantRow {
  _id: string
  size: string; color: string; colorHex: string
  sku: string; price: string; stock: string
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim()
}
function makeId() { return Math.random().toString(36).slice(2, 9) }
function autoSku(name: string, size: string, color: string) {
  const n = name.slice(0,6).toUpperCase().replace(/[\s-]+/g,'')
  const s = size.slice(0,4).toUpperCase()
  const c = color.slice(0,3).toUpperCase()
  const r = Math.floor(Math.random()*900+100)
  return [n,s,c,r].filter(Boolean).join('-')
}

export default function NewProductPage() {
  const router = useRouter()

  const [categories,  setCategories]  = useState<Category[]>([])
  const [sizeCharts,  setSizeCharts]  = useState<SizeChart[]>([])
  const [catSizes,    setCatSizes]    = useState<CatSize[]>([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const [form, setForm] = useState({
    name:'', slug:'', description:'', categoryId:'',
    basePrice:'', salePrice:'', brand:'Togor & Tweed',
    sizeChartId:'', isFeatured: false, isActive: true,
    metaTitle:'', metaDesc:'', metaKeywords:'',
  })
  const [showSeo, setShowSeo] = useState(false)

  const [variants, setVariants] = useState<VariantRow[]>([
    { _id: makeId(), size:'M', color:'', colorHex:'#000000', sku:'', price:'', stock:'10' },
  ])

  const loadCatSizes = useCallback(async (catId: string) => {
    if (!catId) { setCatSizes([]); return }
    const res  = await fetch('/api/admin/category-sizes?categoryId=' + catId)
    const data = await res.json()
    setCatSizes((data.data ?? []).sort((a: CatSize, b: CatSize) => a.sortOrder - b.sortOrder))
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then(r => r.json()),
      fetch('/api/admin/size-charts').then(r => r.json()),
    ]).then(([catData, chartData]) => {
      setCategories(catData.data ?? [])
      setSizeCharts(chartData.data ?? [])
    }).catch(console.error)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    setForm(p => {
      const next = { ...p, [name]: type === 'checkbox' ? checked : value }
      if (name === 'name') next.slug = slugify(value)
      if (name === 'categoryId') loadCatSizes(value)
      return next
    })
  }

  function updateVariant(id: string, field: keyof Omit<VariantRow,'_id'>, value: string) {
    setVariants(v => v.map(r => r._id === id ? { ...r, [field]: value } : r))
  }

  function addBlankRow() {
    setVariants(v => [...v, { _id: makeId(), size:'', color:'', colorHex:'#000000', sku:'', price:'', stock:'10' }])
  }

  /** Append one row pre-filled with a size label */
  function appendSizeRow(label: string) {
    setVariants(v => [...v, {
      _id: makeId(), size: label, color: '', colorHex: '#000000',
      sku: autoSku(form.name, label, ''), price: '', stock: '10',
    }])
  }

  /** Replace variant list with one row per active category size */
  function generateAllSizeRows() {
    const active = catSizes.filter(s => s.isActive)
    if (!active.length) return
    setVariants(active.map(s => ({
      _id: makeId(), size: s.label, color: '', colorHex: '#000000',
      sku: autoSku(form.name, s.label, ''), price: '', stock: '10',
    })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const missing = variants.filter(v => !v.sku.trim())
    if (missing.length) { setError('All variants must have a SKU'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, slug: form.slug,
          description: form.description || null,
          categoryId: form.categoryId,
          basePrice: parseFloat(form.basePrice),
          salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
          brand: form.brand || null,
          sizeChartId: form.sizeChartId || null,
          isFeatured: form.isFeatured, isActive: form.isActive,
          metaTitle: form.metaTitle || null,
          metaDesc: form.metaDesc || null,
          metaKeywords: form.metaKeywords || null,
          variants: variants.map(v => ({
            sku: v.sku, size: v.size || null,
            color: v.color || null, colorHex: v.colorHex || null,
            price: v.price || null, stock: v.stock || '0',
          })),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      const { data } = await res.json()
      router.push('/admin/products/' + data.id + '/edit')
    } catch(err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally { setLoading(false) }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const activeCatSizes = catSizes.filter(s => s.isActive)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
        <p className="text-gray-500 text-sm mt-1">Add a new product with size chart and variants</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        {/* ── Product Details ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                className={inputCls} placeholder="e.g. Classic Oxford Shirt" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input type="text" name="slug" value={form.slug} onChange={handleChange} required
                className={inputCls + ' font-mono'} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className={inputCls + ' resize-none'} placeholder="Describe the product..." />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} required
                className={inputCls + ' bg-white'}>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Size Chart */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size Chart
                <span className="ml-1 font-normal text-gray-400 text-xs">(shown in product description)</span>
              </label>
              <select name="sizeChartId" value={form.sizeChartId} onChange={handleChange}
                className={inputCls + ' bg-white'}>
                <option value="">— Use category default —</option>
                {sizeCharts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {form.sizeChartId && (
                <p className="mt-1 text-xs text-indigo-600">✓ Size table will appear inline in the product description</p>
              )}
              {!form.sizeChartId && form.categoryId && (
                <p className="mt-1 text-xs text-gray-400">Will inherit the category&apos;s default size chart if set</p>
              )}
              {sizeCharts.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No size charts yet —{' '}
                  <a href="/admin/size-charts" target="_blank" className="underline">create one first</a>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (৳) <span className="text-red-500">*</span></label>
              <input type="number" name="basePrice" value={form.basePrice} onChange={handleChange}
                required min="0" step="0.01" className={inputCls} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (৳)</label>
              <input type="number" name="salePrice" value={form.salePrice} onChange={handleChange}
                min="0" step="0.01" className={inputCls} placeholder="Optional" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input type="text" name="brand" value={form.brand} onChange={handleChange} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* ── SEO Meta (optional, collapsible) ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <button
            type="button"
            onClick={() => setShowSeo(s => !s)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">SEO / Meta</h2>
              <p className="text-xs text-gray-400 mt-0.5">Optional — can also be set after creation in the edit page</p>
            </div>
            <span className="text-xs text-indigo-600 font-semibold">{showSeo ? '▲ Hide' : '▼ Show'}</span>
          </button>
          {showSeo && (
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title <span className="ml-1 text-xs font-normal text-gray-400">(leave blank to auto-generate · max 70 chars)</span>
                </label>
                <input type="text" name="metaTitle" value={form.metaTitle} onChange={handleChange}
                  maxLength={70} className={inputCls}
                  placeholder={`${form.name || 'Product name'} | Togor & Tweed Bangladesh`} />
                <p className="mt-0.5 text-xs text-gray-400">{form.metaTitle.length}/70</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description <span className="ml-1 text-xs font-normal text-gray-400">(max 155 chars)</span>
                </label>
                <textarea name="metaDesc" value={form.metaDesc} onChange={handleChange}
                  rows={2} maxLength={155} className={inputCls + ' resize-none'} />
                <p className="mt-0.5 text-xs text-gray-400">{form.metaDesc.length}/155</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Keywords <span className="ml-1 text-xs font-normal text-gray-400">(comma-separated)</span>
                </label>
                <input type="text" name="metaKeywords" value={form.metaKeywords} onChange={handleChange}
                  className={inputCls} placeholder="men's shirt, formal shirt bangladesh, cotton shirt" />
              </div>
            </div>
          )}
        </div>

        {/* ── Size & Colour Variants ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Size &amp; Colour Variants</h2>
              <p className="text-xs text-gray-400 mt-0.5">Each variant defines a purchasable combination. Sizes and colours added here will appear as filter options in the store.</p>
            </div>
            <button type="button" onClick={addBlankRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Row
            </button>
          </div>

          {/* Category size presets */}
          {activeCatSizes.length > 0 && (
            <div className="mt-4 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Category Size Presets
                </p>
                <button type="button" onClick={generateAllSizeRows}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                  <Layers className="h-3.5 w-3.5" />
                  Generate All Sizes
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeCatSizes.map(s => (
                  <button key={s.id} type="button" onClick={() => appendSizeRow(s.label)}
                    className="px-3 py-1.5 border border-gray-300 bg-white text-xs font-semibold text-gray-700
                      hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors rounded-lg">
                    + {s.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-gray-400">
                Click a size to append one row · &ldquo;Generate All Sizes&rdquo; replaces current rows with one per size
              </p>
            </div>
          )}

          {/* Variant rows table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left pb-2 pr-3 font-medium">Size</th>
                  <th className="text-left pb-2 pr-3 font-medium">Colour Name</th>
                  <th className="text-left pb-2 pr-3 font-medium">Hex</th>
                  <th className="text-left pb-2 pr-3 font-medium">SKU <span className="text-red-400">*</span></th>
                  <th className="text-left pb-2 pr-3 font-medium">Price Override</th>
                  <th className="text-left pb-2 pr-3 font-medium">Stock</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {variants.map(row => (
                  <tr key={row._id}>
                    <td className="py-2 pr-3">
                      <input value={row.size} onChange={e => updateVariant(row._id,'size',e.target.value)}
                        className="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        placeholder="M" />
                    </td>
                    <td className="py-2 pr-3">
                      <input value={row.color} onChange={e => updateVariant(row._id,'color',e.target.value)}
                        className="w-28 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        placeholder="Navy" />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={row.colorHex}
                          onChange={e => updateVariant(row._id,'colorHex',e.target.value)}
                          className="h-8 w-10 rounded border border-gray-200 cursor-pointer p-0.5" />
                        <input value={row.colorHex}
                          onChange={e => updateVariant(row._id,'colorHex',e.target.value)}
                          className="w-24 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <input value={row.sku} onChange={e => updateVariant(row._id,'sku',e.target.value)}
                        className="w-40 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        placeholder="SKU-M-NV-001" />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" value={row.price} min="0" step="0.01"
                        onChange={e => updateVariant(row._id,'price',e.target.value)}
                        className="w-24 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        placeholder="Base" />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" value={row.stock} min="0"
                        onChange={e => updateVariant(row._id,'stock',e.target.value)}
                        className="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                    </td>
                    <td className="py-2">
                      <button type="button" onClick={() => setVariants(v => v.filter(x => x._id !== row._id))}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Tip: Leave <strong>Price Override</strong> empty to use the product base price.
            The colour name &amp; size you enter here will automatically appear as filter options on the store.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-10">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <Link href="/admin/products"
            className="px-6 py-2.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
