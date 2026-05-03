import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Togor & Tweed Bangladesh',
  description: 'Answers to common questions about ordering, shipping, returns, sizing, and payment at Togor & Tweed Bangladesh. Free delivery over ৳1,500. Cash on delivery available.',
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: 'FAQ — Togor & Tweed Bangladesh',
    description: 'Everything you need to know about ordering, delivery, returns, sizing, and payment at Togor & Tweed.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'FAQ — Togor & Tweed Bangladesh',
    description: 'Answers to common questions about ordering, shipping, returns, sizing, and payment.',
  },
}

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long does delivery take?',
      acceptedAnswer: { '@type': 'Answer', text: 'Orders within Dhaka are typically delivered within 1–2 business days. For other divisions (Chattogram, Rajshahi, Khulna, etc.) please allow 3–5 business days.' },
    },
    {
      '@type': 'Question',
      name: 'Do you offer free shipping?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes! Orders over ৳1,500 qualify for free shipping across Bangladesh. Standard delivery charges apply to orders below this threshold.' },
    },
    {
      '@type': 'Question',
      name: 'What is your return policy?',
      acceptedAnswer: { '@type': 'Answer', text: 'We accept returns within 7 days of delivery for items in their original, unworn condition with all tags attached.' },
    },
    {
      '@type': 'Question',
      name: 'Can I exchange for a different size?',
      acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. Size exchanges are processed free of charge if requested within 7 days of delivery, subject to stock availability.' },
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: { '@type': 'Answer', text: 'We accept Cash on Delivery (COD), bKash, and Nagad. More payment options are coming soon.' },
    },
    {
      '@type': 'Question',
      name: 'Is Cash on Delivery available everywhere?',
      acceptedAnswer: { '@type': 'Answer', text: 'COD is available for all divisions across Bangladesh.' },
    },
    {
      '@type': 'Question',
      name: 'How do I find my size?',
      acceptedAnswer: { '@type': 'Answer', text: 'Each product page has a "Size Guide" link. We recommend measuring your chest, waist, and length and comparing against our size chart for the best fit.' },
    },
    {
      '@type': 'Question',
      name: 'Do you ship outside Bangladesh?',
      acceptedAnswer: { '@type': 'Answer', text: 'We currently only ship within Bangladesh. International shipping is on our roadmap — stay tuned!' },
    },
  ],
}

const SITE_URL_LAYOUT = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'

const BREADCRUMB_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL_LAYOUT },
    { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${SITE_URL_LAYOUT}/faq` },
  ],
}

export default function FaqLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
      />
      {children}
    </>
  )
}
