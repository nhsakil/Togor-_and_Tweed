'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)

    if (res.ok) {
      setSent(true)
    } else {
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="font-serif text-2xl text-brand-black mb-2">Check your email</h1>
          <p className="text-sm text-gray-500 mb-6">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
          </p>
          <Link href="/login" className="text-sm text-brand-gold hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-sm border border-gray-100 p-8">
        <h1 className="font-serif text-2xl text-brand-black mb-1">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-black text-white py-3.5 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-brand-gold hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
