import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Providers from '@/components/layout/Providers'
import { getSettings } from '@/lib/settings'
import './globals.css'

// SR: prevent Next.js from pre-rendering any page at build time
// — all pages use Prisma which requires DATABASE_URL at runtime, not build time
export const dynamic = 'force-dynamic'

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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Load Google integration keys from DB (admin-configurable via Site Settings)
  // Falls back to env vars so existing deployments keep working without a DB round-trip change
  const gs = await getSettings([
    'ga_measurement_id',
    'gtm_container_id',
    'gsc_verification',
  ])

  const gaId  = gs.ga_measurement_id  || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
  const gtmId = gs.gtm_container_id   || ''
  const gscCode = gs.gsc_verification || ''

  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Preconnect to external origins to reduce DNS + TLS handshake time for LCP */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* Google Search Console — meta verification tag */}
        {gscCode && (
          <meta name="google-site-verification" content={gscCode} />
        )}

        {/* Google Tag Manager — <head> snippet */}
        {gtmId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}
      </head>
      <body>
        {/* Google Tag Manager — <body> noscript fallback */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0" width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Skip-to-content: hidden until focused via keyboard — accessibility + SEO */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:border focus:border-[#111] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#111]"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>

        {/* GA4 — loads only when a Measurement ID is configured (DB setting takes priority over env var) */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{page_path:window.location.pathname,send_page_view:true});`,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}
