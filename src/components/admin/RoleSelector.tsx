'use client'

import { useState } from 'react'

interface Props {
  userId: string
  currentRole: string
  myId: string
}

const ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'] as const

export default function RoleSelector({ userId, currentRole, myId }: Props) {
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isSelf = userId === myId

  async function handleChange(newRole: string) {
    if (newRole === role) return
    if (isSelf && newRole !== 'SUPER_ADMIN') {
      setMessage({ type: 'error', text: 'Cannot change your own role' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      const json = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: json.error ?? 'Failed to update role' })
      } else {
        setRole(newRole)
        setMessage({ type: 'success', text: 'Role updated' })
        setTimeout(() => setMessage(null), 2000)
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={role}
        disabled={loading || isSelf}
        onChange={(e) => handleChange(e.target.value)}
        className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r.replace('_', ' ')}
          </option>
        ))}
      </select>

      {loading && (
        <span className="text-xs text-gray-400">Saving…</span>
      )}

      {message && !loading && (
        <span className={`text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {message.text}
        </span>
      )}

      {isSelf && (
        <span className="text-xs text-gray-400">You</span>
      )}
    </div>
  )
}
