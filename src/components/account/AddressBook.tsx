'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { saveAddress, deleteAddress } from '@/actions/account'
import { BANGLADESH_DIVISIONS } from '@/lib/constants'
import { Pencil, Trash2, Plus, MapPin } from 'lucide-react'
import type { Address } from '@prisma/client'

interface Props {
  initialAddresses: Address[]
}

interface FormData {
  firstName: string; lastName: string; phone: string
  line1: string; line2: string; city: string
  state: string; postalCode: string; isDefault: boolean
}

const EMPTY: FormData = {
  firstName: '', lastName: '', phone: '',
  line1: '', line2: '', city: '',
  state: '', postalCode: '', isDefault: false,
}

export default function AddressBook({ initialAddresses }: Props) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [loading, setLoading] = useState(false)

  function openNew() {
    setForm(EMPTY)
    setEditId(null)
    setErrors({})
    setShowForm(true)
  }

  function openEdit(addr: Address) {
    setForm({
      firstName: addr.firstName, lastName: addr.lastName,
      phone: addr.phone ?? '', line1: addr.line1,
      line2: addr.line2 ?? '', city: addr.city,
      state: addr.state, postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    })
    setEditId(addr.id)
    setErrors({})
    setShowForm(true)
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {}
    if (!form.firstName.trim()) errs.firstName = 'Required'
    if (!form.lastName.trim()) errs.lastName = 'Required'
    if (form.phone && !/^(\+?880|0)?1[3-9]\d{8}$/.test(form.phone)) errs.phone = 'Invalid BD number'
    if (form.line1.length < 5) errs.line1 = 'Min 5 characters'
    if (!form.city.trim()) errs.city = 'Required'
    if (!form.state) errs.state = 'Select a division'
    if (!/^\d{4}$/.test(form.postalCode)) errs.postalCode = '4-digit code required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const result = await saveAddress({ id: editId ?? undefined, ...form })
    setLoading(false)

    if (result.success) {
      toast.success(editId ? 'Address updated' : 'Address saved')
      setShowForm(false)
      // Refetch via page reload — simplest approach for server data
      window.location.reload()
    } else {
      toast.error(result.error ?? 'Failed to save address')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this address?')) return
    const result = await deleteAddress(id)
    if (result.success) {
      setAddresses((a) => a.filter((addr) => addr.id !== id))
      toast.success('Address deleted')
    } else {
      toast.error('Failed to delete address')
    }
  }

  function field(key: keyof FormData) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }))
        setErrors((er) => ({ ...er, [key]: '' }))
      },
      className: `w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold ${errors[key] ? 'border-red-400' : 'border-gray-300'}`,
    }
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="mx-auto text-gray-300 mb-3" size={40} strokeWidth={1} />
          <p className="text-sm">No saved addresses yet.</p>
        </div>
      )}

      {/* Saved addresses list */}
      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-gray-200 p-4 relative">
              {addr.isDefault && (
                <span className="absolute top-3 right-3 text-xs bg-brand-gold/20 text-brand-gold px-2 py-0.5 font-medium">
                  Default
                </span>
              )}
              <address className="not-italic text-sm text-gray-700 leading-relaxed mb-3">
                <strong>{addr.firstName} {addr.lastName}</strong>
                <br />{addr.phone}
                <br />{addr.line1}
                {addr.line2 && <>, {addr.line2}</>}
                <br />{addr.city}, {addr.postalCode}
                <br />{addr.state}, Bangladesh
              </address>
              <div className="flex gap-3">
                <button
                  onClick={() => openEdit(addr)}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-brand-black"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm && (
        <button
          onClick={openNew}
          className="flex items-center gap-2 border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-brand-gold hover:text-brand-gold transition-colors w-full sm:w-auto"
        >
          <Plus size={16} /> Add New Address
        </button>
      )}

      {/* Address form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 p-5 max-w-lg space-y-4">
          <h3 className="font-medium">{editId ? 'Edit Address' : 'New Address'}</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-xs">First Name</label>
              <input {...field('firstName')} />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="label-xs">Last Name</label>
              <input {...field('lastName')} />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="label-xs">Phone</label>
            <input type="tel" placeholder="01XXXXXXXXX" {...field('phone')} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="label-xs">Address Line 1</label>
            <input placeholder="House/flat, road, area" {...field('line1')} />
            {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
          </div>

          <div>
            <label className="label-xs">Address Line 2 (optional)</label>
            <input placeholder="Landmark, building" {...field('line2')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-xs">City / Upazila</label>
              <input {...field('city')} />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="label-xs">Postal Code</label>
              <input placeholder="1200" maxLength={4} {...field('postalCode')} />
              {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
            </div>
          </div>

          <div>
            <label className="label-xs">Division</label>
            <select {...field('state')} className={`w-full border px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-brand-gold ${errors.state ? 'border-red-400' : 'border-gray-300'}`}>
              <option value="">Select division…</option>
              {BANGLADESH_DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="accent-brand-black"
            />
            Set as default address
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-300 py-3 text-sm uppercase tracking-widest hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-brand-black text-white py-3 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save Address'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
