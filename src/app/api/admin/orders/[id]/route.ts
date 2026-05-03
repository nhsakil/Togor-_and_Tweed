import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderStatus, PaymentStatus } from '@prisma/client'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return null
  }
  return session
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
