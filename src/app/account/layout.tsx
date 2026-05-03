import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import AccountSidebar from '@/components/account/AccountSidebar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/account')

  return (
    <>
      <Header />
      {/* Spacer: announcement (32px) + nav (60px) + category strip (45px) = 137px desktop; mobile 90px */}
      <div className="h-[90px] md:h-[137px]" />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold mb-8">My Account</h1>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
            <AccountSidebar user={session.user} />
            <main>{children}</main>
          </div>
        </div>
      </div>
      <Footer />
      <CartDrawer />
    </>
  )
}
