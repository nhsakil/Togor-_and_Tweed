import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Togor & Tweed Bangladesh. Reach us by email, phone, or WhatsApp — we respond within 24 hours.',
  openGraph: {
    title: 'Contact Us — Togor & Tweed Bangladesh',
    description: 'Questions or feedback? Reach the Togor & Tweed team by email, phone, or WhatsApp. We respond within 24 hours.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us — Togor & Tweed Bangladesh',
    description: 'Reach the Togor & Tweed team. We respond within 24 hours.',
  },
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
