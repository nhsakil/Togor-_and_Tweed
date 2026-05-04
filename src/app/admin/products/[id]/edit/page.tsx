'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Layers } from 'lucide-react'
import ImageManager from '@/components/admin/ImageManager'

interface Category  { id: string; name: string; slug: string }
interface SizeChart { id: string; name: string }
interface CatSize   { id: string; label: string; sortOrder: number; isActive: boolean }
interface Variant {
  id: string; sku: string; size: string | null; color: string | null
  colorHex: string | null; price: string | null; salePrice: string | null
  stock: number; isActive: boolean
}
interface NewVariantRow {
  _id: string; size: string; color: string; colorHex: string
  sku: string; price: string; stock: string
}

function makeId() { return Math.random().toString(36).slice(2, 9) }
function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim()
}
function autoSku(name: string, size: string, color: string) {
  const n = name.slice(0,6).toUpperCase().replace(/\s+/g,'-')
  const s = size.slice(0,4).toUpperCase()
  const c = color.slice(0,3).toUpperCase()
  const r = Math.floor(Math.random()*900+100)
  return [n, s, c, r].filter(Boolean).join('-')
}

export default function EditProductPage() {
  const router  = useRouter()
  const params  = useParams()
  const id      = params.id as string

  const [categories,  setCategories]  = useState<Category[]>([])
  const [sizeCharts,  setSizeCharts]  = useState<SizeChart[]>([])
  const [catSizes,    setCatSizes]    = useState<CatSize[]>([])
  const [loading,     setLoading]     = useState(false)
  const [fetching,    setFetching]    = useState(true)
  const [error,       setError]       = useState('')
  const [saved,       setSaved]       = useState(false)
  const [deletingId,  setDeletingId]  = useState<string|null>(null)
  const [existingVariants, setExistingVariants] = useState<Variant[]>([])
  const [newRows,     setNewRows]     = useState<NewVariantRow[]>([])

  const [form, setForm] = useState({
    name:'', slug:'', description:'', categoryId:'',
    basePrice:'', salePrice:'', brand:'', sizeChartId:'',
    isFeatured: false, isActive: true,
    metaTitle:'', metaDesc:'', metaKeywords:'',
  })

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
      fetch('/api/admin/products/' + id).then(r => r.json()),
    ]).then(([catData, chartData, productData]) => {
      setCategories(catData.data ?? [])
      setSizeCharts(chartData.data ?? [])
      const p = productData.data
      if (p) {
        const catId = p.categoryId ?? ''
        setForm({
          name: p.name ?? '', slug: p.slug ?? '',
          description: p.description ?? '', categoryId: catId,
          basePrice: p.basePrice?.toString() ?? '',
          salePrice: p.salePrice?.toString() ?? '',
          brand: p.brand ?? '', sizeChartId: p.sizeChartId ?? '',
          isFeatured: p.isFeatured ?? false, isActive: p.isActive ?? true,
          metaTitle: p.metaTitle ?? '', metaDesc: p.metaDesc ?? '',
          metaKeywords: p.metaKeywords ?? '',
        })
        setExistingVariants(p.variants ?? [])
        if (catId) loadCatSizes(catId)
      }
    }).catch(console.error).finally(() => setFetching(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    setForm(p => {
      const next = { ...p, [name]: type === 'checkbox' ? checked : value }
      if (name === 'categoryId') loadCatSizes(value)
      if (name === 'name' && !p.slug) next.slug = slugify(value)
      return next
    })
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/admin/products/' + id, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, slug: form.slug, description: form.description || null,
          categoryId: form.categoryId, basePrice: parseFloat(form.basePrice),
          salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
          brand: form.brand || null, sizeChartId: form.sizeChartId || null,
          isFeatured: form.isFeatured, isActive: form.isActive,
          metaTitle: form.metaTitle || null,
          metaDesc: form.metaDesc || null,
          metaKeywords: form.metaKeywords || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch(err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setLoading(false) }
  }

  async function deleteVariant(vid: string) {
    if (!confirm('Delete this variant?')) return
    setDeletingId(vid)
    try {
      const res = await fetch('/api/admin/variants/' + vid, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setExistingVariants(v => v.filter(r => r.id !== vid))
    } catch(err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally { setDeletingId(null) }
  }

  async function addVariants() {
    const missing = newRows.filter(r => !r.sku.trim())
    if (missing.length) { setError('All new variants need a SKU'); return }
    setError(''); setLoading(true)
    try {
      const results = await Promise.all(newRows.map(row =>
        fetch('/api/admin/products/' + id + '/variants', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: row.sku, size: row.size || null, color: row.color || null,
            colorHex: row.colorHex || null, price: row.price || null, stock: row.stock || '0',
          }),
        }).then(r => r.json())
      ))
      const added = results.filter(r => r.data).map(r => r.data as Variant)
      setExistingVariants(v => [...v, ...added])
      setNewRows([])
    } catch(err) {
      setError(err instanceof Error ? err.message : 'Failed to add variants')
    } finally { setLoading(false) }
  }

  /** Append a single blank row pre-filled with a size label */
  function appendSizeRow(label: string) {
    setNewRows(r => [...r, {
      _id: makeId(), size: label, color: '', colorHex: '#000000',
      sku: autoSku(form.name, label, ''), price: '', stock: '10',
    }])
  }

  /** Generate one row for every active category size */
  function generateAllSizeRows() {
    const active = catSizes.filter(s => s.isActive)
    if (!active.length) return
    setNewRows(active.map(s => ({
      _id: makeId(), size: s.label, color: '', colorHex: '#000000',
      sku: autoSku(form.name, s.label, ''), price: '', stock: '10',
    })))
  }

  function updateRow(rowId: string, field: keyof Omit<NewVariantRow,'_id'>, val: string) {
    setNewRows(r => r.map(x => x._id === rowId ? { ...x, [field]: val } : x))
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  if (fetching) return <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading...</div>

  const activeCatSizes = catSizes.filter(s => s.isActive)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-500 text-sm mt-1">Update product details, size chart, and variants</p>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {saved && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Saved successfully</div>}

      {/* ── Product Details ── */}
      <form onSubmit={handleSaveDetails} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input type="text" name="slug" value={form.slug} onChange={handleChange} required className={inputCls + ' font-mono'} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputCls + ' resize-none'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required className={inputCls + ' bg-white'}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size Chart
              <span className="ml-1 font-normal text-gray-400 text-xs">(overrides category default)</span>
            </label>
            <select name="sizeChartId" value={form.sizeChartId} onChange={handleChange} className={inputCls + ' bg-white'}>
              <option value="">— Use category default —</option>
              {sizeCharts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {form.sizeChartId && (
              <p className="mt-1 text-xs text-indigo-600">
                ✓ This chart will appear inline in the product description
              </p>
            )}
            {!form.sizeChartId && form.categoryId && (
              <p className="mt-1 text-xs text-gray-400">
                Will use the category&apos;s default size chart if one is linked
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input type="text" name="brand" value={form.brand} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (BDT)</label>
            <input type="number" name="basePrice" value={form.basePrice} onChange={handleChange} required min="0" step="0.01" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (BDT)</label>
            <input type="number" name="salePrice" value={form.salePrice} onChange={handleChange} min="0" step="0.01" className={inputCls} placeholder="Leave blank for no sale" />
          </div>
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* ── SEO Fields ── */}
        <div className="pt-5 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">SEO / Meta</p>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
                <span className="ml-2 text-xs font-normal text-gray-400">(leave blank to auto-generate)</span>
              </label>
              <input type="text" name="metaTitle" value={form.metaTitle} onChange={handleChange}
                maxLength={70} placeholder={`${form.name} | Togor & Tweed Bangladesh`}
                className={inputCls} />
              <p className="mt-1 text-xs text-gray-400">{form.metaTitle.length}/70 chars</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
                <span className="ml-2 text-xs font-normal text-gray-400">(leave blank to auto-generate)</span>
              </label>
              <textarea name="metaDesc" value={form.metaDesc} onChange={handleChange}
                rows={2} maxLength={155} placeholder="Shop …"
                className={inputCls + ' resize-none'} />
              <p className="mt-1 text-xs text-gray-400">{form.metaDesc.length}/155 chars</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Keywords
                <span className="ml-2 text-xs font-normal text-gray-400">(comma-separated, optional)</span>
              </label>
              <input type="text" name="metaKeywords" value={form.metaKeywords} onChange={handleChange}
                placeholder="men's shirt, formal shirt bangladesh, cotton shirt"
                className={inputCls} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
          {loading ? 'Saving...' : 'Save Details'}
        </button>
      </form>

      {/* ── Images ── */}
      <ImageManager productId={id} />

      {/* ── Variants ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Variants</h2>

        {/* Existing variants table */}
        {existingVariants.length > 0 && (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  {['SKU','Size','Colour','Price','Stock','Status',''].map(h => (
                    <th key={h} className="text-left pb-2 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {existingVariants.map(v => (
                  <tr key={v.id} className="text-sm">
                    <td className="py-2.5 pr-3 font-mono text-xs text-gray-600">{v.sku}</td>
                    <td className="py-2.5 pr-3">{v.size ?? '—'}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        {v.colorHex && (
                          <span className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                            style={{ backgroundColor: v.colorHex }} />
                        )}
                        {v.color ?? '—'}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">{v.price ? '৳' + v.price : 'Base'}</td>
                    <td className="py-2.5 pr-3">{v.stock}</td>
                    <td className="py-2.5 pr-3">
                      <span className={'inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ' +
                        (v.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500')}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <button onClick={() => deleteVariant(v.id)} disabled={deletingId === v.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Add new variants ── */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Add New Variants</p>
            <button type="button"
              onClick={() => setNewRows(r => [...r, {
                _id: makeId(), size: '', color: '', colorHex: '#000000',
                sku: autoSku(form.name, '', ''), price: '', stock: '10',
              }])}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Row
            </button>
          </div>

          {/* ── Category size presets ── */}
          {activeCatSizes.length > 0 && (
            <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Category Size Presets
                </p>
                <button
                  type="button"
                  onClick={generateAllSizeRows}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Generate All Sizes
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeCatSizes.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => appendSizeRow(s.label)}
                    className="px-3 py-1.5 border border-gray-300 bg-white text-xs font-semibold text-gray-700
                      hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors rounded-lg"
                  >
                    + {s.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-gray-400">
                Click a size to append one row · "Generate All Sizes" creates a row for every size at once
              </p>
            </div>
          )}

          {/* New rows table */}
          {newRows.length > 0 && (
            <>
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                      {['Size','Colour','Hex','SKU *','Price (BDT)','Stock',''].map(h => (
                        <th key={h} className="text-left pb-2 pr-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {newRows.map(row => (
                      <tr key={row._id}>
                        <td className="py-2 pr-3">
                          <input value={row.size}
                            onChange={e => updateRow(row._id, 'size', e.target.value)}
                            className="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="M" />
                        </td>
                        <td className="py-2 pr-3">
                          <input value={row.color}
                            onChange={e => updateRow(row._id, 'color', e.target.value)}
                            className="w-28 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="Navy" />
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-1.5">
                            <input type="color" value={row.colorHex}
                              onChange={e => updateRow(row._id, 'colorHex', e.target.value)}
                              className="h-8 w-10 rounded border border-gray-200 p-0.5 cursor-pointer" />
                            <input value={row.colorHex}
                              onChange={e => updateRow(row._id, 'colorHex', e.target.value)}
                              className="w-24 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                          </div>
                        </td>
                        <td className="py-2 pr-3">
                          <input value={row.sku}
                            onChange={e => updateRow(row._id, 'sku', e.target.value)}
                            className="w-40 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="SKU-M-NV-001" />
                        </td>
                        <td className="py-2 pr-3">
                          <input type="number" value={row.price} min="0" step="0.01"
                            onChange={e => updateRow(row._id, 'price', e.target.value)}
                            className="w-24 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="Base" />
                        </td>
                        <td className="py-2 pr-3">
                          <input type="number" value={row.stock} min="0"
                            onChange={e => updateRow(row._id, 'stock', e.target.value)}
                            className="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                        </td>
                        <td className="py-2">
                          <button onClick={() => setNewRows(r => r.filter(x => x._id !== row._id))}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={addVariants} disabled={loading}
                  className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                  {loading ? 'Adding...' : `Add ${newRows.length} Variant${newRows.length !== 1 ? 's' : ''}`}
                </button>
                <button type="button" onClick={() => setNewRows([])}
                  className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                  Clear
                </button>
              </div>
            </>
          )}

          {newRows.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Click "Add Row" to add a single variant, or use the category size presets above.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pb-10">
        <Link href="/admin/products"
          className="px-6 py-2.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
          Done
        </Link>
      </div>
    </div>
  )
}
