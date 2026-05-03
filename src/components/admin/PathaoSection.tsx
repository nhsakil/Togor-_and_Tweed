'use client'

import { useState } from 'react'
import { Truck, ExternalLink, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import PathaoShipmentModal from './PathaoShipmentModal'
import { syncPathaoStatus } from '@/actions/admin/syncPathaoStatus'
import { toast } from 'sonner'

interface Props {
  orderId:         string
  orderNumber:     string
  recipientName:   string
  recipientPhone:  string
  recipientAddress:string
  addressCity:     string
  addressZone:     string
  codAmount:       number
  totalItems:      number
  consignmentId:   string | null
  trackingCode:    string | null
  pathaoStatus:    string | null
  pathaoCreatedAt: Date | null
  configured:      boolean
}

export default function PathaoSection(props: Props) {
  const [showModal,      setShowModal]      = useState(false)
  const [consignmentId,  setConsignmentId]  = useState(props.consignmentId)
  const [pathaoStatus,   setPathaoStatus]   = useState(props.pathaoStatus)
  const [syncing,        setSyncing]        = useState(false)

  async function handleSync() {
    setSyncing(true)
    const res = await syncPathaoStatus(props.orderId)
    setSyncing(false)
    if (!res.ok) {
      toast.error(res.error ?? 'Sync failed')
    } else {
      setPathaoStatus(res.status ?? pathaoStatus)
      toast.success(`Status synced: ${res.label}`)
    }
  }

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e3df',
    borderRadius: 12,
    padding: 24,
  }

  // ── Not configured ─────────────────────────────────────────────────────────
  if (!props.configured) {
    return (
      <div style={{ ...cardStyle, borderColor: '#fce4d6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Truck size={18} style={{ color: '#e67e22' }} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: '#111' }}>
            PATHAO SHIPMENT
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 14px', background: '#fef9f0', border: '1px solid #fce4d6' }}>
          <AlertCircle size={14} style={{ color: '#e67e22', marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: '#7d4e1e' }}>
            Pathao API credentials not configured. Add{' '}
            <code style={{ background: '#f5f0e8', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>
              PATHAO_CLIENT_ID
            </code>,{' '}
            <code style={{ background: '#f5f0e8', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>
              PATHAO_CLIENT_SECRET
            </code>,{' '}
            <code style={{ background: '#f5f0e8', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>
              PATHAO_USERNAME
            </code>, and{' '}
            <code style={{ background: '#f5f0e8', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>
              PATHAO_PASSWORD
            </code>{' '}
            to your <code style={{ background: '#f5f0e8', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>.env.local</code>.
          </div>
        </div>
      </div>
    )
  }

  // ── Shipment already created ───────────────────────────────────────────────
  if (consignmentId) {
    return (
      <div style={{ ...cardStyle, borderColor: '#c3e6cb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={18} style={{ color: '#2e7d32' }} />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: '#111' }}>
              PATHAO SHIPMENT CREATED
            </span>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              all: 'unset', cursor: syncing ? 'wait' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', border: '1px solid #e5e3df',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#555',
              opacity: syncing ? 0.6 : 1,
            }}
          >
            <RefreshCw size={12} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
            {syncing ? 'SYNCING…' : 'SYNC STATUS'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#aaa', marginBottom: 4 }}>
              CONSIGNMENT ID
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111', fontFamily: 'monospace' }}>
              {consignmentId}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#aaa', marginBottom: 4 }}>
              STATUS
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', background: '#e8f5e9', borderRadius: 99,
              fontSize: 11, fontWeight: 600, color: '#2e7d32',
            }}>
              {pathaoStatus ?? 'Pending'}
            </div>
          </div>
          {props.pathaoCreatedAt && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#aaa', marginBottom: 4 }}>
                CREATED
              </div>
              <div style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} />
                {new Date(props.pathaoCreatedAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 14 }}>
          <a
            href={`https://merchant.pathao.com/courier/consignments/${consignmentId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
              color: '#2e7d32', textDecoration: 'none',
            }}
          >
            <ExternalLink size={12} />
            VIEW IN PATHAO DASHBOARD
          </a>
        </div>
      </div>
    )
  }

  // ── Ready to create ────────────────────────────────────────────────────────
  return (
    <>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={18} style={{ color: '#c8a96e' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: '#111' }}>
                PATHAO SHIPMENT
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                No shipment created yet
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              all: 'unset', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', background: '#111', color: '#fff',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
            }}
          >
            <Truck size={13} />
            CREATE SHIPMENT
          </button>
        </div>
      </div>

      {showModal && (
        <PathaoShipmentModal
          orderId={props.orderId}
          orderNumber={props.orderNumber}
          recipientName={props.recipientName}
          recipientPhone={props.recipientPhone}
          recipientAddress={props.recipientAddress}
          addressCity={props.addressCity}
          addressZone={props.addressZone}
          codAmount={props.codAmount}
          totalItems={props.totalItems}
          onClose={() => setShowModal(false)}
          onSuccess={(id) => {
            setConsignmentId(id)
            setPathaoStatus('Pending')
          }}
        />
      )}
    </>
  )
}