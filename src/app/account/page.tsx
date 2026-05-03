import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProfileForm from '@/components/account/ProfileForm'

export const metadata = { title: 'My Profile — Togor & Tweed' }

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true },
  }).catch(() => null)

  if (!user) redirect('/login')

  return (
    <div className="bg-white p-6 md:p-8">
      <h2 className="font-playfair text-xl font-semibold mb-6">Personal Information</h2>
      <ProfileForm user={user} />
    </div>
  )
}
