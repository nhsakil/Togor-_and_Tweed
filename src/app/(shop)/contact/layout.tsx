import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import JsonLd from '@/components/seo/JsonLd'

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

export const metadata: Metadata = {
  title: 'Contact Us — Togor & Tweed Bangladesh Fashion',
  description: 'Get in touch with Togor & Tweed Bangladesh. Reach us by email, phone, or WhatsApp — we respond within 24 hours. Located in Dhaka, delivering nationwide.',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: 'Contact Us — Togor & Tweed Bangladesh',
    description: 'Questions or feedback? Reach the Togor & Tweed team by email, phone (+880 1700-000000), or WhatsApp. We respond within 24 hours.',
    type: 'website',
    images: [{ url: `${SITE_URL}/og?title=Contact+Us&subtitle=We+Respond+Within+24+Hours`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us — Togor & Tweed Bangladesh',
    description: 'Reach the Togor & Tweed team. We respond within 24 hours.',
  },
}

const CONTACT_BREADCRUMB_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Contact Us', item: `${SITE_URL}/contact` },
  ],
}

const LOCAL_BUSINESS_CONTACT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'ClothingStore'],
  name: 'Togor & Tweed',
  url: SITE_URL,
  telephone: '+8801700000000',
  email: 'hello@togorandtweed.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'House 12, Road 4, Block B, Bashundhara R/A',
    addressLocality: 'Dhaka',
    postalCode: '1229',
    addressCountry: 'BD',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '23.8103',
    longitude: '90.4125',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '10:00', closes: '19:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Friday'], opens: '14:00', closes: '19:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '10:00', closes: '17:00' },
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+8801700000000',
      email: 'hello@togorandtweed.com',
      availableLanguage: ['English', 'Bengali'],
      areaServed: 'BD',
    },
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      contactOption: 'TollFree',
      availableLanguage: ['Bengali'],
    },
  ],
  sameAs: [
    'https://instagram.com/togorandtweed',
    'https://facebook.com/togorandtweed',
  ],
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={CONTACT_BREADCRUMB_JSON_LD} />
      <JsonLd data={LOCAL_BUSINESS_CONTACT_JSON_LD} />
      {children}
    </>
  )
}
