'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface CartItemRow {
  variantId: string
  productName: string
  imageUrl: string | null
  size: string | null
  color: string | null
  price: number
  salePrice: number | null
  quantity: number
  addedAt: string
}

interface CartLead {
  cartId: string
  updatedAt: string
  cartTotal: number
  user: { id: string; name: string; email: string; phone: string; joinedAt: string }
  items: CartItemRow[]
}

interface Props {
  leads: CartLead[]
  totalUsers?: number
  totalCartsWithItems?: number
  dbError?: string | null
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function fmt(n: number) {
  return '৳' + n.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return 'Just now'
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('880') && digits.length >= 13) return digits
  if (digits.startsWith('0') && digits.length === 11) return '880' + digits.slice(1)
  if (digits.length === 10) return '880' + digits
  return digits
}

function buildMessage(template: string, lead: CartLead, offerPct: number): string {
  const productList = lead.items
    .map((i) => {
      const orig  = i.price
      const offer = offerPct > 0 ? Math.round(orig * (1 - offerPct / 100)) : orig
      const parts = [`• ${i.productName}`]
      if (i.size)  parts.push(`(${i.size})`)
      if (offerPct > 0) parts.push(`— ৳${orig} → *৳${offer}*`)
      else              parts.push(`— ৳${orig}`)
      return parts.join(' ')
    })
    .join('\n')

  return template
    .replace(/\{name\}/g,         lead.user.name || 'there')
    .replace(/\{product_list\}/g, productList)
    .replace(/\{total\}/g,        fmt(lead.cartTotal))
    .replace(/\{offer_pct\}/g,    offerPct > 0 ? `${offerPct}%` : '')
    .replace(/\{email\}/g,        lead.user.email)
    .trim()
}

const DEFAULT_TEMPLATE = `Hi {name}! 👋

We noticed you left some items in your cart at Togor & Tweed. Here's a special offer just for you:

{product_list}

🎁 Get *{offer_pct} OFF* your order today!

Your cart total: *{total}*

Shop now 👇
https://togorandtweed.com/cart

Limited time offer. Reply if you need help. 😊

— Togor & Tweed`

/* ── Styles ────────────────────────────────────────────────────────────────── */

const FF = "'Inter', system-ui, sans-serif"
const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e5e3df' }
const labelStyle: React.CSSProperties = {
  fontSize: 9, fontWeight: 500, letterSpacing: '0.18em', color: '#aaa',
  fontFamily: FF, textTransform: 'uppercase' as const,
}
const inputStyle: React.CSSProperties = {
  border: '1px solid #e0ddd8', fontSize: 12, padding: '7px 10px',
  outline: 'none', fontFamily: FF, width: '100%', boxSizing: 'border-box' as const,
}

/* ── Main component ────────────────────────────────────────────────────────── */

