import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pathaoStatusInfo } from '@/lib/pathao'
import { sendPathaoStatusUpdate } from '@/lib/resend'

/**
 * Pathao webhook — receives order status change events.
 *
 * Register this URL in the Pathao merchant dashboard:
 *   https://<your-domain>/api/webhooks/pathao
 *
 * Optionally add ?secret=<PATHAO_WEBHOOK_SECRET> to the URL and set the
 * env var to verify the request came from Pathao.
 */
export async function POST(req: Request) {
  try {
    // Optional secret check
    const secret = process.env.PATHAO_WEBHOOK_SECRET
    if (secret) {
      const { searchParams } = new URL(req.url)
      if (searchParams.get('secret') !== secret) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    console.log('[Pathao webhook] payload:', JSON.stringify(body))

    // Pathao may wrap the event in a data envelope
    const event = body?.data ?? body

    const consignmentId: string | undefined =
      event?.consignment_id ?? event?.consignmentId
    const newStatus: string | undefined =
      event?.order_status ?? event?.orderStatus ?? event?.status

    if (!consignmentId || !newStatus) {
      console.warn('[Pathao webhook] missing consignment_id or order_status — ignoring')
      return NextResponse.json({ ok: true })   // return 200 so Pathao doesn't retry endlessly
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: { pathaoConsignmentId: consignmentId },
      select: {
        id: true,
        orderNumber: true,
        pathaoStatus: true,
        user: { select: { email: true, name: true } },
      },
    })

    if (!order) {
      console.warn(`[Pathao webhook] no order found for consignment ${consignmentId}`)
      return NextResponse.json({ ok: true })
    }

    // Skip if status hasn't changed
    if (order.pathaoStatus === newStatus) {
      return NextResponse.json({ ok: true })
    }

    // Update DB
    await prisma.order.update({
      where: { id: order.id },
      data: {
        pathaoStatus: newStatus,
        // Also advance our own order status on delivered/picked-up events
        ...(newStatus === 'Delivered'  && { status: 'DELIVERED'  }),
        ...(newStatus === 'Picked_Up'  && { status: 'PROCESSING' }),
      },
    })

    console.log(`[Pathao webhook] ${order.orderNumber}: ${order.pathaoStatus} → ${newStatus}`)

    // Send email to customer
    const info = pathaoStatusInfo(newStatus)
    if (info && order.user?.email) {
      // Only email on meaningful status milestones
      const NOTIFY_ON = ['Pickup_Requested', 'Picked_Up', 'In_Transit', 'Delivered', 'Returned']
      if (NOTIFY_ON.includes(newStatus)) {
        await sendPathaoStatusUpdate({
          to:                order.user.email,
          orderNumber:       order.orderNumber,
          status:            newStatus,
          statusLabel:       info.label,
          statusDescription: info.description,
          consignmentId,
        }).catch(err => console.error('[Pathao webhook] email error:', err))
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Pathao webhook] error:', err)
    // Return 200 to prevent Pathao from retrying on our own internal errors
    return NextResponse.json({ error: String(err) }, { status: 200 })
  }
}
