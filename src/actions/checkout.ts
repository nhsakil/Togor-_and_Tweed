'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { sendOrderConfirmation } from '@/lib/resend'
import { revalidatePath } from 'next/cache'

export interface CheckoutAddress {
  firstName: string
  lastName:  string
  phone:     string
  line1:     string
  line2?:    string
  city:      string
  state:     string
  postalCode: string
}

interface CheckoutItem {
  variantId: string
  quantity:  number
  price:     number
}

interface PlaceOrderInput {
  address:        CheckoutAddress
  paymentMethod:  'cod' | 'bkash' | 'nagad'
  mobileNumber?:  string
  transactionId?: string
  items:          CheckoutItem[]
  subtotal:       number
  shipping:       number
  total:          number
  couponCode?:    string
  discountAmount?: number
}

interface PlaceOrderResult {
  success:      boolean
  orderId?:     string
  orderNumber?: string
  error?:       string
}

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random  = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TT-${dateStr}-${random}`
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' }

  const userId = session.user.id

  if (!input.items || input.items.length === 0) {
    return { success: false, error: 'Cart is empty' }
  }

  try {
    const { order, emailItems } = await prisma.$transaction(async (tx) => {

      // 1. Validate & decrement stock for each variant
      for (const item of input.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { id: true, stock: true, reservedQty: true, isActive: true },
        })
        if (!variant || !variant.isActive) {
          throw new Error(`Variant ${item.variantId} is unavailable`)
        }
        const available = variant.stock - variant.reservedQty
        if (available < item.quantity) {
          throw new Error(`Not enough stock for variant ${item.variantId} (available: ${available})`)
        }
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock:       { decrement: item.quantity },
            reservedQty: { decrement: Math.min(variant.reservedQty, item.quantity) },
          },
        })
      }

      // 2. Save address
      const address = await tx.address.create({
        data: {
          userId,
          firstName:  input.address.firstName,
          lastName:   input.address.lastName,
          phone:      input.address.phone,
          line1:      input.address.line1,
          line2:      input.address.line2 ?? null,
          city:       input.address.city,
          state:      input.address.state,
          postalCode: input.address.postalCode,
          country:    'BD',
        },
      })

      // 3. Fetch variant details for order line items
      const variantDetails = await Promise.all(
        input.items.map(item =>
          tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: {
              id: true, sku: true, size: true, color: true, productId: true,
              product: {
                select: {
                  name: true,
                  images: { where: { isDefault: true }, select: { url: true }, take: 1 },
                },
              },
            },
          })
        )
      )

      // 4. Build paymentIntentId (null for COD to avoid unique constraint collisions)
      const paymentIntentId =
        input.paymentMethod !== 'cod' && input.transactionId
          ? `${input.paymentMethod}_${input.transactionId}_${Date.now()}`
          : null

      // 5. Create the order
      const orderNumber = generateOrderNumber()
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId:      address.id,
          paymentMethod:  input.paymentMethod,
          paymentIntentId,
          paymentStatus:  'UNPAID',
          status:         'PENDING',
          subtotal:       input.subtotal,
          discountAmount: input.discountAmount ?? 0,
          shippingCost:   input.shipping,
          total:          input.total,
          couponCode:     input.couponCode ?? null,
          items: {
            create: input.items.map((item, idx) => {
              const vd = variantDetails[idx]
              return {
                variantId:   item.variantId,
                productId:   vd?.productId ?? '',
                productName: vd?.product?.name ?? 'Unknown',
                variantSku:  vd?.sku ?? '',
                size:        vd?.size ?? null,
                color:       vd?.color ?? null,
                imageUrl:    vd?.product?.images?.[0]?.url ?? null,
                quantity:    item.quantity,
                unitPrice:   item.price,
                totalPrice:  item.price * item.quantity,
              }
            }),
          },
        },
      })

      // 6. Increment coupon usageCount if one was applied
      if (input.couponCode) {
        await tx.coupon.updateMany({
          where: { code: input.couponCode },
          data:  { usageCount: { increment: 1 } },
        }).catch(() => { /* coupon table may differ */ })
      }

      // 7. Clear the DB cart
      await tx.cart.deleteMany({ where: { userId } }).catch(() => { /* silent if no cart table */ })

      const emailItems = input.items.map((item, idx) => ({
        name:     variantDetails[idx]?.product?.name ?? 'Product',
        quantity: item.quantity,
        price:    `৳${(item.price * item.quantity).toFixed(2)}`,
      }))

      return { order: newOrder, emailItems }
    })

    // Clear Redis cart (fire-and-forget, redis may be null)
    if (redis) {
      redis.del(`cart:${userId}`).catch(() => null)
    }

    // Send confirmation email (fire-and-forget)
    if (session.user.email) {
      sendOrderConfirmation({
        to:          session.user.email,
        orderNumber: order.orderNumber,
        total:       `৳${Number(order.total).toFixed(2)}`,
        items:       emailItems,
      }).catch((e: unknown) => console.error('[placeOrder] email failed:', e))
    }

    revalidatePath('/account/orders')

    return { success: true, orderId: order.id, orderNumber: order.orderNumber }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to place order'
    console.error('[placeOrder]', err)
    return { success: false, error: message }
  }
}

export async function getOrderById(orderId: string) {
  const session = await auth()
  if (!session?.user?.id) return null
  return prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: { address: true, items: true },
  }).catch(() => null)
}
