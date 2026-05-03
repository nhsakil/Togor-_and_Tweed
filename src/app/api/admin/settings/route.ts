import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') return null
  return session
}

// GET /api/admin/settings?keys=logo_url,hero_panels
export async function GET(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const keysParam = searchParams.get('keys')
  const keys = keysParam ? keysParam.split(',') : null

  try {
    const rows = await prisma.siteSettings.findMany({
      where: keys ? { key: { in: keys } } : undefined,
    })
    const data: Record<string, string> = {}
    for (const row of rows) data[row.key] = row.value
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: {} })
  }
}

// PUT /api/admin/settings  body: { key: string, value: string }
export async function PUT(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { key, value } = body
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  try {
    const row = await prisma.siteSettings.upsert({
      where: { key },
      create: { key, value: value ?? '' },
      update: { value: value ?? '' },
    })
    // Bust the Header cache so logo/hero changes show immediately
    revalidateTag('site-settings')
    return NextResponse.json({ data: row })
  } catch {
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
  }
}
