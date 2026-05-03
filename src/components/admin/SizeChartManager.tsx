'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Pencil, Ruler } from 'lucide-react'

interface Chart {
  id: string; name: string; description: string | null; columns: string
  createdAt: string
  _count: { rows: number; categories: number; products: number }
}

export default function SizeChartManager() {
  const [charts, setCharts]   = useState<Chart[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string|null>(null)

  // Create form
  const [name, setName]         = useState('')
  const [desc, setDesc]         = useState('')
  const [colsRaw, setColsRaw]   = useState('Size, Chest, Length, Sleeve, Collar')
  const [showForm, setShowForm] = useState(false)
  const [formErr, setFormErr]   = useState('')

  useEffect(() => { loadCharts() }, [])

  async function loadCharts() {
    setLoading(true)
    const res  = await fetch('/api/admin/size-charts')
    const data = await res.json()
    setCharts(data.data ?? [])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormErr('')
    const columns = colsRaw.split(',').map(c => c.trim()).filter(Boolean)
    if (!name.trim()) { setFormErr('Name is required'); return }
    if (columns.length === 0) { setFormErr('At least one column required'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/size-charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: desc || null, columns }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      setName(''); setDesc(''); setColsRaw('Size, Chest, Length, Sleeve, Collar')
      setShowForm(false)
      await loadCharts()
    } catch(err) {
      setFormErr(err instanceof Error ? err.message : 'Failed')
    } finally { setCreating(false) }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm('Delete size chart "' + name + '"? This will unlink it from all categories and products.')) return
    setDeleting(id)
    try {
      await fetch('/api/admin/size-charts/' + id, { method: 'DELETE' })
      setCharts(c => c.filter(x => x.id !== id))
    } finally { setDeleting(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Size Charts</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage size guide tables for products and categories</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Size Chart
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">New Size Chart</h2>
          {formErr && <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formErr}</p>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chart Name *</label>
                <input
                  value={name} onChange={e => setName(e.target.value)} required
                  placeholder="e.g. Shirt Size Chart"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="Optional note"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Columns <span className="font-normal text-gray-400">(comma-separated)</span>
              </label>
              <input
                value={colsRaw} onChange={e => setColsRaw(e.target.value)}
                placeholder="Size, Chest, Length, Sleeve, Collar"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Preview: {colsRaw.split(',').map(c=>c.trim()).filter(Boolean).join(' | ')}</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={creating}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                {creating ? 'Creating...' : 'Create Chart'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Charts list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
        ) : charts.length === 0 ? (
          <div className="py-16 text-center">
            <Ruler className="h-8 w-8 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No size charts yet. Create one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['Name', 'Columns', 'Rows', 'Linked Categories', 'Linked Products', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {charts.map(chart => {
                  const cols = (() => { try { return (JSON.parse(chart.columns) as string[]).join(', ') } catch { return chart.columns } })()
                  const colCount = (() => { try { return (JSON.parse(chart.columns) as string[]).length } catch { return 0 } })()
                  return (
                    <tr key={chart.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {chart.name}
                        {chart.description && <p className="text-xs text-gray-400 mt-0.5">{chart.description}</p>}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs max-w-[200px] truncate" title={cols}>
                        {colCount} cols: {cols}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{chart._count.rows}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          chart._count.categories > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {chart._count.categories}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          chart._count.products > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {chart._count.products}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={'/admin/size-charts/' + chart.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(chart.id, chart.name)}
                            disabled={deleting === chart.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 disabled:opacity-40 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
