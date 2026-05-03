interface Row { size: string; chest: string; length: string; sleeve: string; collar: string }

const SHIRT_CHART: Row[] = [
  { size: 'S',   chest: '40', length: '27',   sleeve: '24',   collar: '15.5' },
  { size: 'M',   chest: '42', length: '28',   sleeve: '24.5', collar: '15.5' },
  { size: 'L',   chest: '44', length: '29',   sleeve: '25',   collar: '16.5' },
  { size: 'XL',  chest: '46', length: '30',   sleeve: '25.5', collar: '16.5' },
  { size: 'XXL', chest: '48', length: '30.5', sleeve: '26',   collar: '17.5' },
  { size: '3XL', chest: '50', length: '31',   sleeve: '26.5', collar: '18'   },
]

const TROUSER_CHART: Row[] = [
  { size: '28', chest: '28', length: '40', sleeve: '—', collar: '—' },
  { size: '30', chest: '30', length: '41', sleeve: '—', collar: '—' },
  { size: '32', chest: '32', length: '42', sleeve: '—', collar: '—' },
  { size: '34', chest: '34', length: '42', sleeve: '—', collar: '—' },
  { size: '36', chest: '36', length: '43', sleeve: '—', collar: '—' },
  { size: '38', chest: '38', length: '43', sleeve: '—', collar: '—' },
]

const CHARTS: Record<string, { label: string; rows: Row[]; cols: (keyof Row)[] }> = {
  shirts:   { label: 'Shirt Size Chart',   rows: SHIRT_CHART,   cols: ['size','chest','length','sleeve','collar'] },
  panjabi:  { label: 'Panjabi Size Chart', rows: SHIRT_CHART,   cols: ['size','chest','length','sleeve','collar'] },
  'polo':   { label: 'Polo Size Chart',    rows: SHIRT_CHART,   cols: ['size','chest','length','sleeve','collar'] },
  't-shirt':{ label: 'T-Shirt Size Chart', rows: SHIRT_CHART,   cols: ['size','chest','length','sleeve','collar'] },
  trousers: { label: 'Trouser Size Chart', rows: TROUSER_CHART, cols: ['size','chest','length'] },
}

const COL_LABELS: Record<keyof Row, string> = {
  size: 'Size', chest: 'Chest', length: 'Length', sleeve: 'Sleeve', collar: 'Collar',
}

export default function SizeChartTable({ categorySlug }: { categorySlug: string }) {
  const chart = CHARTS[categorySlug] ?? CHARTS['shirts']
  return (
    <div className="mt-4">
      <div className="inline-flex border border-[#e0e0e0] mb-0">
        <span className="px-4 py-1.5 text-[11px] font-semibold text-[#333] border-b-2 border-[#333] bg-white">
          {chart.label}
        </span>
      </div>
      <div className="overflow-x-auto border border-[#e0e0e0] border-t-0">
        <table className="w-full text-[12px] text-center border-collapse">
          <thead>
            <tr className="border-b border-[#e0e0e0]">
              {chart.cols.map(col => (
                <th key={col} className="px-4 py-2.5 font-bold text-[#111] border-r border-[#e8e8e8] last:border-r-0">
                  {COL_LABELS[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map(row => (
              <tr key={row.size} className="border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#fafafa]">
                {chart.cols.map(col => (
                  <td key={col} className="px-4 py-2.5 border-r border-[#f0f0f0] last:border-r-0 text-[#444]">
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
