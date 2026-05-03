'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateProfile } from '@/actions/account'

interface Props {
  user: { id: string; name: string | null; email: string | null; phone: string | null }
}

export default function ProfileForm({ user }: Props) {
  const [name, setName] = useState(user.name ?? '')
  const [phone, setPhone] = useState(user.phone ?? '')
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (phone && !/^(\+?880|0)?1[3-9]\d{8}$/.test(phone)) {
      setPhoneError('Enter a valid Bangladesh phone number')
      return
    }
    setPhoneError('')
    setLoading(true)

    const result = await updateProfile({ name, phone })
    setLoading(false)

    if (result.success) {
      toast.success('Profile updated successfully')
    } else {
      toast.error(result.error ?? 'Failed to update profile')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
          Full Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
          Email Address
        </label>
        <input
          value={user.email ?? ''}
          disabled
          className="w-full border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
          Phone (Bangladesh)
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setPhoneError('') }}
          placeholder="01XXXXXXXXX"
          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold ${phoneError ? 'border-red-400' : 'border-gray-300'}`}
        />
        {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-brand-black text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-60"
      >
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
