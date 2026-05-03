'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { toast } from 'sonner'

// Note: metadata must be in a separate server component when using 'use client'
// For now we rely on the root layout title template.

export default function ContactPage() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // TODO: wire to /api/contact when email (Resend) is configured
    await new Promise((r) => setTimeout(r, 800))
    toast.success('Message sent! We\'ll get back to you within 24 hours.')
    setName(''); setEmail(''); setSubject(''); setMessage('')
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl text-brand-black mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-12">We&apos;d love to hear from you. Send us a message and we&apos;ll respond within 24 hours.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold bg-white"
            >
              <option value="">Select a subject</option>
              <option value="order">Order Inquiry</option>
              <option value="return">Return / Exchange</option>
              <option value="product">Product Question</option>
              <option value="wholesale">Wholesale</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Tell us how we can help..."
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-gold resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-black text-white py-3.5 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send Message'}
          </button>
        </form>

        {/* Contact info */}
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-xl text-brand-black mb-3">Our Office</h2>
            <address className="not-italic text-sm text-gray-600 leading-relaxed">
              Togor &amp; Tweed<br />
              House 12, Road 4, Block B<br />
              Bashundhara R/A<br />
              Dhaka 1229, Bangladesh
            </address>
          </div>

          <div>
            <h2 className="font-serif text-xl text-brand-black mb-3">Business Hours</h2>
            <p className="text-sm text-gray-600">Sunday – Thursday: 10:00 AM – 7:00 PM</p>
            <p className="text-sm text-gray-600">Friday: 2:00 PM – 7:00 PM</p>
            <p className="text-sm text-gray-600">Saturday: 10:00 AM – 5:00 PM</p>
          </div>

          <div>
            <h2 className="font-serif text-xl text-brand-black mb-3">Reach Us</h2>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Email:</span>{' '}
              <a href="mailto:hello@togorandtweed.com" className="text-brand-gold hover:underline">
                hello@togorandtweed.com
              </a>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Phone / WhatsApp:</span> +880 1700-000000
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl text-brand-black mb-3">Order Support</h2>
            <p className="text-sm text-gray-600">
              For order status or tracking, please have your order number (e.g. TT-20260417-001) ready
              when you get in touch.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
