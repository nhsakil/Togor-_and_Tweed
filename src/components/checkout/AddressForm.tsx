'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BANGLADESH_DIVISIONS } from '@/lib/constants'
import { toast } from 'sonner'

interface FormData {
  firstName: string
  lastName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
}

const EMPTY: FormData = {
  firstName: '', lastName: '', phone: '',
  line1: '', line2: '', city: '',
  state: '', postalCode: '',
}

export default function AddressForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [loading, setLoading] = useState(false)

  function update(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate(): boolean {
    const errs: Partial<FormData> = {}
    if (!form.firstName.trim()) errs.firstName = 'Required'
    if (!form.lastName.trim()) errs.lastName = 'Required'
    if (!/^(\+?880|0)?1[3-9]\d{8}$/.test(form.phone)) errs.phone = 'Enter a valid BD phone number'
    if (form.line1.length < 5) errs.line1 = 'Enter a full address (min 5 characters)'
    if (!form.city.trim()) errs.city = 'Required'
    if (!form.state) errs.state = 'Select a division'
    if (!/^\d{4}$/.test(form.postalCode)) errs.postalCode = 'Enter a 4-digit postal code'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Store address in sessionStorage and proceed to payment
    sessionStorage.setItem('checkout_address', JSON.stringify(form))
    router.push('/checkout/payment')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {([['firstName', 'First Name'], ['lastName', 'Last Name']] as const).map(([field, label]) => (
          <div key={field}>
            <label htmlFor={field} className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{label}</label>
            <input
              id={field}
              value={form[field]}
              onChange={(e) => update(field, e.target.value)}
              className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold ${errors[field] ? 'border-red-400' : 'border-gray-300'}`}
              aria-invalid={!!errors[field]}
              aria-describedby={errors[field] ? `${field}-error` : undefined}
            />
            {errors[field] && <p id={`${field}-error`} className="text-xs text-red-500 mt-1">{errors[field]}</p>}
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Phone (Bangladesh)</label>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="01XXXXXXXXX"
          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && <p id="phone-error" className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="line1" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Address Line 1</label>
        <input
          id="line1"
          value={form.line1}
          onChange={(e) => update('line1', e.target.value)}
          placeholder="House/flat, road, area"
          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold ${errors.line1 ? 'border-red-400' : 'border-gray-300'}`}
          aria-invalid={!!errors.line1}
          aria-describedby={errors.line1 ? 'line1-error' : undefined}
        />
        {errors.line1 && <p id="line1-error" className="text-xs text-red-500 mt-1">{errors.line1}</p>}
      </div>

      <div>
        <label htmlFor="line2" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Address Line 2 (optional)</label>
        <input
          id="line2"
          value={form.line2}
          onChange={(e) => update('line2', e.target.value)}
          placeholder="Apartment, building, landmark"
          className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">City / Upazila</label>
          <input
            id="city"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold ${errors.city ? 'border-red-400' : 'border-gray-300'}`}
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'city-error' : undefined}
          />
          {errors.city && <p id="city-error" className="text-xs text-red-500 mt-1">{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Postal Code</label>
          <input
            id="postalCode"
            value={form.postalCode}
            onChange={(e) => update('postalCode', e.target.value)}
            placeholder="1200"
            maxLength={4}
            className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold ${errors.postalCode ? 'border-red-400' : 'border-gray-300'}`}
            aria-invalid={!!errors.postalCode}
            aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
          />
          {errors.postalCode && <p id="postalCode-error" className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Division</label>
        <select
          id="state"
          value={form.state}
          onChange={(e) => update('state', e.target.value)}
          className={`w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold bg-white ${errors.state ? 'border-red-400' : 'border-gray-300'}`}
          aria-invalid={!!errors.state}
          aria-describedby={errors.state ? 'state-error' : undefined}
        >
          <option value="">Select division…</option>
          {BANGLADESH_DIVISIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {errors.state && <p id="state-error" className="text-xs text-red-500 mt-1">{errors.state}</p>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-black text-white py-4 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-60"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  )
}
