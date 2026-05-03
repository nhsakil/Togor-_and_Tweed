'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

export interface SizeChartData {
  id: string
  name: string
  columns: string[]
  rows: { id: string; values: string[] }[]
}

interface Props { chart: SizeChartData; onClose: () => void }

export default function SizeChartModal({ chart, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Size Chart"
        className="fixed inset-0 z-[201] flex items-center justify-center px-4"
        onClick={onClose}
      >
        <div
          className="relative bg-white w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8e8] flex-shrink-0">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#111]">
              {chart.name}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close size chart"
              className="p-1 text-[#aaa] hover:text-[#111] transition-colors"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1 px-6 py-5">
            {chart.rows.length === 0 ? (
              <p className="text-[13px] text-[#aaa] text-center py-8">No data available</p>
            ) : (
              <table className="w-full text-[12px] text-center border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#111]">
                    {chart.columns.map((col, i) => (
                      <th key={i} className="px-4 py-3 font-bold text-[#111] text-left first:text-left">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row, ri) => (
                    <tr key={row.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa]">
                      {chart.columns.map((_, ci) => (
                        <td key={ci} className="px-4 py-3 text-[#444] text-left first:font-semibold first:text-[#111]">
                          {row.values[ci] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="text-[10px] text-[#bbb] mt-4 text-center uppercase tracking-[0.1em]">
              All measurements are approximate. Sizes may vary slightly.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
