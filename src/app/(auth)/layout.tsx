import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

async function getLogoUrl(): Promise<string | null> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { key: 'logo_url' } })
    return row?.value ?? null
  } catch {
    return null
  }
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const logoUrl = await getLogoUrl()

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      {/* Minimal header with logo */}
      <header className="py-5 text-center border-b bg-white">
        <Link href="/" className="inline-flex items-center justify-center">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={SITE_NAME}
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          ) : (
            <span className="font-serif text-xl font-bold text-brand-black tracking-wide">
              {SITE_NAME}
            </span>
          )}
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {SITE_NAME}
      </footer>
    </div>
  )
}
