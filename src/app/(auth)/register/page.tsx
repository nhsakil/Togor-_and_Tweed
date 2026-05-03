'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.name.length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email.includes('@')) errs.email = 'Enter a valid email'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!terms) errs.terms = 'You must accept the terms'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    setLoading(false)

    if (res.ok) {
      toast.success('Account created! Please sign in.')
      router.push('/login')
    } else {
      const data = await res.json()
      toast.error(data.error ?? 'Failed to create account')
    }
  }

  async function handleGoogle() {
    setGLoading(true)
    await signIn('google', { callbackUrl: '/account' })
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-sm border border-gray-100 p-8">
        <h1 className="font-serif text-2xl text-brand-black mb-1">Create Account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-gold hover:underline">Sign in</Link>
        </p>

        {/* Google sign-up */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={gLoading}
          className="w-full border border-gray-300 text-brand-black py-3 text-sm flex items-center justify-center gap-3 hover:border-brand-black hover:bg-gray-50 transition-colors disabled:opacity-60 mb-5"
        >
          <GoogleIcon />
          {gLoading ? 'Redirecting…' : 'Sign up with Google'}
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', autocomplete: 'name' },
            { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', autocomplete: 'email' },
            { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
            { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
          ].map(({ id, label, type, placeholder, autocomplete }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                {label}
              </label>
              <input
                id={id}
                type={type}
                value={form[id as keyof typeof form]}
                onChange={(e) => update(id, e.target.value)}
                autoComplete={autocomplete}
                placeholder={placeholder}
                className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold ${errors[id] ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
            </div>
          ))}

          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-xs text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-brand-gold hover:underline">Terms & Conditions</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-brand-gold hover:underline">Privacy Policy</Link>
            </label>
          </div>
          {errors.terms && <p className="text-xs text-red-500">{errors.terms}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-black text-white py-3.5 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
