import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const
export type AdminRole = typeof ADMIN_ROLES[number]

/** Returns session if user is ADMIN or SUPER_ADMIN, else null */
export async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  if (!session?.user || !ADMIN_ROLES.includes(role as AdminRole)) return null
  return session
}

/** Returns session if user is SUPER_ADMIN only */
export async function requireSuperAdmin() {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  if (!session?.user || role !== 'SUPER_ADMIN') return null
  return session
}

/** Standard 401 response */
export const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
