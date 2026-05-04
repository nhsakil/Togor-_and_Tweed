'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { renderWithLinks } from '@/lib/renderWithLinks'

interface SeoSection { heading: string; body: string }
interface Category   { name: string; slug: string }
interface Props {
  sections?:      SeoSection[] | null
  topCategories?: Category[]
}


const POPULAR_SEARCHES = [
  'shirts for men', 'panjabi online', 't-shirts for men', 'polo shirts', 'formal trousers',
  'casual shirts', 'slim fit shirts', 'cotton panjabi', 'polo for men', 'formal shirts Bangladesh',
  'white shirt men', 'black shirt men', 'striped shirt men', 'printed t-shirts', 'oversized t-shirts',
  'regular fit trousers', 'chinos for men', 'premium menswear Bangladesh', 'eid panjabi', 'office wear men',
]

const MOST_POPULAR_LINKS = [
  { label: 'White Shirts for Men',        href: '/collections/shirts?color=White' },
  { label: 'Black T-Shirts',              href: '/collections/t-shirt?color=Black' },
  { label: 'Slim Fit Trousers',           href: '/collections/trousers?subcat=slim' },
  { label: 'Cotton Panjabi',              href: '/collections/panjabi?subcat=cotton' },
  { label: 'Polo Shirts Bangladesh',      href: '/collections/polo' },
  { label: 'Formal Shirts Online',        href: '/collections/shirts?subcat=formal' },
  { label: 'Casual T-Shirts',            href: '/collections/t-shirt' },
  { label: 'Eid Panjabi Collection',      href: '/collections/panjabi?subcat=eid' },
  { label: 'Office Wear Shirts',          href: '/collections/shirts?subcat=formal' },
  { label: 'Premium Cotton Shirts',       href: '/collections/shirts?subcat=cotton' },
  { label: 'Striped Shirts for Men',      href: '/collections/shirts?subcat=check' },
  { label: 'Regular Fit Trousers',        href: '/collections/trousers?subcat=casual' },
]

const BLOG_LINKS = [
  { label: 'Best Eid Outfits for Men 2025',        href: '/blog/best-eid-outfits-men-bangladesh-2025' },
  { label: 'Office Wear Guide Bangladesh',          href: '/blog/office-wear-guide-men-bangladesh' },
  { label: "Men's Size Guide Bangladesh",           href: '/blog/mens-size-guide-bangladesh' },
  { label: 'Cotton vs Linen Fabric Guide',          href: '/blog/fabric-guide-cotton-linen-bangladesh' },
  { label: 'Monsoon Fashion for Men',               href: '/blog/monsoon-fashion-men-bangladesh' },
  { label: 'Panjabi vs Kurta: The Difference',      href: '/blog/panjabi-vs-kurta-difference' },
  { label: 'How to Style a Polo Shirt',             href: '/blog/how-to-style-polo-shirt-men' },
]

const DEFAULT_FAQS = [
  { question: 'What sizes does Togor & Tweed carry?', answer: 'We stock all sizes from XS through 3XL across most categories. Use the size filter on any collection page to find your fit. Each product page includes a size guide with exact measurements in centimetres.' },
  { question: 'How long does delivery take?', answer: "Orders placed before 3 PM are dispatched the same day. Delivery within Dhaka and Chattogram typically takes 1–2 business days. For other divisions, allow 3–5 business days. You'll receive an SMS with tracking details once your order ships." },
  { question: 'Can I pay with Cash on Delivery?', answer: 'Yes — all orders can be paid with Cash on Delivery (COD). We also accept bKash and Nagad for instant mobile payments. Choose your preferred method at checkout.' },
  { question: 'What is your return policy?', answer: 'You can return any item within 7 days of delivery as long as it is unworn, unwashed, and has all original tags attached. Contact our support team and we will arrange a free pickup from your address.' },
  { question: 'Are all products authentic?', answer: 'Absolutely. Every item sold on Togor & Tweed is 100% authentic and sourced directly. We do not carry replicas or imitations — only genuine quality pieces you can trust.' },
]

const linkCls = 'text-[14px] text-[#444] hover:text-[#111] transition-colors'

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#e0e0e0]">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-4 py-3.5 text-left" aria-expanded={open}>
        <span className="text-[13px] text-[#222] leading-snug">{question}</span>
        {open ? <ChevronUp size={14} strokeWidth={2} className="flex-shrink-0 text-[#666]" /> : <ChevronDown size={14} strokeWidth={2} className="flex-shrink-0 text-[#999]" />}
      </button>
      {/* CSS-based show/hide: answer is always in the DOM for Googlebot */}
      <div
        style={{ maxHeight: open ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.25s ease' }}
        aria-hidden={!open}
      >
        <p className="pb-4 text-[13px] text-[#555] leading-[1.75]">{answer}</p>
      </div>
    </div>
  )
}


