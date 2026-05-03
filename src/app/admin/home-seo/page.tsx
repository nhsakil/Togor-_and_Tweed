import { prisma } from '@/lib/prisma'
import HomeSeoEditor from '@/components/admin/HomeSeoEditor'

export const metadata = { title: 'Home Page SEO — Admin' }

const DEFAULT_SECTIONS = [
  {
    heading: "Buy Premium Men's Fashion Online in Bangladesh",
    body: "Togor & Tweed brings you a handpicked range of men's clothing crafted for the modern Bangladeshi wardrobe. From crisp formal shirts and relaxed-fit t-shirts to traditional panjabi and smart trousers, every piece is selected for fabric quality, precise tailoring, and lasting style.",
  },
  {
    heading: 'Free Delivery & Easy Returns',
    body: 'Enjoy free delivery on all orders above ৳1,500 — delivered right to your doorstep anywhere in Bangladesh. Not happy with your purchase? Return it within 7 days, no questions asked.',
  },
  {
    heading: 'Shop by Occasion & Season',
    body: 'Whether you need office wear, casual weekend outfits, or festive Eid attire, Togor & Tweed has you covered year-round. Browse seasonal collections updated weekly with the latest trends.',
  },
]

export default async function HomeSeoPage() {
  let initialSections = DEFAULT_SECTIONS
  try {
    const setting = await prisma.siteSettings.findUnique({ where: { key: 'home_seo_sections' } })
    if (setting?.value) {
      const parsed = JSON.parse(setting.value)
      if (Array.isArray(parsed) && parsed.length) initialSections = parsed
    }
  } catch { /* use defaults */ }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Home Page SEO Content</h1>
        <p className="text-gray-500 text-sm mt-1">
          Edit the informational text sections shown below the product grid on the{' '}
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            homepage
          </a>
          . Good for SEO — write naturally about your brand and offerings.
        </p>
      </div>

      <HomeSeoEditor initialSections={initialSections} />
    </div>
  )
}
