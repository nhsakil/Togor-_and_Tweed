'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  onClose: () => void
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function LoginModal({ onClose }: Props) {
  const overlayRef  = useRef<HTMLDivElement>(null)
  const [gLoading, setGLoading] = useState(false)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', fn)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function handleGoogle() {
    setGLoading(true)
    await signIn('google', { callbackUrl: window.location.href })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative bg-white w-full max-w-[700px] flex overflow-hidden shadow-2xl"
        style={{ minHeight: '340px', maxHeight: '90vh' }}>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 text-[#888] hover:text-[#111] transition-colors"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* Left — fashion image */}
        <div
          className="hidden md:block w-[320px] flex-shrink-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1617137968427-85924c800a22?w=640&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundColor: '#111',
          }}
        />

        {/* Right — auth options */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10">
          <h2 className="text-[20px] font-black uppercase tracking-[0.06em] text-[#111] mb-1.5 text-center">
            Login or Signup
          </h2>
          <p className="text-[12px] text-[#888] text-center mb-7 leading-snug">
            Unlock coupons, profile and much more
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            className="w-full border border-[#ddd] text-[#111] text-[12px] font-semibold py-3 flex items-center justify-center gap-2.5 hover:border-[#111] hover:bg-[#f9f9f9] transition-colors mb-4 disabled:opacity-60"
          >
            <GoogleIcon />
            {gLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#eee]" />
            <span className="text-[11px] text-[#aaa] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#eee]" />
          </div>

          {/* Login / Create Account */}
          <Link
            href="/login"
            className="block w-full bg-[#111] text-white text-[12px] font-bold uppercase tracking-[0.12em] py-3.5 text-center hover:bg-[#333] transition-colors mb-2.5"
          >
            Login with Email
          </Link>
          <Link
            href="/register"
            className="block w-full border border-[#111] text-[#111] text-[12px] font-bold uppercase tracking-[0.12em] py-3.5 text-center hover:bg-[#f5f5f5] transition-colors"
          >
            Create Account
          </Link>

          <p className="text-[11px] text-[#bbb] text-center mt-5 leading-relaxed">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-[#555]">Terms</Link>
            {' '}&amp;{' '}
            <Link href="/privacy" className="underline hover:text-[#555]">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
