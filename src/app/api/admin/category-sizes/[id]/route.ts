import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()
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
  if (!await requireAdmin()) return unauthorized()
  const { id } = await params
  await prisma.categorySize.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
