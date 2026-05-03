import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Temporary debug endpoint — shows your current session role
// Visit https://ekinben.com/api/auth-check while logged in
export async function GET() {
  const session = await auth()
  return NextResponse.json({
    loggedIn: !!session?.user,
    email: session?.user?.email ?? null,
    role: (session?.user as { role?: string })?.role ?? null,
  })
}
