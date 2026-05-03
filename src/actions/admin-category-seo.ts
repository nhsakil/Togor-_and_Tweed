'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
}

export interface SeoSection {
  heading: string
  body: string
}

export async function saveCategorySeo(
  categoryId: string,
  sections: SeoSection[]
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin()
  try {
    const json = JSON.stringify(sections)
    await prisma.$executeRaw`UPDATE categories SET seoSections = ${json} WHERE id = ${categoryId}`
    revalidatePath('/admin/categories')
    revalidatePath('/collections', 'layout')
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Unknown column') || msg.includes('seoSections')) {
      return {
        ok: false,
        error:
          'Database column missing. Run: npx prisma db push && npx prisma generate, then restart the dev server.',
      }
    }
    return { ok: false, error: msg }
  }
}