export default function CartLeadsClient({ leads: initialLeads, totalUsers = 0, totalCartsWithItems = 0, dbError }: Props) {
  const [leads]           = useState<CartLead[]>(initialLeads)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch]     = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [offerPct, setOfferPct] = useState(10)
  const [previewLead, setPreviewLead] = useState<CartLead | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return leads
    return leads.filter(
      (l) =>
        l.user.name.toLowerCase().includes(q) ||
        l.user.email.toLowerCase().includes(q) ||
        l.user.phone.includes(q)
    )
  }, [leads, search])

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.cartId))

  function toggleAll() {
    setSelected((s) => {
      const n = new Set(s)
      if (allSelected) filtered.forEach((l) => n.delete(l.cartId))
      else             filtered.forEach((l) => n.add(l.cartId))
      return n
    })
  }

  function toggle(cartId: string) {
    setSelected((s) => {
      const n = new Set(s)
      n.has(cartId) ? n.delete(cartId) : n.add(cartId)
      return n
    })
  }

  function sendBulkWhatsApp() {
    const targets = filtered.filter((l) => selected.has(l.cartId) && l.user.phone)
    if (!targets.length) { alert('No selected customers have a phone number on file.'); return }
    targets.forEach((lead) => {
      const phone   = normalizePhone(lead.user.phone)
      const message = buildMessage(template, lead, offerPct)
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    })
  }

  const selectedLeads = filtered.filter((l) => selected.has(l.cartId))
  const withPhone     = selectedLeads.filter((l) => l.user.phone)
  const withoutPhone  = selectedLeads.filter((l) => !l.user.phone)

  return (
    <div style={{ fontFamily: FF }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
        <h1 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.16em', color: '#111', margin: 0, textTransform: 'uppercase' as const }}>
          CART LEADS
        </h1>
        <span style={{ fontSize: 11, color: '#aaa' }}>{leads.length} active cart{leads.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Context bar */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: 11, color: '#888' }}>
        <span>Registered users: <strong style={{ color: '#111' }}>{totalUsers}</strong></span>
        <span>Carts with items: <strong style={{ color: '#111' }}>{totalCartsWithItems}</strong></span>
        <span style={{ color: '#aaa', fontSize: 10 }}>Only logged-in users&apos; carts are tracked</span>
      </div>

      {/* DB error banner */}
      {dbError && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#856404' }}>
          <strong>DB Error:</strong> {dbError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

        {/* ── Left: leads table ── */}
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone…"
              style={{ ...inputStyle, width: 260 }}
            />
            {selected.size > 0 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#555' }}>
                  {selected.size} selected
                  {withoutPhone.length > 0 && ` (${withoutPhone.length} no phone)`}
                </span>
                <button onClick={() => setSelected(new Set())}
                  style={{ fontSize: 11, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Clear
                </button>
              </div>
            )}
          </div>

          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 32px', textAlign: 'center' as const }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>🛒</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>
                  {dbError ? 'Could not load cart data' : leads.length === 0 ? 'No cart leads yet' : 'No results for that search'}
                </div>
                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>
                  {dbError
                    ? 'Check the DB error above. The cart table may not be migrated yet.'
                    : leads.length === 0
                      ? 'Cart leads appear here when customers log in and add products to their cart. Guest carts are stored in the browser only and do not appear here.'
                      : 'Try clearing your search filter.'}
                </div>
                {leads.length === 0 && !dbError && (
                  <div style={{ marginTop: 16, padding: '10px 16px', background: '#f9f8f6', border: '1px solid #e5e3df', fontSize: 11, color: '#666', display: 'inline-block', textAlign: 'left' as const }}>
                    <strong style={{ display: 'block', marginBottom: 4 }}>How to get cart leads:</strong>
                    1. A customer registers or logs in<br/>
                    2. They add a product to the cart<br/>
                    3. They don&apos;t complete the checkout<br/>
                    4. Their cart appears here automatically
                  </div>
                )}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <thead>
                  <tr style={{ background: '#f9f8f6' }}>
                    <th style={{ padding: '10px 14px', width: 36 }}>
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ ...labelStyle, textAlign: 'left' as const, padding: '10px 8px' }}>CUSTOMER</th>
                    <th style={{ ...labelStyle, textAlign: 'left' as const, padding: '10px 8px' }}>ITEMS</th>
                    <th style={{ ...labelStyle, textAlign: 'right' as const, padding: '10px 14px' }}>CART VALUE</th>
                    <th style={{ ...labelStyle, textAlign: 'left' as const, padding: '10px 8px' }}>LAST ACTIVE</th>
                    <th style={{ ...labelStyle, padding: '10px 14px', width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const isOpen = expanded === lead.cartId
                    return (
                      <React.Fragment key={lead.cartId}>
                        <tr
                          style={{
                            borderTop: '1px solid #f0ede8',
                            background: selected.has(lead.cartId) ? '#fffdf7' : '#fff',
                            cursor: 'pointer',
                          }}
                          onClick={() => toggle(lead.cartId)}
                        >
                          <td style={{ padding: '12px 14px', textAlign: 'center' as const }} onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={selected.has(lead.cartId)}
                              onChange={() => toggle(lead.cartId)} style={{ cursor: 'pointer' }} />
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{lead.user.name || '—'}</div>
                            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{lead.user.email}</div>
                            {lead.user.phone && (
                              <div style={{ fontSize: 11, color: '#25D366', marginTop: 1, fontWeight: 500 }}>
                                📱 {lead.user.phone}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                              {lead.items.slice(0, 3).map((item, i) => (
                                <div key={i} style={{ width: 36, height: 44, background: '#f2f2f2', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                                  {item.imageUrl && (
                                    <Image src={item.imageUrl} alt={item.productName} fill style={{ objectFit: 'cover' }} sizes="36px" />
                                  )}
                                </div>
                              ))}
                              {lead.items.length > 3 && (
                                <div style={{ width: 36, height: 44, background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888' }}>
                                  +{lead.items.length - 3}
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>
                              {lead.items.length} item{lead.items.length !== 1 ? 's' : ''}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' as const }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{fmt(lead.cartTotal)}</span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{ fontSize: 11, color: '#888' }}>{timeAgo(lead.updatedAt)}</span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' as const }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setExpanded(isOpen ? null : lead.cartId)}
                              style={{ fontSize: 10, letterSpacing: '0.08em', color: '#888', background: 'none', border: '1px solid #e0ddd8', cursor: 'pointer', padding: '3px 8px', fontFamily: FF }}>
                              {isOpen ? 'CLOSE' : 'VIEW'}
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr style={{ borderTop: '1px solid #f0ede8', background: '#fafaf8' }}>
                            <td />
                            <td colSpan={5} style={{ padding: '0 14px 16px 8px' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                                <thead>
                                  <tr>
                                    <th style={{ ...labelStyle, textAlign: 'left' as const, paddingBottom: 8 }}>PRODUCT</th>
                                    <th style={{ ...labelStyle, textAlign: 'left' as const, paddingBottom: 8 }}>VARIANT</th>
                                    <th style={{ ...labelStyle, textAlign: 'right' as const, paddingBottom: 8 }}>PRICE</th>
                                    <th style={{ ...labelStyle, textAlign: 'right' as const, paddingBottom: 8 }}>QTY</th>
                                    <th style={{ ...labelStyle, textAlign: 'right' as const, paddingBottom: 8 }}>SUBTOTAL</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {lead.items.map((item, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid #f0ede8' }}>
                                      <td style={{ padding: '8px 0' }}>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                          <div style={{ width: 28, height: 36, background: '#f2f2f2', position: 'relative', flexShrink: 0 }}>
                                            {item.imageUrl && (
                                              <Image src={item.imageUrl} alt={item.productName} fill style={{ objectFit: 'cover' }} sizes="28px" />
                                            )}
                                          </div>
                                          <span style={{ fontSize: 11, color: '#111', fontWeight: 500 }}>
                                            {item.productName.length > 30 ? item.productName.slice(0, 30) + '…' : item.productName}
                                          </span>
                                        </div>
                                      </td>
                                      <td style={{ fontSize: 10, color: '#888', padding: '8px 8px' }}>
                                        {[item.size, item.color].filter(Boolean).join(' / ') || '—'}
                                      </td>
                                      <td style={{ fontSize: 11, color: '#111', padding: '8px 0', textAlign: 'right' as const }}>
                                        {item.salePrice
                                          ? <><s style={{ color: '#aaa' }}>{fmt(item.price)}</s>{' '}{fmt(item.salePrice)}</>
                                          : fmt(item.price)}
                                      </td>
                                      <td style={{ fontSize: 11, color: '#555', padding: '8px 0', textAlign: 'right' as const }}>\xd7{item.quantity}</td>
                                      <td style={{ fontSize: 11, fontWeight: 600, color: '#111', padding: '8px 0', textAlign: 'right' as const }}>
                                        {fmt((item.salePrice ?? item.price) * item.quantity)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {lead.user.phone && (
                                <div style={{ marginTop: 10, textAlign: 'right' as const }}>
                                  <button
                                    onClick={() => {
                                      const phone   = normalizePhone(lead.user.phone)
                                      const message = buildMessage(template, lead, offerPct)
                                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
                                    }}
                                    style={{ background: '#25D366', color: '#fff', border: 'none', padding: '7px 16px', fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: FF, fontWeight: 600 }}>
                                    SEND WHATSAPP ↗
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Right: message composer ── */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ ...cardStyle, padding: '20px 20px' }}>
            <div style={{ ...labelStyle, marginBottom: 14 }}>WHATSAPP MESSAGE COMPOSER</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>OFFER DISCOUNT (%)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" min={0} max={90} value={offerPct}
                  onChange={(e) => setOfferPct(Math.max(0, Math.min(90, parseInt(e.target.value) || 0)))}
                  style={{ ...inputStyle, width: 80 }} />
                <span style={{ fontSize: 11, color: '#888' }}>% off original price</span>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>MESSAGE TEMPLATE</label>
              <div style={{ fontSize: 10, color: '#aaa', marginBottom: 6, lineHeight: 1.5 }}>
                Variables:{' '}
                {['{name}', '{product_list}', '{total}', '{offer_pct}'].map(v => (
                  <code key={v} style={{ background: '#f5f5f5', padding: '1px 4px', marginRight: 4 }}>{v}</code>
                ))}
              </div>
              <textarea value={template} onChange={(e) => setTemplate(e.target.value)}
                rows={13} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace', fontSize: 11 }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={labelStyle}>PREVIEW</span>
                {filtered.length > 0 && (
                  <select onChange={(e) => setPreviewLead(filtered.find((x) => x.cartId === e.target.value) ?? null)}
                    style={{ ...inputStyle, width: 'auto', fontSize: 10, padding: '3px 6px' }}>
                    <option value="">— pick customer —</option>
                    {filtered.map((l) => (
                      <option key={l.cartId} value={l.cartId}>{l.user.name || l.user.email}</option>
                    ))}
                  </select>
                )}
              </div>
              <div style={{ background: '#f0f9ee', border: '1px solid #d0e8cc', padding: '10px 12px', fontSize: 11, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200, overflowY: 'auto', color: '#333' }}>
                {previewLead
                  ? buildMessage(template, previewLead, offerPct)
                  : <span style={{ color: '#bbb', fontStyle: 'italic' }}>Select a customer above to preview.</span>}
              </div>
            </div>

            <button onClick={sendBulkWhatsApp} disabled={selected.size === 0}
              style={{ width: '100%', background: selected.size > 0 ? '#25D366' : '#ccc', color: '#fff', border: 'none', padding: '11px 0', fontSize: 12, letterSpacing: '0.1em', fontWeight: 700, cursor: selected.size > 0 ? 'pointer' : 'not-allowed', fontFamily: FF }}>
              {selected.size === 0
                ? 'SELECT CUSTOMERS TO MESSAGE'
                : `OPEN WHATSAPP FOR ${withPhone.length} CUSTOMER${withPhone.length !== 1 ? 'S' : ''} ↗`}
            </button>
            {withoutPhone.length > 0 && selected.size > 0 && (
              <p style={{ fontSize: 10, color: '#e65100', marginTop: 6, textAlign: 'center' as const }}>
                ⚠ {withoutPhone.length} selected customer{withoutPhone.length !== 1 ? 's' : ''} {withoutPhone.length !== 1 ? 'have' : 'has'} no phone number and will be skipped.
              </p>
            )}
            <p style={{ fontSize: 10, color: '#aaa', marginTop: 8, textAlign: 'center' as const, lineHeight: 1.5 }}>
              Opens a WhatsApp tab per customer with pre-filled message.<br/>
              Allow pop-ups in your browser if blocked.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
