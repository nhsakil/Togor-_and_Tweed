import { prisma } from '@/lib/prisma'
import FooterClient, { type SocialLinks } from './FooterClient'

const SOCIAL_KEYS = [
  'social_facebook',
  'social_instagram',
  'social_linkedin',
  'social_google',
  'social_tiktok',
  'social_whatsapp',
]

export default async function Footer() {
  const rows = await prisma.siteSettings
    .findMany({ where: { key: { in: SOCIAL_KEYS } } })
    .catch(() => [])

  const m: Record<string, string> = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  const links: SocialLinks = {
    facebook:  m.social_facebook  ?? 'https://facebook.com',
    instagram: m.social_instagram ?? 'https://instagram.com',
    linkedin:  m.social_linkedin  ?? 'https://linkedin.com',
    google:    m.social_google    ?? '',
    tiktok:    m.social_tiktok    ?? '',
    whatsapp:  m.social_whatsapp  ?? '',
  }

  return <FooterClient links={links} />
}
