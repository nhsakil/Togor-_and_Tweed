'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Layers } from 'lucide-react'

interface Size     { id: string; label: string; sortOrder: number; isActive: boolean }
interface Category { id: string; name: string; slug: string; sizes: Size[] }

export default function CategorySizeManager() {
  const [cats, setCats]       = useState<Category[]>([])
  const [activeCat, setActiveCat] = useState<string>('')
  const [sizes, setSizes]     = useState<Size[]>([])
  const [loading, setLoading] = useState(true)
  const [addLabel, setAddLabel]   = useState('')
  const [addOrder, setAddOrder]   = useState(0)
  const [adding, setAdding]       = useState(false)
  const [error, setError]         = useState('')
  const [deleting, setDeleting]   = useState<string|null>(null)
  const [editing, setEditing]     = useState<string|null>(null)
  const [editLabel, setEditLabel] = useState('')

  useEffect(() => {
    fetch('/api/admin/category-sizes')
      .then(r => r.json())
      .then(d => {
        const data = d.data as Category[]
        setCats(data)
        if (data.length > 0) { setActiveCat(data[0].id); setSizes(data[0].sizes) }
        setLoading(false)
      })
  }, [])

  function selectCat(id: string) {
    setActiveCat(id)
    const cat = cats.find(c => c.id === id)
    setSizes(cat?.sizes ?? [])
    setAddLabel(''); setAddOrder(sizes.length); setError('')
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!addLabel.trim()) { setError('Label is required'); return }
    setAdding(true)
    try {
      const res = await fetch('/api/admin/category-sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: activeCat, label: addLabel.trim(), sortOrder: addOrder }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setSizes(s => [...s, data.data].sort((a, b) => a.sortOrder - b.sortOrder))
      setCats(c => c.map(cat => cat.id === activeCat
        ? { ...cat, sizes: [...cat.sizes, data.data].sort((a, b) => a.sortOrder - b.sortOrder) }
        : cat
      ))
      setAddLabel(''); setAddOrder(prev => prev + 1)
    } catch(err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally { setAdding(false) }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await fetch('/api/admin/category-sizes/' + id, { method: 'DELETE' })
      setSizes(s => s.filter(x => x.id !== id))
      setCats(c => c.map(cat => cat.id === activeCat
        ? { ...cat, sizes: cat.sizes.filter(s => s.id !== id) }
        : cat
      ))
    } finally { setDeleting(null) }
  }

  async function handleToggleActive(size: Size) {
    const res = await fetch('/api/admin/category-sizes/' + size.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !size.isActive }),
    })
    const data = await res.json()
    if (res.ok) {
      setSizes(s => s.map(x => x.id === size.id ? data.data : x))
    }
  }

  async function startEdit(size: Size) {
    setEditing(size.id); setEditLabel(size.label)
  }

  async function saveEdit(size: Size) {
    if (!editLabel.trim()) { setEditing(null); return }
    const res = await fetch('/api/admin/category-sizes/' + size.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: editLabel.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setSizes(s => s.map(x => x.id === size.id ? data.data : x))
      setCats(c => c.map(cat => cat.id === activeCat
        ? { ...cat, sizes: cat.sizes.map(x => x.id === size.id ? data.data : x) }
        : cat
      ))
    }
    setEditing(null)
  }

  const currentCat = cats.find(c => c.id === activeCat)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Category Sizes</h1>
        <p className="text-gray-500 text-sm mt-1">Define available size presets per category. These appear as quick-select buttons when adding product variants.</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
      ) : cats.length === 0 ? (
        <div className="py-16 text-center">
          <Layers className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No categories found. Create categories first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

          {/* Category list sidebar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</p>
            </div>
            <ul className="divide-y divide-gray-50">
              {cats.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => selectCat(cat.id)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                      activeCat === cat.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className={`flex-shrink-0 ml-2 text-xs px-2 py-0.5 rounded-full ${
                      cat.sizes.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {cat.sizes.length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {currentCat && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">
                    Sizes for <span className="text-indigo-700">{currentCat.name}</span>
                  </h2>

                  {/* Preview */}
                  {sizes.length > 0 && (
                    <div className="mb-5 pb-5 border-b border-gray-100">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Preview on product page</p>
                      <div className="flex gap-2 flex-wrap">
                        {sizes.filter(s => s.isActive).sort((a,b) => a.sortOrder - b.sortOrder).map(s => (
                          <span key={s.id}
                            className="border border-[#e8e8e8] px-4 py-2 text-sm text-[#111] min-w-[44px] text-center">
                            {s.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes table */}
                  {error && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                  {sizes.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">No sizes defined yet. Add one below.</p>
                  ) : (
                    <div className="overflow-x-auto mb-5">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="text-left pb-2 pr-3 font-medium w-8"></th>
                            <th className="text-left pb-2 pr-3 font-medium">Label</th>
                            <th className="text-left pb-2 pr-3 font-medium">Order</th>
                            <th className="text-left pb-2 pr-3 font-medium">Status</th>
                            <th className="pb-2 font-medium"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {sizes.sort((a,b) => a.sortOrder - b.sortOrder).map(size => (
                            <tr key={size.id} className="hover:bg-gray-50">
                              <td className="py-2.5 pr-3 text-gray-300">
                                <GripVertical className="h-4 w-4" />
                              </td>
                              <td className="py-2.5 pr-3 font-medium text-gray-900">
                                {editing === size.id ? (
                                  <input
                                    value={editLabel}
                                    onChange={e => setEditLabel(e.target.value)}
                                    onBlur={() => saveEdit(size)}
                                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(size); if (e.key === 'Escape') setEditing(null) }}
                                    autoFocus
                                    className="w-24 px-2 py-1 border border-indigo-300 rounded text-sm focus:outline-none"
                                  />
                                ) : (
                                  <button onClick={() => startEdit(size)} className="font-mono hover:text-indigo-600">
                                    {size.label}
                                  </button>
                                )}
                              </td>
                              <td className="py-2.5 pr-3 text-gray-500 text-xs">{size.sortOrder}</td>
                              <td className="py-2.5 pr-3">
                                <button onClick={() => handleToggleActive(size)}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                    size.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}>
                                  {size.isActive ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="py-2.5">
                                <button onClick={() => handleDelete(size.id)} disabled={deleting === size.id}
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

                  {/* Add size form */}
                  <form onSubmit={handleAdd} className="flex items-end gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Size Label</label>
                      <input
                        value={addLabel} onChange={e => setAddLabel(e.target.value)}
                        placeholder="e.g. S, M, L, 32, XL"
                        className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                      <input
                        type="number" value={addOrder} onChange={e => setAddOrder(Number(e.target.value))}
                        min="0"
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button type="submit" disabled={adding}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                      <Plus className="h-4 w-4" />
                      {adding ? 'Adding...' : 'Add Size'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
