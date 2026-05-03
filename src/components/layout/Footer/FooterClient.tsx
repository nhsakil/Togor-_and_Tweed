'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const COMPANY_LINKS = [
  { label: 'About Us',               href: '/about'        },
  { label: 'Style Journal',          href: '/blog'         },
  { label: 'Why Togor & Tweed',      href: '/why-us'       },
  { label: 'Track Order',            href: '/track-order'  },
  { label: 'Privacy Policy',         href: '/privacy'      },
  { label: 'Terms & Conditions',     href: '/terms'        },
  { label: 'Return/Exchange Policy', href: '/returns'      },
  { label: 'Contact Us',             href: '/contact'      },
  { label: 'Sitemap',                href: '/sitemap'      },
  { label: 'Stakeholders',           href: '/stakeholders' },
]

export interface SocialLinks {
  facebook:  string
  instagram: string
  linkedin:  string
  google:    string
  tiktok:    string
  whatsapp:  string
}

function FacebookIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> }
function InstagramIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> }
function LinkedInIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> }
function GoogleIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> }
function TikTokIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.78 1.52V7.2a4.85 4.85 0 0 1-1.01-.51z"/></svg> }
function WhatsAppIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> }


function SocialRow({ links, size = 'sm' }: { links: SocialLinks; size?: 'sm' | 'lg' }) {
  const iconSize  = size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'
  const iconColor = 'text-[#888] hover:text-[#111]'
  const items = [
    { href: links.facebook,  Icon: FacebookIcon,  label: 'Facebook'  },
    { href: links.instagram, Icon: InstagramIcon, label: 'Instagram' },
    { href: links.linkedin,  Icon: LinkedInIcon,  label: 'LinkedIn'  },
    { href: links.tiktok,    Icon: TikTokIcon,    label: 'TikTok'    },
    { href: links.whatsapp,  Icon: WhatsAppIcon,  label: 'WhatsApp'  },
    { href: links.google,    Icon: GoogleIcon,    label: 'Google'    },
  ].filter(i => i.href)
  return (
    <div className="flex items-center justify-center gap-4">
      {items.map(({ href, Icon, label }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
           className={`${iconSize} flex items-center justify-center ${iconColor} transition-colors`}>
          <Icon />
        </a>
      ))}
    </div>
  )
}

/** Shared footer body — company links spread full-width + centred social icons */
function FooterBody({ links, innerCls }: { links: SocialLinks; innerCls: string }) {
  return (
    <footer style={{ backgroundColor: '#fdf6f0' }} className="border-t border-[#e8ddd6] pt-6 pb-6">
      <div className={`max-w-[1600px] mx-auto px-6 ${innerCls}`}>

        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111] mb-3">Company</p>

        {/* Links spread evenly across the full content width */}
        <div className="flex flex-wrap justify-between gap-y-2 mb-5">
          {COMPANY_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-[12px] text-[#555] hover:text-[#111] transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="border-t border-[#e8ddd6] mb-5" />

        <SocialRow links={links} size="sm" />

      </div>
    </footer>
  )
}

/** Category page footer — content offset right of the 256px fixed sidebar */
function CategoryFooter({ links }: { links: SocialLinks }) {
  return <FooterBody links={links} innerCls="md:pl-[304px]" />
}

/** Default footer for homepage and other non-collection pages */
function DefaultFooter({ links }: { links: SocialLinks }) {
  return <FooterBody links={links} innerCls="" />
}

export default function FooterClient({ links }: { links: SocialLinks }) {
  const pathname = usePathname()
  const isCollectionPage = pathname.startsWith('/collections/')
  return isCollectionPage
    ? <CategoryFooter links={links} />
    : <DefaultFooter  links={links} />
}
