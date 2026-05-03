'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Tag, Megaphone } from 'lucide-react'
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
  type CouponFormData,
} from '@/actions/admin-coupons'

type SerializedCoupon = {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
  minOrderAmount: number | null
  maxDiscount: number | null
  usageLimit: number | null
  usageCount: number
  isActive: boolean
  showOnBanner: boolean
  bannerLabel: string | null
  expiresAt: string | null
  createdAt: string
}

const EMPTY_FORM: CouponFormData = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderAmount: null,
  maxDiscount: null,
  usageLimit: null,
  isActive: true,
  showOnBanner: false,
  bannerLabel: '',
  expiresAt: null,
}

export default function CouponManager({ initialCoupons }: { initialCoupons: SerializedCoupon[] }) {
  const [coupons, setCoupons]        = useState(initialCoupons)
  const [showForm, setShowForm]      = useState(false)
  const [editingId, setEditingId]    = useState<string | null>(null)
  const [form, setForm]              = useState<CouponFormData>(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(c: SerializedCoupon) {
    setEditingId(c.id)
    setForm({
      code:           c.code,
      description:    c.description ?? '',
      discountType:   c.discountType as 'percentage' | 'fixed',
      discountValue:  c.discountValue,
      minOrderAmount: c.minOrderAmount,
      maxDiscount:    c.maxDiscount,
      usageLimit:     c.usageLimit,
      isActive:       c.isActive,
      showOnBanner:   c.showOnBanner,
      bannerLabel:    c.bannerLabel ?? '',
      expiresAt:      c.expiresAt ? c.expiresAt.slice(0, 10) : null,
    })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (editingId) {
          await updateCoupon(editingId, form)
          toast.success('Coupon updated')
        } else {
          await createCoupon(form)
          toast.success('Coupon created')
        }
        setShowForm(false)
        window.location.reload()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to save coupon')
      }
    })
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleCouponActive(id, !current)
      setCoupons((cs) => cs.map((c) => c.id === id ? { ...c, isActive: !current } : c))
      toast.success(!current ? 'Coupon enabled' : 'Coupon disabled')
    })
  }

  function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteCoupon(id)
      setCoupons((cs) => cs.filter((c) => c.id !== id))
      toast.success('Coupon deleted')
    })
  }

  const bannerCoupons = coupons.filter((c) => c.showOnBanner && c.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            {coupons.length} coupon{coupons.length !== 1 ? 's' : ''} &middot; {bannerCoupons.length} on category banner
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </div>

      {/* Banner preview */}
      {bannerCoupons.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5" />
            Category page banner preview
          </p>
          <div className={`grid gap-3 ${bannerCoupons.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {bannerCoupons.map((c) => (
              <div key={c.id} className="bg-black rounded-lg p-4 border border-gray-700 text-center">
                <p className="text-white font-bold text-lg">
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}
                </p>
                {c.bannerLabel && (
                  <p className="text-gray-400 text-xs mt-1">{c.bannerLabel}</p>
                )}
                <div className="mt-3 inline-flex items-center gap-2 bg-gray-800 border border-gray-600 px-3 py-1.5 rounded text-white text-sm font-mono">
                  CODE: {c.code}
                  <span className="text-gray-500 text-xs">⧉</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            {editingId ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Code *</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SAVE20"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Internal Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Internal note"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type *</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as 'percentage' | 'fixed' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Discount Value * {form.discountType === 'percentage' ? '(%)' : '(৳)'}
              </label>
              <input
                required
                type="number"
                min={1}
                max={form.discountType === 'percentage' ? 100 : undefined}
                step="0.01"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Order Amount</label>
              <input
                type="number"
                min={0}
                step="1"
                value={form.minOrderAmount ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value ? Number(e.target.value) : null }))}
                placeholder="No minimum"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {form.discountType === 'percentage' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Max Discount Cap</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={form.maxDiscount ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="No cap"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Usage Limit</label>
              <input
                type="number"
                min={1}
                step="1"
                value={form.usageLimit ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Unlimited"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expiresAt ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value || null }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Banner settings */}
            <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5" />
                Category Banner
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showOnBanner"
                    checked={form.showOnBanner}
                    onChange={(e) => setForm((f) => ({ ...f, showOnBanner: e.target.checked }))}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <label htmlFor="showOnBanner" className="text-sm text-gray-700">
                    Show on category page banner
                  </label>
                </div>
                {form.showOnBanner && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Banner sub-label</label>
                    <input
                      value={form.bannerLabel}
                      onChange={(e) => setForm((f) => ({ ...f, bannerLabel: e.target.value }))}
                      placeholder="e.g. On first order above ৳1,400"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-indigo-600"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible to shoppers)</label>
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {isPending ? 'Saving…' : editingId ? 'Save Changes' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons table */}
      {coupons.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No coupons yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Discount</th>
                  <th className="px-4 py-3 text-left">Min Order</th>
                  <th className="px-4 py-3 text-left">Usage</th>
                  <th className="px-4 py-3 text-left">Banner</th>
                  <th className="px-4 py-3 text-left">Expires</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => {
                  const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {c.code}
                        </span>
                        {c.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}%${c.maxDiscount ? ` (max ৳${c.maxDiscount})` : ''}`
                          : `৳${c.discountValue}`}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.minOrderAmount ? `৳${c.minOrderAmount}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        {c.showOnBanner ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                            <Megaphone className="w-3 h-3" /> On banner
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.expiresAt ? (
                          <span className={isExpired ? 'text-red-500' : 'text-gray-500'}>
                            {new Date(c.expiresAt).toLocaleDateString('en-GB')}
                            {isExpired && ' (expired)'}
                          </span>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(c.id, c.isActive)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          {c.isActive ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-green-500" />
                              <span className="text-green-600 font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-400">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.code)}
                            disabled={isPending}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
