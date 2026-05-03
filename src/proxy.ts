import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Admin route protection is handled server-side in src/app/admin/layout.tsx.
// This proxy is intentionally a pass-through.
export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
