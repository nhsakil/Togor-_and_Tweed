'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Truck, RotateCcw, ShieldCheck, Banknote } from 'lucide-react'
import { getCategoryConfig } from '@/lib/collections/seoConfig'
import { renderWithLinks } from '@/lib/renderWithLinks'

interface RelatedCategory {
  name: string
  slug: string
  imageUrl?: string | null
}

interface FAQ {
  question: string
  answer: string
}

interface SeoSection {
  heading: string
  body: string
}

interface Props {
  categoryName: string
  categorySlug: string
  description?: string | null
  relatedCategories?: RelatedCategory[]
  faqs?: FAQ[]
  dbSeoSections?: SeoSection[] | null
}

const TRUST_BADGES = [
  { icon: Truck,       title: 'Free Delivery',    sub: 'On orders above ৳1,500' },
  { icon: RotateCcw,   title: '7-Day Returns',    sub: 'Easy, no-questions-asked' },
  { icon: ShieldCheck, title: '100% Authentic',   sub: 'Genuine quality guaranteed' },
  { icon: Banknote,    title: 'Cash on Delivery', sub: 'Pay when it arrives' },
]

function buildFaqs(categoryName: string): FAQ[] {
  const n = categoryName
  return [
    {
      question: `What sizes are available for ${n} at Togor & Tweed?`,
      answer: `We stock ${n} in sizes XS, S, M, L, XL, XXL, and 3XL. Use the size filter on the left to narrow down options. If unsure of your size, our size guide on each product page shows exact measurements in centimetres.`,
    },
    {
      question: `What is the return policy for ${n}?`,
      answer: `You can return any ${n} within 7 days of delivery as long as the item is unworn, unwashed, and has all original tags attached. Contact our support team and we will arrange a pickup from your address anywhere in Bangladesh.`,
    },
    {
      question: `Do you offer Cash on Delivery for ${n} orders?`,
      answer: `Yes. All ${n} orders can be paid using Cash on Delivery (COD). We also accept bKash and Nagad for instant mobile payments. Choose your preferred method at checkout.`,
    },
    {
      question: `How long does delivery take for ${n}?`,
      answer: `Orders placed before 3 PM are dispatched the same day. Delivery to Dhaka and Chattogram typically takes 1-2 business days. For other divisions expect 3-5 business days. You will receive an SMS with tracking details once your order ships.`,
    },
    {
      question: `How do I care for my ${n} from Togor & Tweed?`,
      answer: `Machine wash in cold water on a gentle cycle, avoid bleach, and either tumble-dry on low or hang to dry. Iron on medium heat if needed. Following these steps will keep your ${n} looking great for longer.`,
    },
    {
      question: `Can I filter ${n} by colour or price?`,
      answer: `Yes. Use the filter panel on the left (or tap Filter on mobile) to refine ${n} by size, colour, and price range. You can sort by newest arrivals, price low-to-high, or price high-to-low using the sort dropdown.`,
    },
  ]
}

function FaqItem({ question, answer }: FAQ) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#e0e0e0]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="text-[13px] text-[#222] leading-snug">{question}</span>
        {open
          ? <ChevronUp   size={14} strokeWidth={2} className="flex-shrink-0 text-[#666]" />
          : <ChevronDown size={14} strokeWidth={2} className="flex-shrink-0 text-[#999]" />}
      </button>
      {/* CSS-based show/hide: answer always in DOM for Googlebot */}
      <div
        style={{ maxHeight: open ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.25s ease' }}
        aria-hidden={!open}
      >
        <p className="pb-4 text-[13px] text-[#555] leading-[1.75]">{answer}</p>
      </div>
    </div>
  )
}

