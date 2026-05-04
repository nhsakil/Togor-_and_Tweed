// Admin route protection is handled server-side in src/app/admin/layout.tsx.
// This file satisfies Next.js 16 proxy convention with an empty matcher.
export function proxy() {}
export const config = { matcher: [] }

