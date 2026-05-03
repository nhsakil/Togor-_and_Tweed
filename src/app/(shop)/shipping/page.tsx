import type { Metadata } from 'next'

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy — Togor & Tweed Bangladesh',
  description: 'Free delivery on orders over ৳1,500. Dhaka 1–2 days, nationwide 3–5 days. Cash on delivery available everywhere in Bangladesh. Easy 7-day returns.',
  alternates: { canonical: `${SITE_URL}/shipping` },
  openGraph: {
    title: 'Shipping & Delivery — Togor & Tweed Bangladesh',
    description: 'Free delivery on orders over ৳1,500. 1–2 day Dhaka delivery, 3–5 days nationwide. Easy returns & exchanges.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Shipping & Delivery — Togor & Tweed Bangladesh',
    description: 'Free delivery on orders over ৳1,500 anywhere in Bangladesh.',
  },
}

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl text-brand-black mb-2">Shipping &amp; Returns</h1>
      <p className="text-gray-500 mb-12">Everything you need to know about delivery and how to return or exchange an item.</p>

      {/* Shipping */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl text-brand-black mb-6 pb-2 border-b border-gray-200">Shipping</h2>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div>
            <h3 className="font-semibold text-brand-black mb-2">Delivery Areas</h3>
            <p>We deliver to all eight divisions of Bangladesh: Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, and Mymensingh.</p>
          </div>

          <div>
            <h3 className="font-semibold text-brand-black mb-2">Estimated Delivery Times</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-brand-black border border-gray-200">Location</th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-black border border-gray-200">Standard Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Dhaka (within city)', '1–2 business days'],
                    ['Chattogram', '2–3 business days'],
                    ['Rajshahi, Khulna, Sylhet', '3–4 business days'],
                    ['Barishal, Rangpur, Mymensingh', '3–5 business days'],
                  ].map(([loc, time]) => (
                    <tr key={loc} className="even:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-200">{loc}</td>
                      <td className="px-4 py-3 border border-gray-200">{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-400">Business days: Sunday–Thursday. Orders placed before 2:00 PM are dispatched the same day (subject to stock).</p>
          </div>

          <div>
            <h3 className="font-semibold text-brand-black mb-2">Shipping Charges</h3>
            <p>Free shipping on all orders above <strong>৳1,500</strong>. Orders below ৳1,500 incur a flat shipping fee of ৳80 (Dhaka) or ৳120 (outside Dhaka).</p>
          </div>

          <div>
            <h3 className="font-semibold text-brand-black mb-2">Order Tracking</h3>
            <p>Once dispatched, you will receive an SMS and email with your tracking details. You can also view your order status at any time under <a href="/account/orders" className="text-brand-gold hover:underline">My Account → Orders</a>.</p>
          </div>
        </div>
      </section>

      {/* Returns */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl text-brand-black mb-6 pb-2 border-b border-gray-200">Returns &amp; Exchanges</h2>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div>
            <h3 className="font-semibold text-brand-black mb-2">Return Window</h3>
            <p>You may return items within <strong>7 days</strong> of the delivery date.</p>
          </div>

          <div>
            <h3 className="font-semibold text-brand-black mb-2">Eligibility Conditions</h3>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Item must be unworn, unwashed, and undamaged</li>
              <li>All original tags must be attached</li>
              <li>Item must be in its original packaging where applicable</li>
              <li>Sale items are non-refundable (exchange or store credit only)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-brand-black mb-2">How to Return</h3>
            <ol className="list-decimal list-inside space-y-2 ml-1">
              <li>Contact us via <a href="/contact" className="text-brand-gold hover:underline">our Contact page</a> or WhatsApp (+880 1700-000000) with your order number</li>
              <li>Our team will confirm eligibility and arrange a pickup within 48 hours</li>
              <li>Refunds are processed within 5–7 business days after we receive and inspect the item</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-brand-black mb-2">Exchanges</h3>
            <p>Size and colour exchanges are available free of charge within the 7-day window, subject to stock availability. If the requested size is unavailable, we will issue store credit.</p>
          </div>

          <div>
            <h3 className="font-semibold text-brand-black mb-2">Refund Method</h3>
            <p>Refunds are issued to the original payment method (bKash/Nagad) or as store credit. Cash on Delivery refunds are processed via bKash transfer.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded">
            <p className="font-semibold text-amber-800 mb-1">Damaged or Incorrect Items</p>
            <p className="text-amber-700">If you received a damaged or wrong item, please contact us within 48 hours of delivery with a photo. We will arrange a replacement or full refund at no cost to you.</p>
          </div>
        </div>
      </section>

      <p className="text-sm text-gray-500">
        Questions? <a href="/contact" className="text-brand-gold hover:underline">Get in touch</a> and we&apos;ll be happy to help.
      </p>
    </div>
  )
}
