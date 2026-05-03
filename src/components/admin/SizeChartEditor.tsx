'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'

interface ChartRow { id?: string; values: string[] }
interface Category  { id: string; name: string; slug: string }
interface LinkedCat { id: string; name: string; slug: string }
interface ChartData {
  id: string; name: string; description: string | null; columns: string
  rows: { id: string; sortOrder: number; values: string }[]
  categories: LinkedCat[]
  products: { id: string; name: string; slug: string }[]
}

export default function SizeChartEditor({ chartId }: { chartId: string }) {
  const router = useRouter()

  const [name, setName]         = useState('')
  const [desc, setDesc]         = useState('')
  const [columns, setColumns]   = useState<string[]>([])
  const [rows, setRows]         = useState<ChartRow[]>([])
  const [allCats, setAllCats]   = useState<Category[]>([])
  const [linkedCatIds, setLinkedCatIds] = useState<Set<string>>(new Set())
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [chartRes, catRes] = await Promise.all([
      fetch('/api/admin/size-charts/' + chartId).then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ])
    const chart = chartRes.data as ChartData
    const cats  = catRes.data as Category[]

    setName(chart.name)
    setDesc(chart.description ?? '')
    const cols = (() => { try { return JSON.parse(chart.columns) as string[] } catch { return [] } })()
    setColumns(cols)
    setRows(chart.rows.map(r => ({
      id: r.id,
      values: (() => { try { return JSON.parse(r.values) as string[] } catch { return [] } })(),
    })))
    setAllCats(cats)
    setLinkedCatIds(new Set(chart.categories.map(c => c.id)))
    setLoading(false)
  }, [chartId])

  useEffect(() => { load() }, [load])

  function addColumn() {
    const newCol = 'Column ' + (columns.length + 1)
    setColumns(c => [...c, newCol])
    setRows(r => r.map(row => ({ ...row, values: [...row.values, ''] })))
  }

  function removeColumn(i: number) {
    if (columns.length <= 1) return
    setColumns(c => c.filter((_, ci) => ci !== i))
    setRows(r => r.map(row => ({ ...row, values: row.values.filter((_, vi) => vi !== i) })))
  }

  function updateColumn(i: number, val: string) {
    setColumns(c => c.map((col, ci) => ci === i ? val : col))
  }

  function addRow() {
    setRows(r => [...r, { values: columns.map(() => '') }])
  }

  function removeRow(i: number) {
    setRows(r => r.filter((_, ri) => ri !== i))
  }

  function updateCell(rowI: number, colI: number, val: string) {
    setRows(r => r.map((row, ri) => ri === rowI
      ? { ...row, values: row.values.map((v, vi) => vi === colI ? val : v) }
      : row
    ))
  }

  function toggleCat(id: string) {
    setLinkedCatIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function handleSave() {
    setError(''); setSaving(true); setSaved(false)
    try {
      const res = await fetch('/api/admin/size-charts/' + chartId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: desc || null,
          columns,
          rows: rows.map(r => ({ values: r.values })),
          categoryIds: Array.from(linkedCatIds),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Save failed') }
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch(err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const inputCls = 'w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400'

  if (loading) return <div className="py-20 text-center text-gray-400 text-sm">Loading...</div>

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/size-charts" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Size Charts
        </Link>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Size Chart</h1>
          <p className="text-gray-500 text-sm mt-1">Update columns, rows, and category links</p>
        </div>
        <button
          onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {saved && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Changes saved successfully</div>}

      {/* Name + Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Chart Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Table editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Size Table</h2>
          <div className="flex items-center gap-2">
            <button onClick={addColumn}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
              <Plus className="h-3 w-3" /> Add Column
            </button>
            <button onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">
              <Plus className="h-3 w-3" /> Add Row
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((col, ci) => (
                  <th key={ci} className="border border-gray-200 p-0">
                    <div className="flex items-center gap-1 p-1.5">
                      <input
                        value={col}
                        onChange={e => updateColumn(ci, e.target.value)}
                        className="flex-1 min-w-[80px] px-2 py-1 text-xs font-semibold text-gray-700 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-indigo-300 rounded"
                      />
                      {columns.length > 1 && (
                        <button onClick={() => removeColumn(ci)}
                          className="flex-shrink-0 p-0.5 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="border border-gray-200 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="border border-gray-100 py-8 text-center text-gray-400 text-xs">
                    No rows yet. Click "Add Row" to start.
                  </td>
                </tr>
              ) : rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50">
                  {columns.map((_, ci) => (
                    <td key={ci} className="border border-gray-100 p-0">
                      <input
                        value={row.values[ci] ?? ''}
                        onChange={e => updateCell(ri, ci, e.target.value)}
                        className="w-full px-3 py-2 text-sm focus:outline-none focus:bg-indigo-50 bg-transparent"
                        placeholder="—"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-100 text-center">
                    <button onClick={() => removeRow(ri)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && columns.length > 0 && (
          <button onClick={addRow}
            className="mt-4 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs font-medium text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
            + Add first row
          </button>
        )}
      </div>

      {/* Category links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Link to Categories</h2>
        <p className="text-xs text-gray-400 mb-4">This chart will be shown as the default size guide for selected categories</p>
        {allCats.length === 0 ? (
          <p className="text-sm text-gray-400">No categories found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {allCats.map(cat => (
              <label key={cat.id}
                className="flex items-center gap-2.5 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50">
                <input
                  type="checkbox"
                  checked={linkedCatIds.has(cat.id)}
                  onChange={() => toggleCat(cat.id)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-gray-700 truncate">{cat.name}</span>
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">
          {linkedCatIds.size} {linkedCatIds.size === 1 ? 'category' : 'categories'} linked
        </p>
      </div>
    </div>
  )
}
