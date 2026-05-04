import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import { pathaoCities } from '@/lib/pathao'

export async function GET() {
  if (!await requireAdmin()) return unauthorized()

  try {
    const cities = await pathaoCities()
    return NextResponse.json(cities)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
