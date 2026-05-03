import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { pathaoAreas } from '@/lib/pathao'

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
  const zoneId = Number(searchParams.get('zone_id'))
  if (!zoneId) return NextResponse.json({ error: 'zone_id required' }, { status: 400 })

  try {
    const areas = await pathaoAreas(zoneId)
    return NextResponse.json(areas)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
