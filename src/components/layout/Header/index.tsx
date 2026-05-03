import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import DesktopNav from './DesktopNav'
import MobileNav from './MobileNav'

// Cached logo fetch — busted by revalidateTag('site-settings') on save
const getLogoUrl = unstable_cache(
  async () => {
    try {
      const row = await prisma.siteSettings.findUnique({ where: { key: 'logo_url' } })
      return row?.value ?? null
    } catch {
      return null
    }
  },
  ['logo-url'],
  { tags: ['site-settings'], revalidate: 3600 }
)

export default async function Header() {
  const logoUrl = await getLogoUrl()

  return (
    <>
      <AnnouncementBar />
      <DesktopNav logoUrl={logoUrl} />
      <MobileNav logoUrl={logoUrl} />
    </>
  )
}
