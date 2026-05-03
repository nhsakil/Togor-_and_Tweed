'use server'

import { prisma } from '@/lib/prisma'

export interface SeoSection {
  heading: string
  body: string
}

export async function saveHomeSeo(
  sections: SeoSection[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const json = JSON.stringify(sections)
    // Upsert into siteSettings
    await prisma.siteSettings.upsert({
      where:  { key: 'home_seo_sections' },
      update: { value: json },
      create: { key: 'home_seo_sections', value: json },
    })
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: msg }
  }
}
