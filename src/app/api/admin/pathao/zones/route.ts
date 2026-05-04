import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import { pathaoZones } from '@/lib/pathao'

export async function GET(req: Request) {
  if (!await requireAdmin()) return unauthorized()

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
