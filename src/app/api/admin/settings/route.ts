import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

// GET /api/admin/settings?keys=logo_url,hero_panels
export async function GET(request: NextRequest) {
  if (!await requireAdmin()) return unauthorized()

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
  if (!await requireAdmin()) return unauthorized()

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
    // SR: fixed — Next.js 16 changed revalidateTag type signature; revalidatePath is stable
    revalidatePath('/', 'layout')
    return NextResponse.json({ data: row })
  } catch {
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
  }
}
