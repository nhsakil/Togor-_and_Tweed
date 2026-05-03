import ProductAccordion from './ProductAccordion'
import SizeChartTable from './SizeChartTable'

export interface DynSizeChart {
  id: string; name: string
  columns: string[]
  rows: { id: string; values: string[] }[]
}

interface Props {
  description: string | null
  categorySlug: string
  sizeChart?: DynSizeChart | null
}

export default function DescriptionAccordion({ description, categorySlug, sizeChart }: Props) {
  return (
    <ProductAccordion title="Details" defaultOpen={false}>
      {description && (
        <p className="text-[13px] text-[#444] leading-relaxed mb-4">{description}</p>
      )}
      {sizeChart ? (
        <div className="mt-4">
          <div className="inline-flex border border-[#e0e0e0] mb-0">
            <span className="px-4 py-1.5 text-[11px] font-semibold text-[#333] border-b-2 border-[#333] bg-white">
              {sizeChart.name}
            </span>
          </div>
          <div className="overflow-x-auto border border-[#e0e0e0] border-t-0">
            <table className="w-full text-[12px] text-center border-collapse">
              <thead>
                <tr className="border-b border-[#e0e0e0]">
                  {sizeChart.columns.map((col, i) => (
                    <th key={i} className="px-4 py-2.5 font-bold text-[#111] border-r border-[#e8e8e8] last:border-r-0">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeChart.rows.map(row => (
                  <tr key={row.id} className="border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#fafafa]">
                    {sizeChart.columns.map((_, ci) => (
                      <td key={ci} className="px-4 py-2.5 border-r border-[#f0f0f0] last:border-r-0 text-[#444]">
                        {row.values[ci] ?? '\u2014'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <SizeChartTable categorySlug={categorySlug} />
      )}
    </ProductAccordion>
  )
}
