import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      address: true,
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
          variant: {
            select: { id: true, sku: true, size: true, color: true, colorHex: true },
          },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ data: order })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()

  const { id } = await params

  try {
    const body = await request.json()
    const { status, paymentStatus } = body

    const validStatuses = Object.values(OrderStatus)
    const validPaymentStatuses = Object.values(PaymentStatus)

    const data: { status?: OrderStatus; paymentStatus?: PaymentStatus } = {}

    if (status) {
      if (!validStatuses.includes(status as OrderStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      data.status = status as OrderStatus
    }

    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus as PaymentStatus)) {
        return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
      }
      data.paymentStatus = paymentStatus as PaymentStatus
    }

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        address: true,
        items: true,
      },
    })

    return NextResponse.json({ data: order })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
