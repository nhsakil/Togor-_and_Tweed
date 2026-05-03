import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const carts = await prisma.cart.findMany({
      where: {
        userId: { not: null },
        items: { some: {} },           // only carts that have at least one item
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, createdAt: true },
        },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    const leads = carts
      .filter((c) => c.user !== null)
      .map((c) => {
        const cartTotal = c.items.reduce((sum, ci) => {
          const price = Number(ci.variant.price ?? ci.variant.product.basePrice)
          return sum + price * ci.quantity
        }, 0)

        return {
          cartId:      c.id,
          updatedAt:   c.updatedAt.toISOString(),
          cartTotal,
          user: {
            id:        c.user!.id,
            name:      c.user!.name  ?? '',
            email:     c.user!.email,
            phone:     c.user!.phone ?? '',
            joinedAt:  c.user!.createdAt.toISOString(),
          },
          items: c.items.map((ci) => ({
            variantId:   ci.variant.id,
            productName: ci.variant.product.name,
            imageUrl:    ci.variant.product.images[0]?.url ?? null,
            size:        ci.variant.size,
            color:       ci.variant.color,
            price:       Number(ci.variant.price ?? ci.variant.product.basePrice),
            salePrice:   ci.variant.salePrice ? Number(ci.variant.salePrice) : null,
            quantity:    ci.quantity,
            addedAt:     ci.addedAt.toISOString(),
          })),
        }
      })

    return NextResponse.json({ leads, total: leads.length })
  } catch (err) {
    console.error('[cart-leads]', err)
    return NextResponse.json({ error: 'Failed to fetch cart leads' }, { status: 500 })
  }
}
