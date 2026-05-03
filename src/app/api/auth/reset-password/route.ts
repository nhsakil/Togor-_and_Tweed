import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { resetPasswordSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 422 })
  }

  const { token, password } = parsed.data
  const email = body.email as string | undefined

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Look up the token
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token },
  })

  if (!record) {
    return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
  }

  if (record.expires < new Date()) {
    // Clean up expired token
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 })
  }

  // Hash new password and update user
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  })

  // Delete used token
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })

  return NextResponse.json({ success: true })
}
