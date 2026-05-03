import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

/**
 * Lightweight auth config used in Edge middleware.
 * Does NOT import Prisma — safe for Edge runtime.
 *
 * Google is conditionally included (same as auth.ts) so that
 * the middleware doesn't throw when credentials aren't set.
 */
const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId:     process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  providers: [
    ...googleProvider,
    // Credentials provider with no authorize — actual authorization is in auth.ts
    Credentials({}),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn   = !!auth?.user
      const isProtected  = nextUrl.pathname.startsWith('/account') ||
                           nextUrl.pathname.startsWith('/checkout')
      const isAuthRoute  = nextUrl.pathname.startsWith('/login') ||
                           nextUrl.pathname.startsWith('/register') ||
                           nextUrl.pathname.startsWith('/forgot-password')
      const isAdminRoute = nextUrl.pathname.startsWith('/admin')

      if (isAdminRoute) {
        if (!isLoggedIn) return false
        // Only ADMIN and SUPER_ADMIN may access the admin area
        const role = (auth?.user as { role?: string })?.role
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
          return Response.redirect(new URL('/', nextUrl))
        }
        return true
      }

      if (isProtected && !isLoggedIn) return false
      if (isAuthRoute  &&  isLoggedIn) {
        return Response.redirect(new URL('/account', nextUrl))
      }
      return true
    },
  },
}
