'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: wire to Resend newsletter list
    setSubmitted(true)
  }

  if (submitted) {
    return <p className="text-sm text-brand-gold">Thank you for subscribing!</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Your email"
        className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm px-3 py-2 focus:outline-none focus:border-brand-gold"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="bg-brand-gold text-white px-3 py-2 hover:bg-brand-gold-dark transition-colors"
      >
        <Send size={14} />
      </button>
    </form>
  )
}
