import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Providers from '@/components/layout/Providers'
import './globals.css'

/* Plus Jakarta Sans — closest free match to Snitch's NewHeroTRIAL geometric sans */
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const inter   = { variable: '--font-inter' }    // stub — kept so imports don't break
const playfair = { variable: '--font-playfair' } // stub — kept so class references don't break

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

export const metadata: Metadata = {
  title: {
    default: 'Togor & Tweed — Wear the Story',
    template: '%s | Togor & Tweed',
  },
  description:
    'Discover premium fashion at Togor & Tweed Bangladesh. Shop shirts, panjabi, t-shirts, polo & trousers — free delivery on orders over ৳1,500. Cash on delivery available.',
  keywords: [
    'fashion Bangladesh',
    'clothing Dhaka',
    'Togor & Tweed',
    'premium apparel Bangladesh',
    'panjabi Bangladesh',
    'men shirts Dhaka',
    'affordable fashion Bangladesh',
    'online fashion store Bangladesh',
    'buy clothes online Bangladesh',
    'polo shirt Bangladesh',
    't-shirt online Bangladesh',
    'men trousers Bangladesh',
    'eid panjabi Bangladesh',
    'cotton shirts Bangladesh',
    'cash on delivery clothing Bangladesh',
    'menswear Dhaka',
    'online shopping Bangladesh clothing',
  ],
  openGraph: {
    title: 'Togor & Tweed — Wear the Story',
    description: "Premium men's fashion from Bangladesh. Shop shirts, panjabi, t-shirts, polo & trousers. Free delivery over ৳1,500. COD available.",
    type: 'website',
    locale: 'en_US',
    siteName: 'Togor & Tweed',
    images: [
      {
        url: `${SITE_URL}/og?title=Togor+%26+Tweed&subtitle=Wear+the+Story`,
        width: 1200,
        height: 630,
        alt: 'Togor & Tweed — Premium Bangladesh Fashion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Togor & Tweed — Wear the Story',
    description: "Premium men's fashion from Bangladesh. Shop shirts, panjabi, t-shirts, polo & trousers. Free delivery over ৳1,500.",
    images: [`${SITE_URL}/og?title=Togor+%26+Tweed&subtitle=Wear+the+Story`],
  },
  metadataBase: new URL(SITE_URL),
  // ─── Google Search Console ───────────────────────────────────────────────────
  // When your domain is live, add your verification code here:
  // verification: { google: 'YOUR_GSC_VERIFICATION_CODE_HERE' },
  // ─────────────────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Preconnect to external origins to reduce DNS + TLS handshake time for LCP */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <Providers>{children}</Providers>

        {/* GA4 — fires only in production when env var is set */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              defer
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                    send_page_view: true,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}
