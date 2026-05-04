import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const BASE = (process.env.PATHAO_BASE_URL ?? 'https://courier-api-sandbox.pathao.com/aladdin/api/v1').replace(/\/$/, '')

export async function GET() {
  if (!await requireAdmin()) return unauthorized()

  try {
    // Get token
    const tokenRes = await fetch(`${BASE}/issue-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PATHAO_CLIENT_ID, client_secret: process.env.PATHAO_CLIENT_SECRET,
        username: process.env.PATHAO_USERNAME, password: process.env.PATHAO_PASSWORD,
        grant_type: 'password',
      }),
      cache: 'no-store',
    })
    const tokenData = await tokenRes.json()
    const token = tokenData.access_token

    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }

    // Raw city response
    const cityRaw = await fetch(`${BASE}/city-list`, { headers, cache: 'no-store' }).then(r => r.json())

    // Pick first city for zone probe
    const cities: { city_id: number }[] =
      Array.isArray(cityRaw?.data?.data) ? cityRaw.data.data :
      Array.isArray(cityRaw?.data)       ? cityRaw.data :
      Array.isArray(cityRaw)             ? cityRaw : []

    let zoneRaw = null
    const zoneAlts: Record<string, unknown> = {}
    if (cities[0]) {
      const cid = cities[0].city_id
      // Try multiple zone endpoint patterns to find which one Hermes supports
      const patterns = [
        `/cities/${cid}/zone-list`,
        `/zone-list?city_id=${cid}`,
        `/zones?city_id=${cid}`,
      ]
      for (const p of patterns) {
        try {
          zoneAlts[p] = await fetch(`${BASE}${p}`, { headers, cache: 'no-store' }).then(r => r.json())
        } catch (e) {
          zoneAlts[p] = { fetchError: String(e) }
        }
      }
      zoneRaw = zoneAlts[`/cities/${cid}/zone-list`]
    }

    // Raw stores
    const storeRaw = await fetch(`${BASE}/stores`, { headers, cache: 'no-store' }).then(r => r.json())

    return NextResponse.json({ cityRaw, zoneRaw, zoneAlts, storeRaw })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
