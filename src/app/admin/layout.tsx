import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

// SR: force-dynamic on the layout prevents Next.js from trying to pre-render
// any admin page at build time (they all require DB access and auth)
export const dynamic = 'force-dynamic'

export const metadata = { title: 'Admin — Togor & Tweed' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role

  // Hard server-side guard — belt-and-suspenders on top of middleware
  if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
    redirect('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f6' }}>
      <AdminSidebar />
      {/* Spacer for fixed sidebar */}
      <div style={{ width: 200, minWidth: 200, flexShrink: 0 }} />
      {/* Main content */}
      <main style={{
        flex: 1,
        padding: '36px 40px',
        overflowY: 'auto',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
