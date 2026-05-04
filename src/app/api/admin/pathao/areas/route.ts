import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import { pathaoAreas } from '@/lib/pathao'

export async function GET(req: Request) {
  if (!await requireAdmin()) return unauthorized()

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
