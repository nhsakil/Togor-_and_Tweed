import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import { pathaoStores } from '@/lib/pathao'

export async function GET() {
  if (!await requireAdmin()) return unauthorized()

  try {
    const stores = await pathaoStores()
    return NextResponse.json(stores)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
