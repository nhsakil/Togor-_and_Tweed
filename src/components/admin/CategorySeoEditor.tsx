'use client'

import { useState, useTransition } from 'react'
import { saveCategorySeo, type SeoSection } from '@/actions/admin-category-seo'
import { Plus, Trash2, GripVertical, CheckCircle } from 'lucide-react'

interface Props {
  categoryId: string
  categoryName: string
  initialSections: SeoSection[]
}

export default function CategorySeoEditor({ categoryId, categoryName, initialSections }: Props) {
  const [sections, setSections] = useState<SeoSection[]>(
    initialSections.length > 0 ? initialSections : [{ heading: '', body: '' }]
  )
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function addSection() {
    setSections((prev) => [...prev, { heading: '', body: '' }])
    setSaved(false)
  }

  function removeSection(idx: number) {
    setSections((prev) => prev.filter((_, i) => i !== idx))
    setSaved(false)
  }

  function updateSection(idx: number, field: 'heading' | 'body', value: string) {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)))
    setSaved(false)
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    setSections((prev) => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
    setSaved(false)
  }

  function moveDown(idx: number) {
    setSections((prev) => {
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
    setSaved(false)
  }

  function handleSave() {
    const cleaned = sections.filter((s) => s.heading.trim() || s.body.trim())
    setSaveError(null)
    startTransition(async () => {
      const result = await saveCategorySeo(categoryId, cleaned)
      if (result.ok) {
        setSaved(true)
      } else {
        setSaveError(result.error ?? 'Unknown error')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Preview note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        These sections appear as expandable text blocks below the product grid on the{' '}
        <strong>{categoryName}</strong> collection page. Write naturally about the category,
        styling tips, and why to shop here — good for SEO.
      </div>

      {/* Section list */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            {/* Section header bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-gray-300">
                <GripVertical size={16} />
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-1">
                Section {idx + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="text-xs px-2 py-1 rounded text-gray-500 hover:text-gray-900 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === sections.length - 1}
                  className="text-xs px-2 py-1 rounded text-gray-500 hover:text-gray-900 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(idx)}
                  disabled={sections.length === 1}
                  className="ml-1 p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors"
                  title="Remove section"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Heading
                </label>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => updateSection(idx, 'heading', e.target.value)}
                  placeholder={`e.g. Buy ${categoryName} Online in Bangladesh`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Body Text
                </label>
                <textarea
                  rows={5}
                  value={section.body}
                  onChange={(e) => updateSection(idx, 'body', e.target.value)}
                  placeholder="Write 2-4 sentences. To add a link: [link text](https://example.com)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-y font-mono"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">
                    Add links with{' '}
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px] text-indigo-600 font-mono">
                      [link text](https://url.com)
                    </code>
                  </p>
                  <p className="text-xs text-gray-400">{section.body.length} chars</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add section button */}
      <button
        type="button"
        onClick={addSection}
        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-lg border border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors w-full justify-center"
      >
        <Plus size={15} />
        Add Section
      </button>

      {/* Save row */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {saved && !saveError && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle size={15} />
              Saved successfully
            </span>
          )}
          {saveError && (
            <span className="text-sm text-red-600 max-w-sm leading-snug">{saveError}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Saving...' : 'Save SEO Content'}
        </button>
      </div>
    </div>
  )
}
