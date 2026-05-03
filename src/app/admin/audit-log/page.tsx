export default function AuditLogPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.16em',
          color: '#111',
          margin: 0,
          textTransform: 'uppercase',
        }}>
          AUDIT LOG
        </h1>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 6, letterSpacing: '0.04em' }}>
          Admin activity history
        </div>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e3df',
        padding: '22px 24px',
      }}>
        <div style={{
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: '0.18em',
          color: '#aaa',
          marginBottom: 18,
        }}>
          RECENT ACTIVITY
        </div>
        <div style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic' }}>
          Audit log tracking coming soon. This will record admin actions including product edits,
          order status changes, coupon creation, and user management.
        </div>
      </div>
    </div>
  )
}
