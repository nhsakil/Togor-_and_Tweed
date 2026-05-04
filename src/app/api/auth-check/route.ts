import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

// Admin-only endpoint: returns current session info
// GET /api/auth-check
export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  return NextResponse.json({
    email: session.user?.email ?? null,
    role: (session.user as { role?: string })?.role ?? null,
  })
}
