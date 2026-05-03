import Link from 'next/link'
import Image from 'next/image'

export interface EditorialPanel {
  image: string
  label: string
  title: string
  subtitle: string
  href: string
}

interface HeroBannerProps {
  panels: EditorialPanel[]
}

export default function HeroBanner({ panels }: HeroBannerProps) {
  const colClass =
    panels.length === 1
      ? 'grid-cols-1'
      : panels.length === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-3'

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 88px)', minHeight: 480 }}>
      {/* Responsive grid: 1 col when single panel, 3 cols when full editorial */}
      <div className={`grid ${colClass} h-full gap-0`}>
        {panels.map((panel, idx) => (
          <Link
            key={idx}
            href={panel.href}
            className="relative group overflow-hidden flex flex-col justify-end h-full"
          >
            {/* Image */}
            <div className="absolute inset-0">
              <Image
                src={panel.image}
                alt={`${panel.title} — ${panel.label} | Togor & Tweed Bangladesh Fashion`}
                fill
                priority={idx === 0}
                quality={85}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>

            {/* Dark overlay at bottom only */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Text at bottom-left */}
            <div className="relative z-10 p-6 md:p-8">
              <p className="text-white/70 text-[10px] uppercase tracking-[0.2em] font-medium mb-2">
                {panel.label}
              </p>
              <h2 className="text-white font-black text-2xl md:text-3xl leading-tight mb-1 uppercase">
                {panel.title}
              </h2>
              <p className="text-white/80 text-sm max-w-xs">
                {panel.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
