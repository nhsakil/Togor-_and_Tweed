// NOTE: Next.js middleware runs on Edge runtime which Hostinger Phusion Passenger
// does not fully support. Admin route protection is handled server-side in
// src/app/admin/layout.tsx via auth() + redirect() instead.
//
// This file intentionally exports nothing so Next.js skips middleware processing.

export const config = {
  matcher: [],
}
