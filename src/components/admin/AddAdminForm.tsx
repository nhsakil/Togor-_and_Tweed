'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddAdminForm() {
  const router = useRouter()
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'ADMIN',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Failed to create admin')
      } else {
        setSuccess(`Admin account created for ${json.data.email}`)
        setForm({ name: '', email: '', password: '', role: 'ADMIN' })
        setOpen(false)
        router.refresh()
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => { setOpen(true); setSuccess(null); setError(null) }}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          + Add Admin User
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">New Admin Account</h2>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password <span className="text-red-500">*</span></label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            {error && (
              <p className="col-span-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="col-span-2 flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating…' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {success && (
        <p className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">{success}</p>
      )}
    </div>
  )
}
