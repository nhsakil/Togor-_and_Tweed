import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin, unauthorized } from '@/lib/admin-auth'

// PATCH /api/admin/users/[id]/role  body: { role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireSuperAdmin()) return unauthorized()

  const { id } = await params
  const { role } = await request.json()

  const allowed = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']
  if (!allowed.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Prevent demoting yourself
  const session = await import('@/lib/auth').then(m => m.auth())
  if ((session?.user as { id?: string })?.id === id && role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, role: true },
  })

  return NextResponse.json({ data: user })
}
