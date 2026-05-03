import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import CheckoutCartSummary from '@/components/checkout/CheckoutCartSummary'

export const metadata = { title: 'Checkout — Togor & Tweed', robots: { index: false, follow: false } }

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/checkout')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
      <div className="bg-white p-6 md:p-8">
        <CheckoutForm />
      </div>
      <div className="order-first lg:order-last">
        <CheckoutCartSummary />
      </div>
    </div>
  )
}
