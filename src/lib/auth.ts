import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { loginSchema } from '@/lib/validations/auth'
import { authConfig } from '@/lib/auth.config'

/**
 * Google OAuth is only wired in when BOTH env vars are present.
 * Without this guard the app crashes at startup in dev when the
 * vars are commented-out — which is why "Continue with Google"
 * showed an error even before the OAuth flow started.
 *
 * To enable Google sign-in:
 *  1. Create OAuth 2.0 credentials in Google Cloud Console
 *  2. Add Authorised redirect URI:
 *       http://localhost:3000/api/auth/callback/google   (dev)
 *       https://yourdomain.com/api/auth/callback/google  (prod)
 *  3. Set in .env.local:
 *       GOOGLE_CLIENT_ID=<your-client-id>
 *       GOOGLE_CLIENT_SECRET=<your-client-secret>
 */
const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId:     process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              // Always show account picker so users can switch Google accounts
              prompt: 'select_account',
            },
          },
        }),
      ]
    : []

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    ...googleProvider,
    Credentials({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id:           true,
            email:        true,
            name:         true,
            image:        true,
            passwordHash: true,
            role:         true,
          },
        })

        if (!user || !user.passwordHash) return null

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatch) return null

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          image: user.image,
          role:  user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as { role?: string }).role ?? 'CUSTOMER'
      }
      // Refresh role from DB on sign-in so promotions take effect immediately.
      // Wrapped in try/catch so a transient DB error never breaks the session.
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          })
          if (dbUser) token.role = dbUser.role
        } catch {
          // DB unavailable — keep existing token.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
})
