export const SITE_NAME = 'Togor & Tweed'
export const SITE_TAGLINE = 'Wear the Story'
export const SITE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export const NAV_LINKS = [
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Best Sellers', href: '/collections/best-sellers' },
  { label: 'View All', href: '/collections' },
  { label: 'Sale', href: '/collections/sale' },
]

// Product type categories — shown in the category strip and featured categories section
// Slugs must match the `slug` field in the Category table in the database.
export const PRODUCT_CATEGORY_LINKS = [
  {
    label: 'Shirts',
    href: '/collections/shirts',
    imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80',
  },
  {
    label: 'Panjabi',
    href: '/collections/panjabi',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
  },
  {
    label: 'T-Shirt',
    href: '/collections/t-shirt',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  },
  {
    label: 'Polo',
    href: '/collections/polo',
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
  },
  {
    label: 'Trousers',
    href: '/collections/trousers',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
  },
]

/**
 * FEATURED categories — these five are the primary product types.
 * isFeatured = true on their DB categories makes them appear in
 * the homepage CategoryGrid and NewAndPopular sections.
 *
 * Run this seed snippet in prisma/seed.ts to mark them featured:
 *
 *   const featuredSlugs = ['shirts','panjabi','t-shirt','polo','trousers']
 *   await prisma.category.updateMany({
 *     where: { slug: { in: featuredSlugs } },
 *     data:  { isActive: true },
 *   })
 */
export const FEATURED_CATEGORY_SLUGS = [
  'shirts',
  'panjabi',
  't-shirt',
  'polo',
  'trousers',
] as const

export const FOOTER_LINKS = {
  shop: [
    { label: 'New Arrivals', href: '/collections/new-arrivals' },
    { label: 'Best Sellers', href: '/collections/best-sellers' },
    { label: 'Shirts', href: '/collections/shirts' },
    { label: 'Panjabi', href: '/collections/panjabi' },
    { label: 'Sale', href: '/collections/sale' },
  ],
  help: [
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Shipping & Returns', href: '/shipping' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
}

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

export const BANGLADESH_DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
]

export const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', description: 'Pay when your order arrives' },
  { id: 'bkash', label: 'bKash', icon: '📱', description: 'Pay via bKash mobile banking' },
  { id: 'nagad', label: 'Nagad', icon: '📱', description: 'Pay via Nagad mobile banking' },
]

export const ORDER_STATUSES = {
  PENDING: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50' },
  CONFIRMED: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50' },
  PROCESSING: { label: 'Processing', color: 'text-purple-600 bg-purple-50' },
  SHIPPED: { label: 'Shipped', color: 'text-indigo-600 bg-indigo-50' },
  DELIVERED: { label: 'Delivered', color: 'text-green-600 bg-green-50' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600 bg-red-50' },
  REFUNDED: { label: 'Refunded', color: 'text-gray-600 bg-gray-50' },
}

export const PRODUCTS_PER_PAGE = 24
export const SEARCH_RESULTS_LIMIT = 5
export const CART_EXPIRY_DAYS = 7
export const GUEST_CART_EXPIRY_HOURS = 24
