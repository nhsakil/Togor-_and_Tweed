import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Togor & Tweed privacy policy — how we collect, use, and protect your personal information when you shop with us.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Privacy Policy — Togor & Tweed',
    description: 'How Togor & Tweed collects, uses, and protects your personal information.',
    type: 'website',
  },
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl text-brand-black mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-10">Last updated: April 2026</p>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">1. Introduction</h2>
          <p>
            Togor &amp; Tweed (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website togorandtweed.com. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you visit our website
            or place an order with us. Please read this policy carefully.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">2. Information We Collect</h2>
          <p className="mb-3"><strong>Information you provide to us:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
            <li>Name, email address, phone number</li>
            <li>Delivery address (division, district, area, postal code)</li>
            <li>Order history and payment method preference</li>
            <li>Account credentials (email and hashed password)</li>
            <li>Messages sent via our Contact form</li>
          </ul>
          <p className="mb-3"><strong>Information collected automatically:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>IP address and browser type</li>
            <li>Pages visited and time spent on site</li>
            <li>Device information</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>To process and fulfil your orders</li>
            <li>To send order confirmations, shipping updates, and receipts</li>
            <li>To respond to your inquiries and provide customer support</li>
            <li>To improve our website and product offerings</li>
            <li>To send marketing communications (only with your consent)</li>
            <li>To detect and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">4. Sharing Your Information</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your
            information with:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-3">
            <li><strong>Delivery partners</strong> — to fulfil your orders (name, address, phone)</li>
            <li><strong>Payment processors</strong> — bKash and Nagad process transactions on their own secure platforms; we do not store payment credentials</li>
            <li><strong>Service providers</strong> — email, analytics, and hosting services that assist our operations</li>
            <li><strong>Legal authorities</strong> — when required by law or to protect our rights</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">5. Cookies</h2>
          <p>
            We use cookies to maintain your session (shopping cart, login), analyse site traffic via Google Analytics,
            and improve user experience. You can disable cookies in your browser settings, though some features
            may not function correctly.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">6. Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal data from
            unauthorised access, alteration, disclosure, or destruction. Passwords are stored using industry-standard
            hashing algorithms and are never stored in plaintext.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">7. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfil the purposes described in this
            policy, or as required by law. You may request deletion of your account and associated data at any time
            by contacting us.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-3">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications at any time</li>
          </ul>
          <p className="mt-3">To exercise these rights, contact us at <a href="mailto:hello@togorandtweed.com" className="text-brand-gold hover:underline">hello@togorandtweed.com</a>.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an
            updated &quot;Last updated&quot; date. Continued use of our website constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">10. Contact</h2>
          <p>
            Questions about this Privacy Policy? Contact us at{' '}
            <a href="/contact" className="text-brand-gold hover:underline">our Contact page</a> or email{' '}
            <a href="mailto:hello@togorandtweed.com" className="text-brand-gold hover:underline">hello@togorandtweed.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
