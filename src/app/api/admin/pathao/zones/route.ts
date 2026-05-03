import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { pathaoZones } from '@/lib/pathao'

export async function GET(req: Request) {
  const session = await auth()
  const sessionUser = session?.user as { role?: string; id?: string } | undefined
  let isAdmin = sessionUser?.role === 'ADMIN'
  if (!isAdmin && sessionUser?.id) {
    const { prisma } = await import('@/lib/prisma')
    const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { role: true } })
    isAdmin = dbUser?.role === 'ADMIN'
  }
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const cityId = Number(searchParams.get('city_id'))
  if (!cityId) return NextResponse.json({ error: 'city_id required' }, { status: 400 })

  try {
    const zones = await pathaoZones(cityId)
    return NextResponse.json(zones)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
