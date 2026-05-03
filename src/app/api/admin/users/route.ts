import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireSuperAdmin, unauthorized } from '@/lib/admin-auth'

// GET /api/admin/users?role=admin|customer&search=&page=
export async function GET(request: NextRequest) {
  if (!await requireAdmin()) return unauthorized()

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const search = searchParams.get('search') ?? ''
  const roleFilter = searchParams.get('role') // 'admin' | 'customer'
  const skip = (page - 1) * limit

  const roleWhere = roleFilter === 'admin'
    ? { role: { in: ['ADMIN', 'SUPER_ADMIN'] as const } }
    : roleFilter === 'customer'
    ? { role: 'CUSTOMER' as const }
    : {}

  const searchWhere = search
    ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
    : {}

  const where = { ...roleWhere, ...searchWhere }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        image: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

// POST /api/admin/users — SUPER_ADMIN creates a new admin account
// Body: { name, email, password, role: 'ADMIN' | 'SUPER_ADMIN' }
export async function POST(request: NextRequest) {
  if (!await requireSuperAdmin()) return unauthorized()

  const { name, email, password, role } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name: name || null, email, passwordHash, role },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json({ data: user }, { status: 201 })
}
