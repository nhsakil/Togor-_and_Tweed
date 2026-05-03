import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  let logoUrl: string | null = null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = await (prisma.siteSettings as any).findFirst({ select: { logo_url: true } })
    logoUrl = s?.logo_url ?? null
  } catch { /* logo column may not exist yet */ }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal checkout header */}
      <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {logoUrl ? (
            <Image src={logoUrl} alt={SITE_NAME} width={120} height={40} className="object-contain max-h-10 w-auto" priority />
          ) : (
            <span className="font-playfair text-xl font-bold text-[#111]">{SITE_NAME}</span>
          )}
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#aaa]">
          Secure Checkout
        </span>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
