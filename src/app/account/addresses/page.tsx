import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAddresses } from '@/actions/account'
import AddressBook from '@/components/account/AddressBook'

export const metadata = { title: 'My Addresses — Togor & Tweed' }

export default async function AddressesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const addresses = await getAddresses()

  return (
    <div className="bg-white p-6 md:p-8">
      <h2 className="font-playfair text-xl font-semibold mb-6">Saved Addresses</h2>
      <AddressBook initialAddresses={addresses} />
    </div>
  )
}
