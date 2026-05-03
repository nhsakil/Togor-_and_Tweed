'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    category: 'Orders & Shipping',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Orders within Dhaka are typically delivered within 1–2 business days. For other divisions (Chattogram, Rajshahi, Khulna, etc.) please allow 3–5 business days.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! Orders over ৳1,500 qualify for free shipping across Bangladesh. Standard delivery charges apply to orders below this threshold.',
      },
      {
        q: 'Can I track my order?',
        a: 'Once your order is dispatched you will receive an SMS and email with a tracking number. You can also check your order status under My Account → Orders.',
      },
      {
        q: 'Do you ship outside Bangladesh?',
        a: 'We currently only ship within Bangladesh. International shipping is on our roadmap — stay tuned!',
      },
    ],
  },
  {
    category: 'Returns & Exchanges',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 7 days of delivery for items in their original, unworn condition with all tags attached. See our Shipping & Returns page for the full policy.',
      },
      {
        q: 'How do I start a return?',
        a: 'Contact us via the Contact page or WhatsApp with your order number and reason for return. Our team will arrange a pickup.',
      },
      {
        q: 'Can I exchange for a different size?',
        a: 'Absolutely. Size exchanges are processed free of charge if requested within 7 days of delivery, subject to stock availability.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Cash on Delivery (COD), bKash, and Nagad. More payment options are coming soon.',
      },
      {
        q: 'Is Cash on Delivery available everywhere?',
        a: 'COD is available for all divisions across Bangladesh.',
      },
      {
        q: 'Is it safe to pay online?',
        a: 'Yes. bKash and Nagad transactions are processed on their secure platforms. We never store your mobile banking credentials.',
      },
    ],
  },
  {
    category: 'Products & Sizing',
    items: [
      {
        q: 'How do I find my size?',
        a: 'Each product page has a "Size Guide" link. We recommend measuring your chest, waist, and length and comparing against our size chart for the best fit.',
      },
      {
        q: 'Are your fabrics pre-washed?',
        a: 'Most of our cotton pieces are pre-washed to minimise shrinkage. Care instructions are printed on the garment label.',
      },
      {
        q: 'Do you restock sold-out items?',
        a: 'Popular items are restocked regularly. Use the "Notify Me" option on the product page and we\'ll email you when it\'s back.',
      },
    ],
  },
]

/*
 * CSS-based accordion: the answer <p> is always present in the DOM (visible to
 * Googlebot and screen readers). A max-height transition hides/shows it visually.
 * This ensures FAQPage JSON-LD answers match the actual page text content.
 */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-brand-black hover:text-brand-gold transition-colors"
      >
        <span>{q}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {/* Answer always in DOM — hidden via max-height so Googlebot can read it */}
      <div
        style={{
          maxHeight: open ? '500px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.25s ease',
        }}
        aria-hidden={!open}
      >
        <p className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl text-brand-black mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-12">
        Can&apos;t find the answer you&apos;re looking for?{' '}
        <a href="/contact" className="text-brand-gold hover:underline">Contact us</a> and we&apos;ll help.
      </p>

      <div className="space-y-10">
        {FAQS.map((section) => (
          <section key={section.category}>
            <h2 className="font-serif text-xl text-brand-black mb-4 pb-2 border-b border-gray-200">
              {section.category}
            </h2>
            <div>
              {section.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
