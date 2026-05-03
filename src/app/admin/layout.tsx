import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Admin — Togor & Tweed' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
