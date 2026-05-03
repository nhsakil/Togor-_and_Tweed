import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') return null
  return session
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { label, sortOrder, isActive } = await request.json()
  const updated = await prisma.categorySize.update({
    where: { id },
    data: {
      label:     label?.trim() ?? undefined,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      isActive:  isActive  !== undefined ? Boolean(isActive) : undefined,
    },
  })
  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.categorySize.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
