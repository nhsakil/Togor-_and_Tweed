'use client'

import { useState, useTransition } from 'react'
import { Truck, CheckCircle2, XCircle, Loader2, Package, RefreshCw } from 'lucide-react'
import { bulkCreateShipments, getUnshippedOrders } from '@/actions/admin/bulkPathaoShipment'
import { toast } from 'sonner'
import Link from 'next/link'

type Order = Awaited<ReturnType<typeof getUnshippedOrders>>[number]
type RowStatus = 'idle' | 'loading' | 'ok' | 'error'

interface RowState { status: RowStatus; consignmentId?: string; error?: string }

const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#f59e0b',
  CONFIRMED:  '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED:    '#06b6d4',
}

export default function BulkShipmentClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders]     = useState<Order[]>(initialOrders)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rowState, setRowState] = useState<Record<string, RowState>>({})
  const [running,  setRunning]  = useState(false)
  const [isPending, startTransition] = useTransition()

  const allUnprocessed = orders.filter(o => !rowState[o.id] || rowState[o.id].status === 'idle')
  const allIds = allUnprocessed.map(o => o.id)

  function toggleAll() {
    if (selected.size === allUnprocessed.length) setSelected(new Set())
    else setSelected(new Set(allIds))
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleCreate() {
    const ids = [...selected].filter(id => !rowState[id] || rowState[id].status !== 'ok')
    if (!ids.length) return

    setRunning(true)
    // Mark all as loading immediately
    setRowState(prev => {
      const next = { ...prev }
      ids.forEach(id => { next[id] = { status: 'loading' } })
      return next
    })
    setSelected(new Set())

    const results = await bulkCreateShipments(ids)

    setRowState(prev => {
      const next = { ...prev }
      results.forEach(r => {
        next[r.orderId] = r.ok
          ? { status: 'ok',    consignmentId: r.consignmentId }
          : { status: 'error', error: r.error }
      })
      return next
    })

    const ok  = results.filter(r => r.ok).length
    const err = results.filter(r => !r.ok).length
    if (ok)  toast.success(`${ok} shipment${ok > 1 ? 's' : ''} created successfully`)
    if (err) toast.error(`${err} shipment${err > 1 ? 's' : ''} failed — see details below`)

    setRunning(false)
  }

  function handleRefresh() {
    startTransition(async () => {
      const fresh = await getUnshippedOrders()
      setOrders(fresh)
      setSelected(new Set())
      setRowState({})
    })
  }

  const selectedCount = selected.size
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e3df', borderRadius: 12, padding: 24 }

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Truck size={20} style={{ color: '#c8a96e' }} />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Bulk Shipment</h1>
          </div>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
            {orders.length} unshipped order{orders.length !== 1 ? 's' : ''} · select and create Pathao consignments in one go
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleRefresh} disabled={isPending}
            style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', border: '1px solid #e5e3df', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', color: '#555', borderRadius: 4 }}>
            <RefreshCw size={12} style={{ animation: isPending ? 'spin 1s linear infinite' : 'none' }} />
            REFRESH
          </button>
          <button
            onClick={handleCreate}
            disabled={running || selectedCount === 0}
            style={{ all: 'unset', cursor: running || selectedCount === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', background: running || selectedCount === 0 ? '#999' : '#111',
              color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', borderRadius: 4 }}>
            {running ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Truck size={13} />}
            {running ? 'CREATING…' : selectedCount > 0 ? `CREATE ${selectedCount} SHIPMENT${selectedCount > 1 ? 'S' : ''}` : 'SELECT ORDERS'}
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: 48 }}>
          <Package size={40} style={{ color: '#ddd', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: '#888' }}>No unshipped orders — all caught up!</p>
        </div>
      ) : (
        <div style={card}>
          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e3df' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: 36 }}>
                  <input type="checkbox"
                    checked={selected.size === allUnprocessed.length && allUnprocessed.length > 0}
                    onChange={toggleAll} style={{ cursor: 'pointer' }} />
                </th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, letterSpacing: '0.1em', color: '#aaa' }}>ORDER</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, letterSpacing: '0.1em', color: '#aaa' }}>CUSTOMER</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, letterSpacing: '0.1em', color: '#aaa' }}>ADDRESS</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, letterSpacing: '0.1em', color: '#aaa' }}>STATUS</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, letterSpacing: '0.1em', color: '#aaa' }}>COD</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, letterSpacing: '0.1em', color: '#aaa' }}>SHIPMENT</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const rs = rowState[order.id]
                const isOk  = rs?.status === 'ok'
                const isErr = rs?.status === 'error'
                const isLoading = rs?.status === 'loading'
                const codAmount = order.paymentStatus === 'PAID' ? 0 : Number(order.total)
                const totalItems = order.items.reduce((s, i) => s + i.quantity, 0)
                const statusColor = STATUS_COLORS[order.status] ?? '#6b7280'

                return (
                  <tr key={order.id}
                    style={{ borderBottom: '1px solid #f0efed',
                      background: isOk ? '#f0fdf4' : isErr ? '#fff5f5' : 'transparent',
                      opacity: isOk ? 0.75 : 1 }}>
                    <td style={{ padding: '10px 10px' }}>
                      {isLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: '#888' }} />
                        : isOk    ? <CheckCircle2 size={14} style={{ color: '#2e7d32' }} />
                        : isErr   ? <XCircle size={14} style={{ color: '#c62828' }} />
                        : <input type="checkbox" checked={selected.has(order.id)}
                            onChange={() => toggleOne(order.id)} style={{ cursor: 'pointer' }} />}
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <Link href={`/admin/orders/${order.id}`}
                        style={{ fontFamily: 'monospace', fontWeight: 700, color: '#111', textDecoration: 'none', fontSize: 12 }}>
                        {order.orderNumber}
                      </Link>
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-BD')} · {totalItems} item{totalItems > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <div style={{ fontWeight: 600, color: '#111' }}>
                        {order.address.firstName} {order.address.lastName}
                      </div>
                      <div style={{ color: '#888', fontSize: 11, marginTop: 1 }}>
                        {order.address.phone ?? order.user?.phone ?? '—'}
                      </div>
                    </td>
                    <td style={{ padding: '10px 10px', maxWidth: 220 }}>
                      <div style={{ color: '#555', lineHeight: 1.4 }}>
                        {[order.address.line1, order.address.line2].filter(Boolean).join(', ')}
                      </div>
                      <div style={{ fontWeight: 600, color: '#111', marginTop: 2 }}>{order.address.city}</div>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99,
                        background: statusColor + '20', color: statusColor, fontSize: 10, fontWeight: 600 }}>
                        {order.status}
                      </span>
                      {order.paymentStatus === 'PAID' && (
                        <span style={{ display: 'block', marginTop: 3, fontSize: 10, color: '#2e7d32', fontWeight: 600 }}>PAID</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#111' }}>
                      {codAmount > 0 ? `৳${codAmount.toLocaleString()}` : <span style={{ color: '#2e7d32', fontSize: 10, fontWeight: 600 }}>PREPAID</span>}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                      {isOk && rs.consignmentId && (
                        <div style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: '#2e7d32' }}>
                          {rs.consignmentId}
                        </div>
                      )}
                      {isErr && (
                        <div style={{ fontSize: 10, color: '#c62828', maxWidth: 180, lineHeight: 1.3 }}>
                          {rs.error}
                        </div>
                      )}
                      {!isOk && !isErr && !isLoading && (
                        <span style={{ fontSize: 10, color: '#bbb' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Summary */}
          {Object.values(rowState).some(r => r.status !== 'idle') && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#f9f7f4', borderRadius: 8,
              display: 'flex', gap: 20, fontSize: 12 }}>
              <span style={{ color: '#2e7d32', fontWeight: 600 }}>
                ✓ {Object.values(rowState).filter(r => r.status === 'ok').length} created
              </span>
              <span style={{ color: '#c62828', fontWeight: 600 }}>
                ✗ {Object.values(rowState).filter(r => r.status === 'error').length} failed
              </span>
              <span style={{ color: '#888' }}>
                {Object.values(rowState).filter(r => r.status === 'loading').length} in progress
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
