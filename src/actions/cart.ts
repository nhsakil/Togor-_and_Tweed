'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { CART_EXPIRY_DAYS } from '@/lib/constants'
import { revalidatePath } from 'next/cache'
import type { CartItem } from '@/types/cart'
import { z } from 'zod'

const addToCartSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
})

function cartKey(userId: string) {
  return `cart:${userId}`
}

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { variant: { include: { product: { include: { images: { where: { isDefault: true } } } } } } } } },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { variant: { include: { product: { include: { images: { where: { isDefault: true } } } } } } } } },
    })
  }

  return cart
}

export async function addToCart(input: { variantId: string; quantity: number }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Please sign in to add items to your cart' }
  }

  const parsed = addToCartSchema.safeParse(input)

  if (!parsed.success) {
    return { error: 'Invalid input' }
  }

  const { variantId, quantity } = parsed.data
  const userId = session.user.id

  // Check stock
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, stock: true, reservedQty: true, isActive: true },
  })

  if (!variant || !variant.isActive) {
    return { error: 'Product variant not available' }
  }

  const available = variant.stock - variant.reservedQty
  if (available < quantity) {
    return { error: `Only ${available} items available` }
  }

  // Get or create cart
  const cart = await getOrCreateCart(userId)

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  })

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    })
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { reservedQty: { increment: quantity } },
    })
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId, quantity },
    })
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { reservedQty: { increment: quantity } },
    })
  }

  // Touch Cart.updatedAt so admin Cart Leads "last active" time stays current
  await prisma.cart.update({ where: { id: cart.id }, data: {} })

  // Sync to Redis
  await syncCartToRedis(userId)

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function removeFromCart(variantId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const userId = session.user.id
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) return { success: true }

  const item = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  })

  if (item) {
    await prisma.cartItem.delete({ where: { id: item.id } })
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { reservedQty: { decrement: item.quantity } },
    })
  }

  await syncCartToRedis(userId)
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateCartItemQuantity(variantId: string, quantity: number) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  if (quantity <= 0) return removeFromCart(variantId)

  const userId = session.user.id
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) return { error: 'Cart not found' }

  // Read current quantity so we can adjust reservedQty by the delta
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    select: { quantity: true },
  })

  if (!existing) return { error: 'Item not found in cart' }

  const delta = quantity - existing.quantity

  if (delta !== 0) {
    // Validate available stock when increasing
    if (delta > 0) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { stock: true, reservedQty: true, isActive: true },
      })
      if (!variant || !variant.isActive) return { error: 'Product no longer available' }
      const available = variant.stock - variant.reservedQty
      if (available < delta) {
        return { error: `Only ${available} more item${available === 1 ? '' : 's'} available` }
      }
    }

    // Update reservedQty on the variant to track the change
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { reservedQty: { increment: delta } },
    })
  }

  await prisma.cartItem.update({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    data: { quantity },
  })

  await syncCartToRedis(userId)
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function getCart(): Promise<CartItem[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const userId = session.user.id

  // Try Redis cache first (redis may be null if UPSTASH_REDIS env vars not set)
  if (redis) {
    const cached = await redis.get<CartItem[]>(cartKey(userId)).catch(() => null)
    if (cached) return cached
  }

  return syncCartToRedis(userId)
}

async function syncCartToRedis(userId: string): Promise<CartItem[]> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { where: { isDefault: true }, take: 1 },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!cart) return []

  const items: CartItem[] = cart.items.map((item) => {
    const variant = item.variant
    const product = variant.product
    const image = product.images[0]
    const price = Number(variant.price ?? product.basePrice)

    return {
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: image?.url ?? null,
      size: variant.size,
      color: variant.color,
      price,
      quantity: item.quantity,
    }
  })
  if (redis) {
    await redis.setex(cartKey(userId), CART_EXPIRY_DAYS * 86400, JSON.stringify(items)).catch(() => null)
  }
  return items
}
