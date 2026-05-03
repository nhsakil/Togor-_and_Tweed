import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-serif text-brand-gold mb-4">404</h1>
      <h2 className="text-2xl font-serif text-brand-black mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block bg-brand-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
