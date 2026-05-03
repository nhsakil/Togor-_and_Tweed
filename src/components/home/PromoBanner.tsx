import Link from 'next/link'

interface Props { headline: string; subtext: string; ctaLabel: string; ctaHref: string; dark?: boolean }

export default function PromoBanner({ headline, subtext, ctaLabel, ctaHref, dark = false }: Props) {
  return (
    <section className={dark ? 'bg-[#111]' : 'bg-[#f7f4ef]'}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-12 md:py-14 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight mb-1.5 ${dark ? 'text-white' : 'text-[#111]'}`}>{headline}</h2>
          <p className={`text-sm ${dark ? 'text-white/50' : 'text-[#666]'}`}>{subtext}</p>
        </div>
        <Link href={ctaHref} className={`flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] px-8 py-4 transition-colors ${dark ? 'bg-white text-[#111] hover:bg-[#eee]' : 'bg-[#111] text-white hover:bg-[#333]'}`}>
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}
