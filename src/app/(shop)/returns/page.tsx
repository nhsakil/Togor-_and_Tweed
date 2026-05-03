import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

export const metadata: Metadata = {
  title: 'Return & Exchange Policy — Togor & Tweed Bangladesh',
  description: 'Togor & Tweed return and exchange policy. Return any item within 7 days of delivery. Free pickup from your address anywhere in Bangladesh. Easy, no-questions-asked.',
  keywords: [
    'return policy togor and tweed',
    'exchange policy bangladesh fashion',
    'online shopping returns bangladesh',
    '7 day return policy bangladesh',
    'free return pickup bangladesh',
  ],
  alternates: { canonical: `${SITE_URL}/returns` },
  openGraph: {
    title: 'Return & Exchange Policy — Togor & Tweed',
    description: '7-day hassle-free returns. Free pickup from your address anywhere in Bangladesh.',
    type: 'website',
  },
}

const STEPS = [
  {
    number: '01',
    heading: 'Contact us within 7 days',
    body: 'Reach out via WhatsApp, email, or our contact page within 7 days of receiving your order. Share your order number and the reason for return.',
  },
  {
    number: '02',
    heading: 'We arrange free pickup',
    body: 'Our team will schedule a free pickup from your address — anywhere in Bangladesh. No need to visit a store or drop off at a courier.',
  },
  {
    number: '03',
    heading: 'Item inspection',
    body: 'Once we receive the item, our team inspects it to confirm it is unworn, unwashed, and has all original tags attached.',
  },
  {
    number: '04',
    heading: 'Refund or exchange processed',
    body: 'Upon successful inspection, your exchange is dispatched or your refund is processed within 3–5 business days via your original payment method.',
  },
]

const CONDITIONS = [
  'Item must be returned within 7 days of delivery date',
  'Item must be unworn and unwashed',
  'All original tags must be attached and intact',
  'Item must be in its original packaging where applicable',
  'Items marked as "Final Sale" are not eligible for return',
  'Customised or personalised items cannot be returned',
  'Items showing signs of wear, washing, or alteration will not be accepted',
]

const NON_RETURNABLE = [
  'Items purchased during clearance or final sale events',
  'Undergarments and innerwear (for hygiene reasons)',
  'Items damaged due to improper care by the customer',
  'Accessories (belts, caps) — exchange only, no cash refund',
]

const BREADCRUMB_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',                  item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Return & Exchange Policy', item: `${SITE_URL}/returns` },
  ],
}

export default function ReturnsPage() {
  return (
    <div className="min-h-screen">
      <JsonLd data={BREADCRUMB_JSON_LD} />
      {/* Header */}
      <div className="border-b border-[#e8e8e8] py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#aaa] mb-1">Customer Care</p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#111]">
          Return & Exchange Policy
        </h1>
        <p className="text-[13px] text-[#888] mt-2">7-day hassle-free returns. Free pickup from your door.</p>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-12">

        {/* Quick summary badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { value: '7 Days', label: 'Return window' },
            { value: 'Free', label: 'Pickup cost' },
            { value: '3–5 Days', label: 'Refund processing' },
            { value: 'All BD', label: 'Coverage' },
          ].map(s => (
            <div key={s.label} className="border border-[#e8e8e8] p-4 text-center">
              <p className="text-2xl font-black text-[#111] mb-0.5">{s.value}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#888]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <h2 className="text-[18px] font-black uppercase tracking-tight text-[#111] mb-6">How to return an item</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
          {STEPS.map(step => (
            <div key={step.number} className="border border-[#e8e8e8] p-5 hover:border-[#111] transition-colors">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#aaa] mb-2">{step.number}</p>
              <h3 className="text-[15px] font-black uppercase tracking-tight text-[#111] mb-2">{step.heading}</h3>
              <p className="text-[13px] text-[#555] leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>

        {/* Conditions */}
        <div className="mb-14">
          <h2 className="text-[18px] font-black uppercase tracking-tight text-[#111] mb-6">Return conditions</h2>
          <p className="text-[13px] text-[#555] leading-relaxed mb-4">
            To be eligible for a return or exchange, the following conditions must be met:
          </p>
          <ul className="space-y-2">
            {CONDITIONS.map(c => (
              <li key={c} className="flex items-start gap-3 text-[13px] text-[#444] leading-relaxed">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#111] mt-1.5" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Non-returnable */}
        <div className="mb-14 bg-[#fafafa] border border-[#e8e8e8] p-6">
          <h2 className="text-[16px] font-black uppercase tracking-tight text-[#111] mb-4">Non-returnable items</h2>
          <ul className="space-y-2">
            {NON_RETURNABLE.map(c => (
              <li key={c} className="flex items-start gap-3 text-[13px] text-[#555] leading-relaxed">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#aaa] mt-1.5" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Refund method */}
        <div className="mb-14">
          <h2 className="text-[18px] font-black uppercase tracking-tight text-[#111] mb-4">Refund methods</h2>
          <p className="text-[13px] text-[#555] leading-relaxed mb-4">
            Refunds are processed to your original payment method within 3–5 business days of the item passing inspection.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { method: 'Cash on Delivery orders', refund: 'bKash or Nagad transfer within 3 business days' },
              { method: 'bKash / Nagad orders', refund: 'Refunded to the same bKash/Nagad number within 3 days' },
              { method: 'Card payments', refund: 'Reversed to the original card within 5–7 business days' },
            ].map(r => (
              <div key={r.method} className="border border-[#e8e8e8] p-4">
                <p className="text-[12px] font-bold text-[#111] mb-1">{r.method}</p>
                <p className="text-[12px] text-[#666] leading-relaxed">{r.refund}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Exchange */}
        <div className="mb-14">
          <h2 className="text-[18px] font-black uppercase tracking-tight text-[#111] mb-4">Exchanges</h2>
          <p className="text-[13px] text-[#555] leading-relaxed">
            Want a different size or colour? We offer free exchanges within the same product. If the item you want costs more, you pay the difference; if it costs less, we refund the balance. Simply mention your preferred exchange item when you contact us to initiate the return.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="border border-[#111] p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] mb-2">Need help?</p>
          <p className="text-[17px] font-black uppercase tracking-tight text-[#111] mb-2">Start a return or exchange</p>
          <p className="text-[13px] text-[#555] mb-5">
            Contact us via WhatsApp or email and we&apos;ll guide you through the process.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 bg-[#111] text-white text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#333] transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/collections"
              className="px-6 py-3 border border-[#111] text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#111] hover:text-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Internal links */}
        <div className="mt-10 pt-8 border-t border-[#e8e8e8] flex flex-wrap gap-x-6 gap-y-2">
          {[
            { label: 'Shipping Policy', href: '/shipping' },
            { label: 'Size Guide', href: '/size-guide' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Contact Us', href: '/contact' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-[12px] text-[#555] hover:text-[#111] underline transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
