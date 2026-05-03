'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  pathaoCities, pathaoZones, pathaoStores,
  pathaoCreateOrder, type PathaoOrderPayload,
} from '@/lib/pathao'
import { revalidatePath } from 'next/cache'

// ── Helpers ───────────────────────────────────────────────────────────────────

function norm(s: string) { return s.toLowerCase().replace(/[^a-z0-9]/g, '') }

function fuzzy(a: string, b: string) {
  const na = norm(a), nb = norm(b)
  return na.includes(nb) || nb.includes(na)
}

const STOPWORDS = new Set([
  'house','road','block','flat','floor','building','street','lane','avenue',
  'plot','section','sector','west','east','north','south','new','old',
  'apt','apartment','village','para','bazar','bazaar','market','gate',
])

function addressTokens(address: string, excludeCity: string) {
  const nc = norm(excludeCity)
  return address.split(/[,\s]+/).filter(t => {
    const n = norm(t)
    return n.length > 3 && n !== nc && !STOPWORDS.has(n) && !/^\d+$/.test(t)
  })
}

// ── Cache (per cold-start) ────────────────────────────────────────────────────
let _cities:    Awaited<ReturnType<typeof pathaoCities>>  | null = null
let _storeId:   number | null = null

async function getCities() {
  if (!_cities) _cities = await pathaoCities()
  return _cities
}

async function getDefaultStoreId() {
  if (_storeId) return _storeId
  const stores = await pathaoStores()
  const def = stores.find(s => s.is_default_store) ?? stores[0]
  _storeId = def ? Number(def.store_id) : 0
  return _storeId
}

// ── Resolve city + zone IDs from a text address ───────────────────────────────
export async function resolvePathaoLocation(addressCity: string, fullAddress: string) {
  const cities = await getCities()

  const city = cities.find(c => fuzzy(c.city_name, addressCity))
  if (!city) return { cityId: 0, zoneId: 0, cityName: '', zoneName: '' }

  const zones = await pathaoZones(city.city_id)
  const tokens = addressTokens(fullAddress, addressCity)
  const zone =
    tokens.reduce<typeof zones[0] | undefined>((f, t) => f ?? zones.find(z => fuzzy(z.zone_name, t)), undefined) ??
    zones.find(z => fuzzy(z.zone_name, addressCity)) ??
    null

  return {
    cityId:   city.city_id,
    zoneId:   zone?.zone_id ?? 0,
    cityName: city.city_name,
    zoneName: zone?.zone_name ?? '',
  }
}

// ── Single-order auto-shipment (used by bulk) ─────────────────────────────────
export interface BulkShipmentResult {
  orderId:       string
  orderNumber:   string
  ok:            boolean
  consignmentId?: string
  error?:        string
}

async function isAdmin(): Promise<boolean> {
  const session = await auth()
  const su = session?.user as { role?: string; id?: string } | undefined
  if (su?.role === 'ADMIN') return true
  if (su?.id) {
    const db = await prisma.user.findUnique({ where: { id: su.id }, select: { role: true } })
    return db?.role === 'ADMIN'
  }
  return false
}

export async function bulkCreateShipments(
  orderIds: string[]
): Promise<BulkShipmentResult[]> {
  if (!(await isAdmin())) {
    return orderIds.map(id => ({ orderId: id, orderNumber: '', ok: false, error: 'Forbidden' }))
  }

  const storeId = await getDefaultStoreId()
  if (!storeId) {
    return orderIds.map(id => ({ orderId: id, orderNumber: '', ok: false, error: 'No Pathao store found' }))
  }

  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds }, pathaoConsignmentId: null },
    include: {
      address: true,
      items:   { select: { quantity: true } },
      user:    { select: { phone: true } },
    },
  })

  const results: BulkShipmentResult[] = []

  for (const order of orders) {
    const fullAddress = [order.address.line1, order.address.line2, order.address.city]
      .filter(Boolean).join(', ')
    const phone = order.address.phone ?? order.user?.phone ?? ''
    const totalItems = order.items.reduce((s, i) => s + i.quantity, 0)
    const codAmount = order.paymentStatus === 'PAID' ? 0 : Number(order.total)

    try {
      const loc = await resolvePathaoLocation(order.address.city, fullAddress)
      if (!loc.cityId) throw new Error(`Cannot resolve Pathao city for "${order.address.city}"`)
      if (!loc.zoneId) throw new Error(`Cannot resolve Pathao zone for "${order.address.city}" — please create shipment manually`)

      const payload: PathaoOrderPayload = {
        store_id:          storeId,
        merchant_order_id: order.orderNumber,
        recipient_name:    `${order.address.firstName} ${order.address.lastName}`.trim(),
        recipient_phone:   phone,
        recipient_address: fullAddress,
        recipient_city:    loc.cityId,
        recipient_zone:    loc.zoneId,
        delivery_type:     48,
        item_type:         2,
        item_quantity:     totalItems,
        item_weight:       0.5,
        item_description:  'Clothing items',
        amount_to_collect: codAmount,
      }

      const res = await pathaoCreateOrder(payload)

      await prisma.order.update({
        where: { id: order.id },
        data: {
          pathaoConsignmentId: res.consignment_id,
          pathaoTrackingCode:  res.consignment_id,
          pathaoStatus:        res.order_status,
          pathaoCreatedAt:     new Date(),
          status:              'PROCESSING',
        },
      })

      revalidatePath(`/admin/orders/${order.id}`)
      results.push({ orderId: order.id, orderNumber: order.orderNumber, ok: true, consignmentId: res.consignment_id })
    } catch (err) {
      results.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        ok: false,
        error: err instanceof Error ? err.message.replace(/^Error:\s*/i, '') : String(err),
      })
    }
  }

  revalidatePath('/admin/bulk-shipment')
  revalidatePath('/admin/orders')
  return results
}

// ── Load unshipped orders for the UI ─────────────────────────────────────────
export async function getUnshippedOrders() {
  if (!(await isAdmin())) return []

  return prisma.order.findMany({
    where: {
      pathaoConsignmentId: null,
      status: { notIn: ['CANCELLED', 'DELIVERED', 'REFUNDED'] },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      createdAt: true,
      address: { select: { firstName: true, lastName: true, city: true, line1: true, line2: true, phone: true } },
      items: { select: { quantity: true } },
      user:  { select: { phone: true } },
    },
  })
}
