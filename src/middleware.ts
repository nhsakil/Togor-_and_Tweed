import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Admin route protection is handled server-side in src/app/admin/layout.tsx
// via auth() + redirect(). This middleware is a pass-through only.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Empty matcher — middleware never actually runs
export const config = {
  matcher: [],
}
