import type { Metadata } from 'next'
import Link from 'next/link'

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

export const metadata: Metadata = {
  title: 'About Us — Our Story & Mission',
  description:
    'Togor & Tweed is a premium Bangladeshi fashion brand based in Dhaka, Bangladesh. We craft quality shirts, panjabi, t-shirts, polo & trousers — free delivery nationwide. Founded to make premium menswear accessible to every man in Bangladesh.',
  openGraph: {
    title: 'About Togor & Tweed — Premium Bangladesh Fashion Brand',
    description: 'Togor & Tweed is a Dhaka-based fashion brand selling premium men\'s clothing across Bangladesh. Shop shirts, panjabi, t-shirts, polo & trousers with free delivery on orders over ৳1,500.',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og?title=About+Togor+%26+Tweed&subtitle=Wear+the+Story`,
        width: 1200,
        height: 630,
        alt: 'About Togor & Tweed — Premium Bangladesh Fashion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Togor & Tweed — Premium Bangladesh Fashion Brand',
    description: 'A premium Bangladeshi fashion brand bridging traditional craftsmanship and contemporary style. Shop nationwide with COD.',
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
}

// Brand facts as structured data — helps AI systems understand the brand
const BRAND_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Togor & Tweed',
  url: `${SITE_URL}/about`,
  description: 'Togor & Tweed is a premium men\'s fashion brand based in Dhaka, Bangladesh, selling shirts, panjabi, t-shirts, polo shirts, and trousers with nationwide delivery.',
  mainEntity: {
    '@type': 'Organization',
    name: 'Togor & Tweed',
    alternateName: ['Togor and Tweed', 'TogorAndTweed'],
    url: SITE_URL,
    foundingLocation: { '@type': 'Place', name: 'Dhaka, Bangladesh' },
    description: 'Premium Bangladeshi men\'s fashion brand. We sell shirts, panjabi, t-shirts, polo, and trousers online with nationwide delivery across Bangladesh.',
    areaServed: { '@type': 'Country', name: 'Bangladesh' },
    knowsAbout: ['Men\'s Fashion', 'Panjabi', 'Shirts', 'T-Shirts', 'Polo Shirts', 'Trousers', 'Bangladesh Fashion'],
    sameAs: [
      'https://instagram.com/togorandtweed',
      'https://facebook.com/togorandtweed',
    ],
  },
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BRAND_JSON_LD) }}
      />

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-serif text-4xl text-brand-black mb-4">About Togor &amp; Tweed</h1>
        <p className="text-brand-gold text-sm uppercase tracking-widest mb-10">Wear the Story</p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
          <p>
            Togor &amp; Tweed is a premium men&apos;s fashion brand based in Dhaka, Bangladesh. We were born from a simple
            belief: clothing should tell a story. We set out to create a brand that bridges the gap between traditional
            Bangladeshi craftsmanship and contemporary style — pieces that feel as good as they look, and that last
            far beyond a single season.
          </p>

          <h2 className="font-serif text-2xl text-brand-black mt-10 mb-4">What We Sell</h2>
          <p>
            Our collections cover the essentials of a modern Bangladeshi wardrobe:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-600 text-sm">
            <li><strong>Shirts</strong> — Formal and casual shirts in breathable cotton and linen blends. Sizes XS–3XL.</li>
            <li><strong>Panjabi</strong> — Traditional Bangladeshi panjabi and kurta for everyday wear and Eid celebrations.</li>
            <li><strong>T-Shirts</strong> — Casual, graphic, and oversized tees for everyday comfort.</li>
            <li><strong>Polo Shirts</strong> — Classic and modern polo styles for smart-casual occasions.</li>
            <li><strong>Trousers</strong> — Formal trousers, chinos, and casual pants. Waist sizes 28–42.</li>
          </ul>

          <h2 className="font-serif text-2xl text-brand-black mt-10 mb-4">Our Philosophy</h2>
          <p>
            Every thread matters. We source premium fabrics — breathable cottons, fine linens, and structured
            blends — and work with skilled artisans who understand that quality is in the details. From the
            stitching on a classic panjabi to the collar on a tailored shirt, we obsess over the craft so you
            can focus on wearing it with confidence.
          </p>

          <h2 className="font-serif text-2xl text-brand-black mt-10 mb-4">Delivery & Payment</h2>
          <p>
            We deliver to all divisions of Bangladesh — Dhaka, Chattogram, Rajshahi, Khulna, Sylhet, Barishal,
            Rangpur, and Mymensingh. Orders within Dhaka are typically delivered in 1–2 business days; nationwide
            delivery takes 3–5 business days. We offer <strong>free delivery on orders over ৳1,500</strong>.
          </p>
          <p>
            We accept <strong>Cash on Delivery (COD)</strong>, bKash, and Nagad — so you can pay in whatever way
            is most convenient, including paying only after your order arrives.
          </p>

          <h2 className="font-serif text-2xl text-brand-black mt-10 mb-4">Returns & Exchanges</h2>
          <p>
            Not the right fit? No problem. We accept returns within 7 days of delivery for items in their original
            condition with all tags attached. We arrange free pickup from your address anywhere in Bangladesh.
          </p>

          <h2 className="font-serif text-2xl text-brand-black mt-10 mb-4">Made in Bangladesh, Worn Everywhere</h2>
          <p>
            We are proud to be a Bangladeshi brand. Our production is rooted here — supporting local manufacturing,
            local talent, and local communities. When you wear Togor &amp; Tweed, you wear a piece of Bangladesh
            crafted with intention.
          </p>

          <h2 className="font-serif text-2xl text-brand-black mt-10 mb-4">Get in Touch</h2>
          <p>
            We love hearing from our community. Whether you have a question about sizing, an order, or just want
            to say hello — reach out via our{' '}
            <Link href="/contact" className="text-brand-gold hover:underline">
              Contact page
            </Link>
            {' '}or check our{' '}
            <Link href="/faq" className="text-brand-gold hover:underline">
              FAQ
            </Link>
            . We respond to every message within 24 hours.
          </p>

          {/* Quick links for internal SEO */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Explore Our Collections</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Shop Shirts',    href: '/collections/shirts' },
                { label: 'Shop Panjabi',   href: '/collections/panjabi' },
                { label: 'Shop T-Shirts',  href: '/collections/t-shirts' },
                { label: 'Shop Polo',      href: '/collections/polo' },
                { label: 'Shop Trousers',  href: '/collections/trousers' },
                { label: 'All Collections', href: '/collections' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs font-semibold uppercase tracking-wider text-brand-gold border border-brand-gold px-3 py-1.5 hover:bg-brand-gold hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