export default function CategorySeoSection({
  categoryName,
  categorySlug,
  description,
  relatedCategories = [],
  faqs,
  dbSeoSections,
}: Props) {
  const config  = getCategoryConfig(categorySlug)
  // Priority: prop FAQs > seoConfig FAQs > generic generated FAQs
  const faqList = (faqs && faqs.length > 0)
    ? faqs
    : config.faqs.length > 0
      ? config.faqs
      : buildFaqs(categoryName)
  const capName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1)

  // Use DB sections if saved, otherwise fall back to seoConfig
  const activeSections: SeoSection[] =
    dbSeoSections && dbSeoSections.length > 0
      ? dbSeoSections
      : config.seoSections.map((s: { heading: string; body?: string }) => ({
          heading: s.heading,
          body: s.body ?? '',
        }))

  // All extra sections (after the first) — always visible, no collapse
  const extraSecs = activeSections.slice(1)

  return (
    <section
      className="border-t border-[#e8e8e8] w-full"
      style={{ backgroundColor: '#faf7f4' }}
      aria-label={`More about ${categoryName}`}
    >
      {/* Inner container: offset right of sidebar on desktop */}
      <div className="max-w-[1600px] mx-auto px-4 md:pl-[304px] md:pr-6 py-10">

        {/* Page heading */}
        <h2 className="text-[20px] md:text-[22px] font-bold text-[#111] mb-12">
          More about shopping {capName} for men
        </h2>

        {/* TOP CATEGORIES */}
        {relatedCategories.length > 0 && (
          <div className="mb-12">
            <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#111] mb-5">
              Top Categories
            </p>
            <div className="flex flex-wrap" style={{ gap: '10px 40px' }}>
              {relatedCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="text-[14px] text-[#444] hover:text-[#111] transition-colors"
                  style={{ lineHeight: '1.6' }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* POPULAR SEARCHES */}
        {config.popularSearches.length > 0 && (
          <div className="mb-12">
            <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#111] mb-5">
              Popular Searches
            </p>
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
                gap: '10px 32px',
              }}
            >
              {config.popularSearches.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="text-[14px] text-[#444] hover:text-[#111] transition-colors"
                  style={{ lineHeight: '1.6' }}
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* MOST POPULAR */}
        {config.mostPopularLinks.length > 0 && (
          <div className="mb-12">
            <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#111] mb-5">
              Most Popular {capName}
            </p>
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '10px 32px',
              }}
            >
              {config.mostPopularLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[14px] text-[#444] hover:text-[#111] transition-colors"
                  style={{ lineHeight: '1.6' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* TRUST BADGES */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-8 mb-10"
          style={{ borderTop: '1px solid #e0e0e0' }}
        >
          {TRUST_BADGES.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-[#ddd] flex items-center justify-center">
                <Icon size={15} strokeWidth={1.75} className="text-[#111]" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#1a1a1a] leading-snug">{title}</p>
                <p className="text-[11px] text-[#888] mt-0.5 leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FROM THE JOURNAL */}
        {config.blogLinks.length > 0 && (
          <div className="mb-12">
            <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#111] mb-5">
              From the Style Journal
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {config.blogLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group border border-[#e8e8e8] hover:border-[#111] p-4 transition-colors"
                >
                  <p className="text-[13px] font-bold text-[#111] leading-snug mb-1 group-hover:text-[#555] transition-colors">
                    {link.label}
                  </p>
                  <p className="text-[11px] text-[#888] leading-relaxed">{link.description}</p>
                  <p className="text-[11px] font-bold text-[#111] mt-2 group-hover:text-[#555] transition-colors">Read →</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT + FAQ — always show all sections, no collapse */}
        <div
          className="grid md:grid-cols-[1fr_300px] gap-10 md:gap-14 pt-8"
          style={{ borderTop: '1px solid #e0e0e0' }}
        >
          {/* About text */}
          <div>
            <h3 className="text-[15px] font-bold text-[#111] mb-3 uppercase tracking-tight">
              {activeSections[0]?.heading ?? `Buy ${capName} Online in Bangladesh`}
            </h3>

            {description ? (
              description.includes('<') ? (
                <div
                  className="text-[13px] text-[#555] leading-[1.85] mb-3"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <div className="text-[13px] text-[#555] leading-[1.85] mb-3 space-y-3">
                  {description.split(/\n\n+/).map((p, i) => <p key={i}>{p.trim()}</p>)}
                </div>
              )
            ) : (
              <div className="text-[13px] text-[#555] leading-[1.85] mb-3 space-y-3">
                <p>
                  Discover our curated {categoryName} collection at Togor &amp; Tweed, crafted for the
                  modern Bangladeshi wardrobe. Each piece is selected for quality fabric, precise
                  tailoring, and timeless style.
                </p>
                <p>
                  Free delivery on orders above &#2547;1,500, easy 7-day returns, and Cash on Delivery
                  available across Bangladesh.
                </p>
              </div>
            )}

            {/* All extra sections always visible */}
            {extraSecs.map(({ heading, body }: SeoSection) => (
              <div key={heading} className="mb-4">
                <h4 className="text-[13px] font-semibold text-[#111] mb-1">{heading}</h4>
                {body && <p className="text-[13px] text-[#555] leading-[1.85]">{renderWithLinks(body)}</p>}
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-[#111] mb-3">
              Frequently Asked Questions
            </h3>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faqList.map(({ question, answer }) => ({
                    '@type': 'Question',
                    name: question,
                    acceptedAnswer: { '@type': 'Answer', text: answer },
                  })),
                }),
              }}
            />
            <div className="border-t border-[#e0e0e0]">
              {faqList.map((faq) => (
                <FaqItem key={faq.question} {...faq} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
