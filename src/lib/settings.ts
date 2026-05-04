import { prisma } from '@/lib/prisma'

/**
 * Fetch one or more site-settings values by key.
 * Returns a Record<key, value> — missing keys are empty strings.
 * Safe to call from server components / layouts.
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSettings.findMany({ where: { key: { in: keys } } })
    const map: Record<string, string> = {}
    for (const row of rows) map[row.key] = row.value
    // fill missing keys with ''
    for (const k of keys) if (!(k in map)) map[k] = ''
    return map
  } catch {
    // DB not ready yet — return empty strings so layout doesn't crash
    const map: Record<string, string> = {}
    for (const k of keys) map[k] = ''
    return map
  }
}
