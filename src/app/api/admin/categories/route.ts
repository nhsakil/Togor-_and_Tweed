import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export async function GET() {
  if (!await requireAdmin()) return unauthorized()

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
  })

  return NextResponse.json({ data: categories })
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return unauthorized()

  try {
    const body = await request.json()
    const { name, slug, description, parentId, imageUrl, sortOrder, isActive } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description ?? null,
        parentId: parentId ?? null,
        imageUrl: imageUrl ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
    })

    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
