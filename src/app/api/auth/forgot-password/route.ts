import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordReset } from '@/lib/resend'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 422 })
  }

  const { email } = parsed.data

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ success: true })

  // Create a verification token
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Delete any existing tokens for this email first, then create fresh
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  await sendPasswordReset({ to: email, resetUrl }).catch(console.error)

  return NextResponse.json({ success: true })
}
