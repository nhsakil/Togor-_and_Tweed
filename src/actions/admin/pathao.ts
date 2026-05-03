'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pathaoCreateOrder, type PathaoOrderPayload } from '@/lib/pathao'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  orderId:            z.string().cuid(),
  storeId:            z.number().int().positive(),
  recipientName:      z.string().min(1),
  recipientPhone:     z.string().min(10),
  recipientAddress:   z.string().min(3),
  recipientCity:      z.number().int().positive(),
  recipientZone:      z.number().int().positive(),
  recipientArea:      z.number().int().positive().optional(),
  deliveryType:       z.literal(48).or(z.literal(12)),
  itemQuantity:       z.number().int().positive(),
  itemWeight:         z.number().positive(),
  itemDescription:    z.string().optional(),
  specialInstruction: z.string().optional(),
  amountToCollect:    z.number().min(0),
})

export async function createPathaoShipment(input: z.infer<typeof schema>) {
  const session = await auth()
  const _su = session?.user as { role?: string; id?: string } | undefined
  let _isAdmin = _su?.role === 'ADMIN'
  if (!_isAdmin && _su?.id) {
    const { prisma: _p } = await import('@/lib/prisma')
    const _dbu = await _p.user.findUnique({ where: { id: _su.id }, select: { role: true } })
    _isAdmin = _dbu?.role === 'ADMIN'
  }
  if (!_isAdmin)
    return { error: 'Forbidden' }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid input', issues: parsed.error.flatten() }

  const d = parsed.data

  const order = await prisma.order.findUnique({
    where: { id: d.orderId },
    select: { orderNumber: true, pathaoConsignmentId: true },
  })
  if (!order) return { error: 'Order not found' }
  if (order.pathaoConsignmentId) return { error: 'Shipment already created for this order' }

  const payload: PathaoOrderPayload = {
    store_id:             d.storeId,
    merchant_order_id:    order.orderNumber,
    recipient_name:       d.recipientName,
    recipient_phone:      d.recipientPhone,
    recipient_address:    d.recipientAddress,
    recipient_city:       d.recipientCity,
    recipient_zone:       d.recipientZone,
    recipient_area:       d.recipientArea,
    delivery_type:        d.deliveryType,
    item_type:            2,
    item_quantity:        d.itemQuantity,
    item_weight:          d.itemWeight,
    item_description:     d.itemDescription,
    special_instruction:  d.specialInstruction,
    amount_to_collect:    d.amountToCollect,
  }

  try {
    const result = await pathaoCreateOrder(payload)

    await prisma.order.update({
      where: { id: d.orderId },
      data: {
        pathaoConsignmentId: result.consignment_id,
        pathaoTrackingCode:  result.consignment_id,
        pathaoStatus:        result.order_status,
        pathaoCreatedAt:     new Date(),
        status:              'PROCESSING',
      },
    })

    revalidatePath(`/admin/orders/${d.orderId}`)
    return { success: true, consignmentId: result.consignment_id, status: result.order_status }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}
