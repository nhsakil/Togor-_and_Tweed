import type { Metadata } from 'next'

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

export const metadata: Metadata = {
  title: "Men's Clothing Size Guide Bangladesh — Togor & Tweed",
  description: "Find your perfect fit with Togor & Tweed's size guide for shirts, panjabi, t-shirts, polo, and trousers. Chest, shoulder, and waist measurements for Bangladesh sizes XS–3XL.",
  alternates: { canonical: `${SITE_URL}/size-guide` },
  openGraph: {
    title: "Size Guide — Togor & Tweed Bangladesh",
    description: 'Chest, shoulder, and length measurements for all Togor & Tweed clothing. Find your perfect size before you buy.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Size Guide — Togor & Tweed Bangladesh",
    description: 'Chest, shoulder, and length measurements for shirts, panjabi, t-shirts, polo, and trousers.',
  },
}

const TOPS_SIZES = [
  { size: 'XS',  chest: '34–36', shoulder: '16.5', length: '27' },
  { size: 'S',   chest: '36–38', shoulder: '17',   length: '28' },
  { size: 'M',   chest: '38–40', shoulder: '17.5', length: '28.5' },
  { size: 'L',   chest: '40–42', shoulder: '18',   length: '29' },
  { size: 'XL',  chest: '42–44', shoulder: '18.5', length: '29.5' },
  { size: 'XXL', chest: '44–46', shoulder: '19',   length: '30' },
  { size: '3XL', chest: '46–48', shoulder: '19.5', length: '30.5' },
]

const PANJABI_SIZES = [
  { size: 'XS',  chest: '34–36', shoulder: '16.5', length: '43' },
  { size: 'S',   chest: '36–38', shoulder: '17',   length: '44' },
  { size: 'M',   chest: '38–40', shoulder: '17.5', length: '44.5' },
  { size: 'L',   chest: '40–42', shoulder: '18',   length: '45' },
  { size: 'XL',  chest: '42–44', shoulder: '18.5', length: '45.5' },
  { size: 'XXL', chest: '44–46', shoulder: '19',   length: '46' },
  { size: '3XL', chest: '46–48', shoulder: '19.5', length: '46.5' },
]

const TROUSERS_SIZES = [
  { size: 'XS',  waist: '28–30', hip: '34–36', inseam: '29' },
  { size: 'S',   waist: '30–32', hip: '36–38', inseam: '29.5' },
  { size: 'M',   waist: '32–34', hip: '38–40', inseam: '30' },
  { size: 'L',   waist: '34–36', hip: '40–42', inseam: '30.5' },
  { size: 'XL',  waist: '36–38', hip: '42–44', inseam: '31' },
  { size: 'XXL', waist: '38–40', hip: '44–46', inseam: '31.5' },
  { size: '3XL', waist: '40–42', hip: '46–48', inseam: '32' },
]

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-brand-black text-white">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-medium tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="even:bg-gray-50 border-b border-gray-100">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-semibold text-brand-black' : 'text-gray-600'}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SizeGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl text-brand-black mb-2">Size Guide</h1>
      <p className="text-gray-500 mb-10">
        All measurements are in <strong>inches</strong>. For the best fit, measure your body and compare to the chart below.
        When between sizes, size up.
      </p>

      {/* How to measure */}
      <section className="bg-gray-50 border border-gray-200 p-6 mb-12">
        <h2 className="font-serif text-xl text-brand-black mb-4">How to Measure</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-semibold text-brand-black mb-1">Chest</p>
            <p>Measure around the fullest part of your chest, keeping the tape horizontal.</p>
          </div>
          <div>
            <p className="font-semibold text-brand-black mb-1">Waist</p>
            <p>Measure around your natural waistline, keeping the tape comfortably loose.</p>
          </div>
          <div>
            <p className="font-semibold text-brand-black mb-1">Shoulder</p>
            <p>Measure from the end of one shoulder seam across the back to the other.</p>
          </div>
        </div>
      </section>

      {/* Shirts / T-Shirts / Polo */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl text-brand-black mb-4">Shirts, T-Shirts &amp; Polo</h2>
        <Table
          headers={['Size', 'Chest (in)', 'Shoulder (in)', 'Length (in)']}
          rows={TOPS_SIZES.map((r) => [r.size, r.chest, r.shoulder, r.length])}
        />
      </section>

      {/* Panjabi */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl text-brand-black mb-4">Panjabi</h2>
        <Table
          headers={['Size', 'Chest (in)', 'Shoulder (in)', 'Length (in)']}
          rows={PANJABI_SIZES.map((r) => [r.size, r.chest, r.shoulder, r.length])}
        />
        <p className="mt-3 text-xs text-gray-400">Panjabi length measured from back of collar to hem.</p>
      </section>

      {/* Trousers */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl text-brand-black mb-4">Trousers</h2>
        <Table
          headers={['Size', 'Waist (in)', 'Hip (in)', 'Inseam (in)']}
          rows={TROUSERS_SIZES.map((r) => [r.size, r.waist, r.hip, r.inseam])}
        />
      </section>

      <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <strong>Need help choosing?</strong> Reach out via our{' '}
        <a href="/contact" className="underline hover:text-brand-gold">Contact page</a> — our team is happy to advise on the right fit.
      </div>
    </div>
  )
}
