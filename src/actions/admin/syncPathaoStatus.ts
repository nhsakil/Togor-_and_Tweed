'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pathaoGetOrder, pathaoStatusInfo } from '@/lib/pathao'
import { sendPathaoStatusUpdate } from '@/lib/resend'

export async function syncPathaoStatus(orderId: string): Promise<{
  ok: boolean
  status?: string
  label?: string
  error?: string
}> {
  const session = await auth()
  const _su = session?.user as { role?: string; id?: string } | undefined
  let _isAdmin = _su?.role === 'ADMIN'
  if (!_isAdmin && _su?.id) {
    const { prisma: _p } = await import('@/lib/prisma')
    const _dbu = await _p.user.findUnique({ where: { id: _su.id }, select: { role: true } })
    _isAdmin = _dbu?.role === 'ADMIN'
  }
  if (!_isAdmin)
    return { ok: false, error: 'Forbidden' }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      pathaoConsignmentId: true,
      pathaoStatus: true,
      orderNumber: true,
      user: { select: { email: true } },
    },
  })

  if (!order?.pathaoConsignmentId)
    return { ok: false, error: 'No Pathao consignment linked to this order' }

  let raw: { data?: { order_status?: string; consignment_id?: string } }
  try {
    raw = await pathaoGetOrder(order.pathaoConsignmentId) as typeof raw
  } catch (err) {
    return { ok: false, error: String(err).replace(/^Error:\s*/i, '') }
  }

  const newStatus = raw?.data?.order_status
  if (!newStatus) return { ok: false, error: 'Pathao returned no status in response' }

  const info = pathaoStatusInfo(newStatus)

  // Only write to DB if status actually changed
  if (newStatus !== order.pathaoStatus) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        pathaoStatus: newStatus,
        ...(newStatus === 'Delivered' && { status: 'DELIVERED'  }),
        ...(newStatus === 'Picked_Up' && { status: 'PROCESSING' }),
      },
    })

    // Email customer on milestone changes
    const NOTIFY_ON = ['Pickup_Requested', 'Picked_Up', 'In_Transit', 'Delivered', 'Returned']
    if (NOTIFY_ON.includes(newStatus) && order.user?.email && info) {
      await sendPathaoStatusUpdate({
        to:                order.user.email,
        orderNumber:       order.orderNumber,
        status:            newStatus,
        statusLabel:       info.label,
        statusDescription: info.description,
        consignmentId:     order.pathaoConsignmentId,
      }).catch(err => console.error('[syncPathaoStatus] email error:', err))
    }
  }

  return { ok: true, status: newStatus, label: info?.label ?? newStatus }
}
