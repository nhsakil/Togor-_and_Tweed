import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Togor & Tweed terms and conditions — rules governing use of our website and purchase of our fashion products in Bangladesh.',
  openGraph: {
    title: 'Terms & Conditions — Togor & Tweed',
    description: 'Terms governing use of the Togor & Tweed website and purchase of our products.',
    type: 'website',
  },
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl text-brand-black mb-2">Terms &amp; Conditions</h1>
      <p className="text-gray-500 mb-10">Last updated: April 2026</p>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Togor &amp; Tweed website (togorandtweed.com) or placing an order, you agree
            to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our website.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">2. Use of the Website</h2>
          <p>You agree to use this website only for lawful purposes. You must not:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-3">
            <li>Use the site in a way that may cause damage, impair availability, or gain unauthorised access</li>
            <li>Transmit unsolicited advertising or promotional material</li>
            <li>Use automated tools to scrape, crawl, or extract data</li>
            <li>Attempt to impersonate Togor &amp; Tweed or any of its staff</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">3. Account Registration</h2>
          <p>
            You may register for an account to track orders and save preferences. You are responsible for
            maintaining the confidentiality of your account credentials and for all activities under your account.
            Notify us immediately if you suspect any unauthorised use.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">4. Orders &amp; Pricing</h2>
          <p>
            All prices are displayed in Bangladeshi Taka (৳) and include applicable taxes. Prices are subject
            to change without notice. We reserve the right to refuse or cancel any order at our discretion,
            including in cases of pricing errors, stock issues, or suspected fraud. If an order is cancelled
            after payment, a full refund will be issued.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">5. Payment</h2>
          <p>
            We accept Cash on Delivery, bKash, and Nagad. By placing an order, you confirm that you are authorised
            to use the selected payment method. For COD orders, payment is due at the time of delivery.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">6. Shipping &amp; Delivery</h2>
          <p>
            Delivery timelines are estimates and are not guaranteed. Togor &amp; Tweed is not liable for delays
            caused by third-party couriers, natural events, or circumstances beyond our control. Risk of loss
            passes to you upon delivery.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">7. Returns &amp; Refunds</h2>
          <p>
            Returns and exchanges are governed by our{' '}
            <a href="/shipping" className="text-brand-gold hover:underline">Shipping &amp; Returns policy</a>, which forms part of these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">8. Intellectual Property</h2>
          <p>
            All content on this website — including text, images, logos, and designs — is the property of
            Togor &amp; Tweed and is protected by applicable intellectual property laws. You may not reproduce,
            distribute, or create derivative works without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">9. Disclaimer of Warranties</h2>
          <p>
            This website and its content are provided &quot;as is&quot; without any warranty of any kind. We do not warrant
            that the website will be uninterrupted, error-free, or free of viruses. To the fullest extent
            permitted by law, we disclaim all warranties, express or implied.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Togor &amp; Tweed shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the website or any products purchased
            through it.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">11. Governing Law</h2>
          <p>
            These Terms &amp; Conditions are governed by the laws of Bangladesh. Any disputes shall be subject
            to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">12. Changes to These Terms</h2>
          <p>
            We may update these Terms &amp; Conditions at any time. Changes take effect upon posting to this page.
            Continued use of the website constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-brand-black mb-3">13. Contact</h2>
          <p>
            Questions about these terms? <a href="/contact" className="text-brand-gold hover:underline">Contact us</a> or email{' '}
            <a href="mailto:hello@togorandtweed.com" className="text-brand-gold hover:underline">hello@togorandtweed.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
