import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') return null
  return session
}

export async function GET(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const categoryId = request.nextUrl.searchParams.get('categoryId')
  try {
    if (!categoryId) {
      const cats = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: { sizes: { orderBy: { sortOrder: 'asc' } } },
      })
      return NextResponse.json({ data: cats })
    }
    const sizes = await prisma.categorySize.findMany({
      where: { categoryId },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ data: sizes })
  } catch {
    // Table may not exist yet — return empty list
    return NextResponse.json({ data: [] })
  }
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { categoryId, label, sortOrder } = await request.json()
  if (!categoryId || !label?.trim())
    return NextResponse.json({ error: 'categoryId and label required' }, { status: 400 })
  try {
    const size = await prisma.categorySize.create({
      data: { categoryId, label: label.trim(), sortOrder: sortOrder ?? 0 },
    })
    return NextResponse.json({ data: size }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed'
    if (msg.includes("doesn't exist") || msg.includes('Unknown table')) {
      return NextResponse.json({
        error: 'Run `npx prisma db push` first to create the category_sizes table.',
      }, { status: 500 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