function FaqSidebar() {
  return (
    <div>
      <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-[#111] mb-3">Frequently Asked Questions</h3>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: DEFAULT_FAQS.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }) }} />
      <div className="border-t border-[#e0e0e0]">
        {DEFAULT_FAQS.map(faq => <FaqItem key={faq.question} {...faq} />)}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#111] mb-5">{children}</p>
  )
}

function AdminSections({ sections }: { sections: SeoSection[] }) {
  const first = sections[0]
  const rest  = sections.slice(1)
  return (
    <>
      <h2 className="text-[20px] md:text-[22px] font-bold text-[#111] mb-8">
        {first?.heading ?? "Buy Premium Men's Fashion Online in Bangladesh"}
      </h2>
      <div className="grid md:grid-cols-[1fr_320px] gap-10 md:gap-14">
        <div className="text-[13px] text-[#555] leading-[1.85]">
          {first?.body && <p className="mb-6">{renderWithLinks(first.body)}</p>}
          {rest.map(({ heading, body }) => (
            <div key={heading} className="mb-5">
              <h3 className="text-[14px] font-bold text-[#111] mb-1">{heading}</h3>
              {body && <p>{renderWithLinks(body)}</p>}
            </div>
          ))}
        </div>
        <FaqSidebar />
      </div>
    </>
  )
}

function RichDefaultContent() {
  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-10 md:gap-14">
      <div className="text-[13px] text-[#555] leading-[1.85] space-y-6">

        <div>
          <h2 className="text-[20px] md:text-[22px] font-bold text-[#111] mb-3">
            The Togor &amp; Tweed Shopping Experience – Where Style Meets Convenience
          </h2>
          <p>
            At <Link href="/" className="text-[#c26b47] hover:underline">Togor &amp; Tweed</Link>, we redefine the modern shopping experience for Bangladesh — merging seamless digital convenience with a curated selection of premium menswear. Whether you are browsing our <Link href="/collections" className="text-[#c26b47] hover:underline">full collection</Link> or looking for a specific style, we ensure a smooth, stylish, and hassle-free journey that caters to today&apos;s fashion-forward Bangladeshi men.
          </p>
          <p className="mt-3">
            Our direct-to-consumer approach eliminates traditional retail barriers, giving you complete control over how and when you shop. From effortless online browsing to same-day dispatch, Togor &amp; Tweed lets you shop on your terms, at your pace.
          </p>
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-[#111] mb-2">Shop Anytime, Anywhere – Fast Delivery Across Bangladesh</h3>
          <p>
            <strong>🛍️ 24/7 Accessibility – Fashion at Your Fingertips:</strong> Gone are the days of queuing in crowded stores. Togor &amp; Tweed online shopping lets you browse, select, and purchase from our curated menswear collections anytime, anywhere. Whether you are searching for sharp <Link href="/collections/shirts" className="text-[#c26b47] hover:underline">formal shirts</Link>, relaxed <Link href="/collections/t-shirts" className="text-[#c26b47] hover:underline">t-shirts</Link>, or traditional <Link href="/collections/panjabi" className="text-[#c26b47] hover:underline">panjabi</Link>, our website provides a fast, intuitive, and stylish experience.
          </p>
          <p className="mt-3 font-semibold text-[#111] text-[12px] uppercase tracking-wide">Key Features of Togor &amp; Tweed Online Shopping:</p>
          <ul className="mt-2 space-y-1.5">
            {['User-Friendly Navigation – Explore categories effortlessly, from shirts and panjabi to polo and trousers.','High-Quality Product Views – Multiple images, fabric close-ups, and size guides ensure zero guesswork.','Secure & Easy Checkout – Pay with Cash on Delivery, bKash, or Nagad.','Same-Day Dispatch – Orders placed before 3 PM are shipped the same day.','Exclusive Online Drops – New arrivals added every week, straight from Dhaka.'].map(item => (
              <li key={item} className="flex gap-2"><span className="text-[#c26b47] flex-shrink-0">✔</span><span>{item}</span></li>
            ))}
          </ul>
          <p className="mt-3 italic text-[#888]">Style Tip: Not sure about sizing? Check the size guide on every product page — exact measurements in centimetres so you can order with confidence.</p>
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-[#111] mb-2">Seasonal Collections – Year-Round Style for Bangladesh</h3>
          <p><strong>🍂 Effortlessly Transition Through Every Season:</strong> At Togor &amp; Tweed, we curate seasonal menswear collections that keep you stylish throughout Bangladesh&apos;s calendar — from the scorching summer heat to the cool winter months and festive Eid season.</p>
          <p className="mt-3 font-semibold text-[#111] text-[12px] uppercase tracking-wide">Discover:</p>
          <ul className="mt-2 space-y-1.5">
            {([['Summer-Ready Looks','Breezy cotton shirts, linen kurtas, and lightweight trousers for a cool aesthetic.','/collections/shirts'],['Eid Essentials','Elegant panjabi, premium kurtas, and festive styles for a flawless celebration look.','/collections/panjabi'],['Winter Warmth','Full-sleeve tees, layered overshirts, and structured trousers that blend comfort and style.','/collections/t-shirts'],['Year-Round Staples','Classic polo shirts, smart trousers, and versatile tees designed for every season.','/collections/polo']] as [string,string,string][]).map(([label, desc, href]) => (
              <li key={label} className="flex gap-2"><span className="text-[#c26b47] flex-shrink-0">✔</span><span><Link href={href} className="text-[#c26b47] hover:underline">{label}</Link> – {desc}</span></li>
            ))}
          </ul>
          <p className="mt-3 italic text-[#888]">Style Tip: Invest in versatile neutrals like beige and white that seamlessly transition between occasions — from office wear to weekend casual.</p>
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-[#111] mb-2">Why Shop at Togor &amp; Tweed?</h3>
          <ul className="space-y-1.5">
            {["Contemporary Menswear That Keeps Up with Bangladesh's Trends",'Free Delivery on all orders above ৳1,500','Premium Fabrics, Trend-Driven Designs, & Smart Tailoring','7-Day Hassle-Free Returns — pickup from your doorstep','Cash on Delivery + bKash & Nagad accepted','Fashion for Every Season, Occasion & Mood'].map(item => (
              <li key={item} className="flex gap-2"><span className="text-[#c26b47] flex-shrink-0">✔</span><span>{item}</span></li>
            ))}
          </ul>
          <p className="mt-4">Your wardrobe should work as hard as you do. Togor &amp; Tweed makes fashion easy, exciting, and accessible — whether you are scrolling from home or gifting a loved one.</p>
        </div>

        <div className="border border-[#e8ddd6] rounded-lg p-4" style={{ backgroundColor: '#fdf6f0' }}>
          <h3 className="text-[14px] font-bold text-[#111] mb-1">Upgrade Your Wardrobe – Explore Togor &amp; Tweed Today!</h3>
          <p>Ready to redefine your style? <Link href="/collections" className="text-[#c26b47] hover:underline">Shop the latest men&apos;s fashion</Link> — from crisp <Link href="/collections/shirts" className="text-[#c26b47] hover:underline">shirts</Link> and smart <Link href="/collections/trousers" className="text-[#c26b47] hover:underline">trousers</Link> to festive <Link href="/collections/panjabi" className="text-[#c26b47] hover:underline">panjabi</Link> and everyday <Link href="/collections/t-shirts" className="text-[#c26b47] hover:underline">t-shirts</Link>. Togor &amp; Tweed has it all.</p>
          <p className="mt-2 font-semibold text-[#111]">🔥 Stay ahead of trends. Elevate your style. <Link href="/collections" className="text-[#c26b47] hover:underline">Shop now!</Link> 🔥</p>
        </div>

      </div>
      <FaqSidebar />
    </div>
  )
}

export default function HomeSeoSection({ sections, topCategories = [] }: Props) {
  const hasAdminSections = sections && sections.length > 0

  return (
    <section className="border-t border-[#e8e8e8] w-full" style={{ backgroundColor: '#faf7f4' }} aria-label="About Togor & Tweed">
      <div className="max-w-[1600px] mx-auto px-6 pt-8 pb-10">

        {/* ── TOP CATEGORIES ── */}
        {topCategories.length > 0 && (
          <div className="mb-10">
            <SectionLabel>Top Categories</SectionLabel>
            <div className="flex flex-wrap" style={{ gap: '8px 40px' }}>
              {topCategories.map(cat => (
                <Link key={cat.slug} href={`/collections/${cat.slug}`} className={linkCls} style={{ lineHeight: '1.7' }}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── POPULAR SEARCHES ── */}
        <div className="mb-10">
          <SectionLabel>Popular Searches</SectionLabel>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '8px 32px' }}>
            {POPULAR_SEARCHES.map(term => (
              <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className={linkCls} style={{ lineHeight: '1.7' }}>
                {term}
              </Link>
            ))}
          </div>
        </div>

        {/* ── MOST POPULAR ── */}
        <div className="mb-10">
          <SectionLabel>Most Popular Styles</SectionLabel>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 32px' }}>
            {MOST_POPULAR_LINKS.map(link => (
              <Link key={link.label} href={link.href} className={linkCls} style={{ lineHeight: '1.7' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── BLOG & GUIDES ── */}
        <div className="mb-10">
          <SectionLabel>Style Journal &amp; Guides</SectionLabel>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px 32px' }}>
            {BLOG_LINKS.map(link => (
              <Link key={link.href} href={link.href} className={linkCls} style={{ lineHeight: '1.7' }}>
                {link.label}
              </Link>
            ))}
            <Link href="/why-us" className={linkCls} style={{ lineHeight: '1.7' }}>Why Choose Togor &amp; Tweed?</Link>
            <Link href="/faq"    className={linkCls} style={{ lineHeight: '1.7' }}>Frequently Asked Questions</Link>
          </div>
        </div>

        {/* ── SEO TEXT + FAQ ── */}
        {hasAdminSections ? <AdminSections sections={sections} /> : <RichDefaultContent />}

      </div>
    </section>
  )
}
