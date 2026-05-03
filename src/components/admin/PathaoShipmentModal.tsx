'use client'

import { useEffect, useState } from 'react'
import { X, Truck, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createPathaoShipment } from '@/actions/admin/pathao'
import { toast } from 'sonner'

interface City  { city_id: number;  city_name: string }
interface Zone  { zone_id: number;  zone_name: string }
interface Area  { area_id: number;  area_name: string }
interface Store { store_id: number; store_name: string; store_address: string; is_default_store?: boolean; zone_id?: number }

// fuzzy match: does haystack contain needle (after normalising)?
function fuzzyMatch(haystack: string, needle: string): boolean {
  if (!needle) return false
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  return norm(haystack).includes(norm(needle)) || norm(needle).includes(norm(haystack))
}

interface Props {
  orderId:        string
  orderNumber:    string
  recipientName:  string
  recipientPhone: string
  recipientAddress: string
  addressCity:    string   // raw city name for auto-selection
  addressZone:    string   // raw zone/state name for auto-selection
  codAmount:      number   // 0 if prepaid
  totalItems:     number
  onClose:        () => void
  onSuccess:      (consignmentId: string) => void
}

export default function PathaoShipmentModal({
  orderId, orderNumber, recipientName, recipientPhone,
  recipientAddress, addressCity, addressZone, codAmount, totalItems, onClose, onSuccess,
}: Props) {
  // Dropdown data
  const [cities,  setCities]  = useState<City[]>([])
  const [zones,   setZones]   = useState<Zone[]>([])
  const [areas,   setAreas]   = useState<Area[]>([])
  const [stores,  setStores]  = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [zonesLoading, setZonesLoading] = useState(false)

  // Form state
  const [storeId,           setStoreId]           = useState<number>(0)
  const [cityId,            setCityId]            = useState<number>(0)
  const [zoneId,            setZoneId]            = useState<number>(0)
  const [areaId,            setAreaId]            = useState<number>(0)
  const [deliveryType,      setDeliveryType]      = useState<48 | 12>(48)
  const [name,              setName]              = useState(recipientName)
  const [phone,             setPhone]             = useState(recipientPhone)
  const [address,           setAddress]           = useState(recipientAddress)
  const [weight,            setWeight]            = useState('0.5')
  const [quantity,          setQuantity]          = useState(String(totalItems))
  const [description,       setDescription]       = useState('Clothing items')
  const [instruction,       setInstruction]       = useState('')
  const [amountToCollect,   setAmountToCollect]   = useState(String(codAmount))

  // Load cities + stores on mount, then auto-select from address
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [citiesRes, storesRes] = await Promise.all([
          fetch('/api/admin/pathao/cities').then(r => r.json()),
          fetch('/api/admin/pathao/stores').then(r => r.json()),
        ])
        console.log('[Pathao] cities raw response:', citiesRes)
        console.log('[Pathao] stores raw response:', storesRes)
        const citiesArr = Array.isArray(citiesRes) ? citiesRes : []
        const storesArr = Array.isArray(storesRes) ? storesRes : []
        if (!citiesArr.length && citiesRes?.error) {
          // Strip "Error: " prefix for cleaner display
          const msg = String(citiesRes.error).replace(/^Error:\s*/i, '')
          toast.error('Pathao: ' + msg)
        }
        setCities(citiesArr)
        setStores(storesArr)

        // Auto-select store (first one, or only one)
        if (storesArr.length >= 1) {
          const defaultStore = storesArr.find((s: Store) => s.is_default_store) ?? storesArr[0]
          setStoreId(Number(defaultStore.store_id))
        }

        // Auto-select city by matching address city name
        if (addressCity && citiesArr.length) {
          const match = citiesArr.find((c: City) => fuzzyMatch(c.city_name, addressCity))
          if (match) setCityId(Number(match.city_id))
        }
      } catch {
        toast.error('Failed to load Pathao data')
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load zones when city changes
  useEffect(() => {
    if (!cityId) { setZones([]); setZoneId(0); setAreas([]); setAreaId(0); return }
    setZonesLoading(true)
    console.log('[Pathao] fetching zones for city_id:', cityId)
    fetch(`/api/admin/pathao/zones?city_id=${cityId}`)
      .then(r => r.json())
      .then(data => {
        console.log('[Pathao] zones raw response:', data)
        if (!Array.isArray(data)) {
          const d = data as { message?: string; error?: string | boolean }
          const msg = typeof d?.message === 'string' ? d.message
                    : typeof d?.error === 'string'   ? d.error
                    : 'Unexpected response from zones API'
          // Unauthorized = Pathao API permission issue — instruct user to enter manually
          if (msg.toLowerCase().includes('unauthorized')) {
            toast.error('Pathao zone list requires manual entry — Pathao API permission not granted for zone lookup')
          } else {
            toast.error('Pathao zones: ' + msg.replace(/^Error:\s*/i, ''))
          }
          setZones([]); setZoneId(0)
          return
        }
        const arr: Zone[] = data
        setZones(arr)
        setAreas([])
        setAreaId(0)
        // Auto-select zone: scan address tokens first (most specific), then addressZone fallback
        if (arr.length) {
          // Prioritise tokens from the address (e.g. "Dhanmondi" in "House 12, Dhanmondi, Dhaka")
          // Skip generic address words and the city name to avoid false matches
          const ADDR_STOPWORDS = new Set([
            'house','road','block','flat','floor','building','street','lane','avenue',
            'plot','section','sector','west','east','north','south','new','old',
            'apt','apartment','village','para','bazar','bazaar','market','gate',
          ])
          const normCity = addressCity.toLowerCase().replace(/[^a-z0-9]/g, '')
          const addrTokens = recipientAddress
            .split(/[,\s]+/)
            .filter(t => {
              const n = t.toLowerCase().replace(/[^a-z0-9]/g, '')
              return n.length > 3 && n !== normCity && !ADDR_STOPWORDS.has(n) && !/^\d+$/.test(t)
            })
          const tokenMatch = addrTokens.reduce<typeof arr[0] | undefined>((found, token) =>
            found ?? arr.find(z => fuzzyMatch(z.zone_name, token)), undefined)
          const zoneMatch = addressZone && arr.find(z => fuzzyMatch(z.zone_name, addressZone))
          const match = tokenMatch || zoneMatch || null
          setZoneId(match ? Number(match.zone_id) : 0)
        } else {
          setZoneId(0)
        }
      })
      .then(() => setZonesLoading(false))
      .catch(err => { console.error('[Pathao] zones fetch error:', err); toast.error('Failed to load zones'); setZonesLoading(false) })
  }, [cityId])

  // Load areas when zone changes
  useEffect(() => {
    if (!zoneId) { setAreas([]); setAreaId(0); return }
    fetch(`/api/admin/pathao/areas?zone_id=${zoneId}`)
      .then(r => r.json())
      .then(data => {
        console.log('[Pathao] areas raw response:', data)
        const arr: Area[] = Array.isArray(data) ? data : []
        if (!Array.isArray(data) && (data as { error?: string })?.error) {
          console.warn('[Pathao] areas error:', (data as { error?: string }).error)
        }
        setAreas(arr)
        // Try to auto-match area from the delivery address string
        if (arr.length) {
          const addrTokens = recipientAddress.split(/[,\s]+/).filter(t => t.length > 2)
          const match =
            arr.find(a => fuzzyMatch(recipientAddress, a.area_name)) ||
            addrTokens.reduce<typeof arr[0] | undefined>((found, token) =>
              found ?? arr.find(a => fuzzyMatch(a.area_name, token)), undefined)
          setAreaId(match ? Number(match.area_id) : 0)
        } else {
          setAreaId(0)
        }
      })
      .catch(err => { console.error('[Pathao] areas fetch error:', err); toast.error('Failed to load areas') })
  }, [zoneId])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!storeId)      return toast.error('Please select a store')
    if (!cityId)       return toast.error('Please select a city')
    if (!zoneId)       return toast.error('Please select a zone')
    if (!phone.trim()) return toast.error('Recipient phone is required')

    setSubmitting(true)
    const result = await createPathaoShipment({
      orderId,
      storeId,
      recipientName:      name.trim(),
      recipientPhone:     phone.trim(),
      recipientAddress:   address.trim(),
      recipientCity:      cityId,
      recipientZone:      zoneId,
      recipientArea:      areaId || undefined,
      deliveryType,
      itemQuantity:       Number(quantity) || 1,
      itemWeight:         Number(weight)   || 0.5,
      itemDescription:    description.trim() || undefined,
      specialInstruction: instruction.trim() || undefined,
      amountToCollect:    Number(amountToCollect) || 0,
    })
    setSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Pathao consignment created: ${result.consignmentId}`)
      onSuccess(result.consignmentId!)
      onClose()
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.12em', color: '#888', marginBottom: 5,
    fontFamily: "'Inter', system-ui, sans-serif",
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: '1px solid #e5e3df', outline: 'none', background: '#fff',
    fontFamily: "'Inter', system-ui, sans-serif", color: '#111',
    boxSizing: 'border-box',
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 200, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', zIndex: 201,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: '#fff', width: '100%', maxWidth: 620,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #e5e3df',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={18} style={{ color: '#c8a96e' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#111' }}>
                CREATE PATHAO SHIPMENT
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Order #{orderNumber}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', color: '#888' }}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <div style={{ marginTop: 12, fontSize: 12 }}>Loading Pathao data…</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 24 }}>

            {/* ── Recipient ─────────────────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', color: '#aaa', marginBottom: 12 }}>
                RECIPIENT
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>NAME</label>
                  <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>PHONE</label>
                  <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} required placeholder="01XXXXXXXXX" />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>DELIVERY ADDRESS</label>
                <input style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} required />
              </div>
            </div>

            {/* ── Location ──────────────────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', color: '#aaa', marginBottom: 12 }}>
                DELIVERY LOCATION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>CITY *</label>
                  <select style={selectStyle} value={cityId}
                    onChange={e => setCityId(Number(e.target.value))} required>
                    <option value={0}>Select city…</option>
                    {cities.map(c => (
                      <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>ZONE *</label>
                  {zones.length > 0 ? (
                    <select style={selectStyle} value={zoneId}
                      onChange={e => setZoneId(Number(e.target.value))} required disabled={!cityId || zonesLoading}>
                      <option value={0}>
                        {zonesLoading ? 'Loading zones…' : 'Select zone…'}
                      </option>
                      {zones.map(z => (
                        <option key={z.zone_id} value={z.zone_id}>{z.zone_name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      style={inputStyle}
                      value={zoneId || ''}
                      onChange={e => setZoneId(Number(e.target.value))}
                      required
                      placeholder={zonesLoading ? 'Loading…' : cityId ? 'Enter zone ID manually' : '—'}
                      disabled={!cityId || zonesLoading}
                    />
                  )}
                </div>
                <div>
                  <label style={labelStyle}>AREA (optional)</label>
                  <select style={selectStyle} value={areaId}
                    onChange={e => setAreaId(Number(e.target.value))} disabled={!zoneId}>
                    <option value={0}>Select area…</option>
                    {areas.map(a => (
                      <option key={a.area_id} value={a.area_id}>{a.area_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Store & Delivery ──────────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', color: '#aaa', marginBottom: 12 }}>
                STORE & DELIVERY
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>PICKUP STORE *</label>
                  <select style={selectStyle} value={storeId}
                    onChange={e => setStoreId(Number(e.target.value))} required>
                    <option value={0}>Select store…</option>
                    {stores.map(s => (
                      <option key={s.store_id} value={s.store_id}>{s.store_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>DELIVERY TYPE</label>
                  <select style={selectStyle} value={deliveryType}
                    onChange={e => setDeliveryType(Number(e.target.value) as 48 | 12)}>
                    <option value={48}>Normal Delivery</option>
                    <option value={12}>Express Delivery</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Parcel ────────────────────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', color: '#aaa', marginBottom: 12 }}>
                PARCEL DETAILS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>QUANTITY</label>
                  <input type="number" min={1} style={inputStyle} value={quantity}
                    onChange={e => setQuantity(e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>WEIGHT (kg)</label>
                  <input type="number" min={0.1} step={0.1} style={inputStyle} value={weight}
                    onChange={e => setWeight(e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>COD AMOUNT (৳)</label>
                  <input type="number" min={0} style={inputStyle} value={amountToCollect}
                    onChange={e => setAmountToCollect(e.target.value)} required />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>ITEM DESCRIPTION</label>
                <input style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>SPECIAL INSTRUCTION (optional)</label>
                <input style={inputStyle} value={instruction} onChange={e => setInstruction(e.target.value)}
                  placeholder="e.g. Handle with care" />
              </div>
            </div>

            {/* ── COD notice ────────────────────────────────────── */}
            {codAmount === 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', background: '#f0f9f0',
                border: '1px solid #c3e6cb', marginBottom: 20, fontSize: 12, color: '#2e7d32',
              }}>
                <CheckCircle size={14} />
                Prepaid order — COD set to ৳0
              </div>
            )}

            {/* ── Actions ───────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button type="button" onClick={onClose} style={{
                all: 'unset', cursor: 'pointer', padding: '10px 20px',
                border: '1px solid #e5e3df', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.12em', color: '#666',
              }}>
                CANCEL
              </button>
              <button type="submit" disabled={submitting} style={{
                all: 'unset', cursor: submitting ? 'wait' : 'pointer',
                padding: '10px 24px', background: submitting ? '#888' : '#111',
                color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {submitting && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                {submitting ? 'CREATING…' : 'CREATE SHIPMENT'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
