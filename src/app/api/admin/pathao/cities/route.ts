import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { pathaoCities } from '@/lib/pathao'

export async function GET() {
  const session = await auth()
  const sessionUser = session?.user as { role?: string; id?: string } | undefined
  let isAdmin = sessionUser?.role === 'ADMIN'
  if (!isAdmin && sessionUser?.id) {
    const { prisma } = await import('@/lib/prisma')
    const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { role: true } })
    isAdmin = dbUser?.role === 'ADMIN'
  }
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const cities = await pathaoCities()
    return NextResponse.json(cities)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
