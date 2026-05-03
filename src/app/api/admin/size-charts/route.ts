import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const charts = await prisma.sizeChart.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { rows: true, categories: true, products: true } },
      },
    })
    return NextResponse.json({ data: charts })
  } catch {
    // Table may not exist yet — return empty list until migration is run
    return NextResponse.json({ data: [] })
  }
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { name, description, columns } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!Array.isArray(columns) || columns.length < 1)
    return NextResponse.json({ error: 'At least one column required' }, { status: 400 })
  try {
    const chart = await prisma.sizeChart.create({
      data: { name: name.trim(), description: description ?? null, columns: JSON.stringify(columns) },
    })
    return NextResponse.json({ data: chart }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create chart'
    if (msg.includes("doesn't exist") || msg.includes('Unknown table')) {
      return NextResponse.json({
        error: 'Run `npx prisma db push` first to create the size_charts table.',
      }, { status: 500 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
