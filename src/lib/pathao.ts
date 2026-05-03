/**
 * Pathao Courier API client
 * Docs: https://developer.pathao.com
 *
 * Required env vars:
 *   PATHAO_CLIENT_ID
 *   PATHAO_CLIENT_SECRET
 *   PATHAO_USERNAME
 *   PATHAO_PASSWORD
 */

// Sandbox:    https://courier-api-sandbox.pathao.com/aladdin/api/v1
// Production: https://courier-api.pathao.com/aladdin/api/v1
const BASE = (process.env.PATHAO_BASE_URL ?? 'https://courier-api-sandbox.pathao.com/aladdin/api/v1').replace(/\/$/, '')

// ── Token cache (in-process, refreshes before expiry) ────────────────────────
let cachedToken: string | null = null
let tokenExpiresAt = 0
let cachedBase = ''  // invalidate token if BASE changes between hot-reloads

/** Parse response as JSON; on content-type mismatch throw a readable error */
async function safeJson<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('application/json') && !ct.includes('text/json')) {
    const snippet = (await res.text()).slice(0, 300).replace(/\s+/g, ' ')
    throw new Error(
      `Pathao returned non-JSON (${res.status}). ` +
      `Check your PATHAO_* env vars. Response: ${snippet}`
    )
  }
  return res.json()
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000 && cachedBase === BASE) return cachedToken

  if (!process.env.PATHAO_CLIENT_ID || !process.env.PATHAO_CLIENT_SECRET ||
      !process.env.PATHAO_USERNAME  || !process.env.PATHAO_PASSWORD) {
    throw new Error('Pathao credentials not configured in environment variables')
  }

  let res: Response
  try {
    res = await fetch(`${BASE}/issue-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id:     process.env.PATHAO_CLIENT_ID,
        client_secret: process.env.PATHAO_CLIENT_SECRET,
        username:      process.env.PATHAO_USERNAME,
        password:      process.env.PATHAO_PASSWORD,
        grant_type:    'password',
      }),
      cache: 'no-store',
    })
  } catch (err) {
    const cause = (err as { cause?: { message?: string; code?: string } })?.cause
    const detail = cause ? `${cause.code ?? ''} ${cause.message ?? ''}`.trim() : String(err)
    throw new Error(`Pathao: cannot connect to ${BASE} — ${detail}`)
  }

  if (!res.ok) {
    const ct = res.headers.get('content-type') ?? ''
    const body = ct.includes('json')
      ? JSON.stringify(await res.json())
      : (await res.text()).slice(0, 300)
    throw new Error(`Pathao auth failed (${res.status}): ${body}`)
  }

  const data = await safeJson<{ access_token: string; expires_in: number }>(res)
  cachedToken    = data.access_token
  tokenExpiresAt = Date.now() + data.expires_in * 1000
  cachedBase     = BASE
  return cachedToken
}

async function pathaoFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken()
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options?.headers ?? {}),
      },
      cache: 'no-store',
    })
  } catch (err) {
    const cause = (err as { cause?: { message?: string; code?: string } })?.cause
    const detail = cause ? `${cause.code ?? ''} ${cause.message ?? ''}`.trim() : String(err)
    throw new Error(`Pathao: cannot connect to ${BASE}${path} — ${detail}`)
  }
  if (!res.ok) {
    const ct = res.headers.get('content-type') ?? ''
    const body = ct.includes('json')
      ? JSON.stringify(await res.json())
      : (await res.text()).slice(0, 300)
    throw new Error(`Pathao API error ${res.status} on ${path}: ${body}`)
  }
  return safeJson<T>(res)
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PathaoCity  { city_id: number; city_name: string }
export interface PathaoZone  { zone_id: number; zone_name: string }
export interface PathaoArea  { area_id: number; area_name: string }
export interface PathaoStore {
  store_id:               number
  store_name:             string
  store_address:          string
  is_default_store?:      boolean
  is_default_return_store?: boolean
  city_id?:               number
  zone_id?:               number
}

export interface PathaoOrderPayload {
  store_id:             number
  merchant_order_id:    string   // your order number
  recipient_name:       string
  recipient_phone:      string
  recipient_address:    string
  recipient_city:       number
  recipient_zone:       number
  recipient_area?:      number
  delivery_type:        48 | 12  // 48=Normal, 12=Express
  item_type:            2        // 2=Parcel
  special_instruction?: string
  item_quantity:        number
  item_weight:          number   // kg
  item_description?:    string
  amount_to_collect:    number   // COD; 0 for prepaid
}

export interface PathaoOrderResult {
  consignment_id:   string
  merchant_order_id: string
  order_status:     string
  delivery_fee:     number
}

// ── Response parser — handles all Pathao envelope shapes ─────────────────────
// Shape 1: { data: { data: [...] } }   (paginated lists)
// Shape 2: { data: [...] }             (flat lists / stores)
// Shape 3: [...]                       (bare array, defensive)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractList<T>(raw: any): T[] {
  if (Array.isArray(raw))               return raw as T[]
  if (Array.isArray(raw?.data?.data))   return raw.data.data as T[]
  if (Array.isArray(raw?.data))         return raw.data as T[]
  return []
}

// ── API calls ─────────────────────────────────────────────────────────────────
export async function pathaoCities(): Promise<PathaoCity[]> {
  const raw = await pathaoFetch<unknown>('/city-list')
  return extractList<PathaoCity>(raw)
}

export async function pathaoZones(cityId: number): Promise<PathaoZone[]> {
  // Pathao Hermes uses path param: /cities/{city_id}/zone-list
  const raw = await pathaoFetch<unknown>(`/cities/${cityId}/zone-list`)
  return extractList<PathaoZone>(raw)
}

export async function pathaoAreas(zoneId: number): Promise<PathaoArea[]> {
  // Pathao Hermes uses path param: /zones/{zone_id}/area-list
  const raw = await pathaoFetch<unknown>(`/zones/${zoneId}/area-list`)
  return extractList<PathaoArea>(raw)
}

export async function pathaoStores(): Promise<PathaoStore[]> {
  const raw = await pathaoFetch<unknown>('/stores')
  return extractList<PathaoStore>(raw)
}

export async function pathaoCreateOrder(payload: PathaoOrderPayload): Promise<PathaoOrderResult> {
  const res = await pathaoFetch<{ data: PathaoOrderResult }>('/orders/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function pathaoGetOrder(consignmentId: string) {
  return pathaoFetch<{ data: unknown }>(`/orders/${consignmentId}`)
}

export function pathaoConfigured(): boolean {
  return !!(
    process.env.PATHAO_CLIENT_ID &&
    process.env.PATHAO_CLIENT_SECRET &&
    process.env.PATHAO_USERNAME &&
    process.env.PATHAO_PASSWORD
  )
}

// ── Status labels ─────────────────────────────────────────────────────────────
export const PATHAO_STATUSES: Record<string, { label: string; description: string; color: string }> = {
  Pending:           { label: 'Order Placed',      description: 'Your order has been placed with Pathao.',          color: '#6b7280' },
  Pickup_Requested:  { label: 'Pickup Requested',  description: 'Pickup has been requested from our warehouse.',    color: '#f59e0b' },
  Picked_Up:         { label: 'Picked Up',         description: 'Your order has been picked up by Pathao.',         color: '#3b82f6' },
  In_Transit:        { label: 'On the Way',         description: 'Your order is on its way to you.',                color: '#8b5cf6' },
  Delivered:         { label: 'Delivered',          description: 'Your order has been delivered. Enjoy!',           color: '#10b981' },
  Returned:          { label: 'Returned',           description: 'Your order was returned to the sender.',          color: '#ef4444' },
  Cancelled:         { label: 'Cancelled',          description: 'This shipment has been cancelled.',               color: '#ef4444' },
}

export function pathaoStatusInfo(status: string | null) {
  if (!status) return null
  return PATHAO_STATUSES[status] ?? { label: status, description: '', color: '#6b7280' }
}

