import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CartLeadsClient from '@/components/admin/CartLeadsClient'

export const dynamic  = 'force-dynamic'
export const metadata = { title: 'Cart Leads — Admin' }

export default async function CartLeadsPage() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') redirect('/admin')

  let leads: Parameters<typeof CartLeadsClient>[0]['leads'] = []
  let dbError: string | null = null
  let totalUsers = 0
  let totalCartsWithItems = 0

  try {
    // Diagnostic counts — help understand what's in the DB
    ;[totalUsers, totalCartsWithItems] = await Promise.all([
      prisma.user.count(),
      prisma.cart.count({ where: { userId: { not: null }, items: { some: {} } } }),
    ])

    const carts = await prisma.cart.findMany({
      where: { userId: { not: null }, items: { some: {} } },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
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

    leads = carts
      .filter((c) => c.user !== null)
      .map((c) => {
        const cartTotal = c.items.reduce((sum, ci) => {
          const price = Number(ci.variant.price ?? ci.variant.product.basePrice)
          return sum + price * ci.quantity
        }, 0)
        return {
          cartId:    c.id,
          updatedAt: c.updatedAt.toISOString(),
          cartTotal,
          user: {
            id:       c.user!.id,
            name:     c.user!.name  ?? '',
            email:    c.user!.email,
            phone:    c.user!.phone ?? '',
            joinedAt: c.user!.createdAt.toISOString(),
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
  } catch (err) {
    console.error('[cart-leads page]', err)
    dbError = err instanceof Error ? err.message : String(err)
  }

  return (
    <CartLeadsClient
      leads={leads}
      totalUsers={totalUsers}
      totalCartsWithItems={totalCartsWithItems}
      dbError={dbError}
    />
  )
}
