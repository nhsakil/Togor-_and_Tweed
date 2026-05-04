'use client'

import { useState, useTransition } from 'react'
import { CheckCircle } from 'lucide-react'

interface Props {
  categoryId: string
  initialMetaTitle: string
  initialMetaDesc: string
  initialMetaKeywords: string
  initialOgImageUrl: string
}

export default function CategoryMetaEditor({
  categoryId,
  initialMetaTitle,
  initialMetaDesc,
  initialMetaKeywords,
  initialOgImageUrl,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [metaTitle, setMetaTitle] = useState(initialMetaTitle)
  const [metaDesc, setMetaDesc] = useState(initialMetaDesc)
  const [metaKeywords, setMetaKeywords] = useState(initialMetaKeywords)
  const [ogImageUrl, setOgImageUrl] = useState(initialOgImageUrl)

  function handleSave() {
    setSaved(false)
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/categories/${categoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metaTitle: metaTitle || null,
            metaDesc: metaDesc || null,
            metaKeywords: metaKeywords || null,
            ogImageUrl: ogImageUrl || null,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Failed to save')
        }
        setSaved(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    })
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Meta Tags
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Override the auto-generated title and description shown in Google search results and social shares.
          Leave blank to use the smart defaults.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Meta Title <span className="font-normal text-gray-400 normal-case">(≤70 chars)</span>
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={e => { setMetaTitle(e.target.value); setSaved(false) }}
            maxLength={70}
            className={inputCls}
            placeholder="e.g. Men's Shirts Online Bangladesh | Togor &amp; Tweed"
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-400">Target: 50–60 chars for Google display</p>
            <p className={`text-xs font-medium ${metaTitle.length > 60 ? 'text-amber-500' : 'text-gray-400'}`}>
              {metaTitle.length}/70
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Meta Description <span className="font-normal text-gray-400 normal-case">(≤155 chars)</span>
          </label>
          <textarea
            rows={3}
            value={metaDesc}
            onChange={e => { setMetaDesc(e.target.value); setSaved(false) }}
            maxLength={155}
            className={inputCls + ' resize-none'}
            placeholder="e.g. Shop men's shirts in Bangladesh at Togor & Tweed. Free delivery over ৳1,500. Cash on delivery. Sizes XS–3XL."
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-400">Target: 120–155 chars</p>
            <p className={`text-xs font-medium ${metaDesc.length > 155 ? 'text-red-500' : metaDesc.length > 120 ? 'text-green-600' : 'text-gray-400'}`}>
              {metaDesc.length}/155
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Meta Keywords <span className="font-normal text-gray-400 normal-case">(comma-separated, optional)</span>
          </label>
          <input
            type="text"
            value={metaKeywords}
            onChange={e => { setMetaKeywords(e.target.value); setSaved(false) }}
            className={inputCls}
            placeholder="men's shirts, formal shirt bangladesh, cotton shirt online"
          />
          <p className="text-xs text-gray-400 mt-1">Not used by Google for ranking, but indexed by some search engines.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            OG Image URL <span className="font-normal text-gray-400 normal-case">(1200×630px, optional)</span>
          </label>
          <input
            type="url"
            value={ogImageUrl}
            onChange={e => { setOgImageUrl(e.target.value); setSaved(false) }}
            className={inputCls}
            placeholder="https://res.cloudinary.com/…/image.jpg"
          />
          <p className="text-xs text-gray-400 mt-1">Shown when the category link is shared on Facebook, WhatsApp, etc. Defaults to the category banner image.</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div>
          {saved && !error && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle size={15} /> Saved
            </span>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Saving…' : 'Save Meta Tags'}
        </button>
      </div>
    </div>
  )
}
