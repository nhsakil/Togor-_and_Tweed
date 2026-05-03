'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ── Profile ────────────────────────────────────────────────────────────────────

export async function updateProfile(data: { name?: string; phone?: string }) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name?.trim() || null,
        phone: data.phone?.trim() || null,
      },
    })
    revalidatePath('/account')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update profile' }
  }
}

// ── Addresses ─────────────────────────────────────────────────────────────────

export async function getAddresses() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
  }).catch(() => [])
}

export async function saveAddress(data: {
  id?: string
  firstName: string
  lastName: string
  phone?: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  isDefault?: boolean
}) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' }

  const userId = session.user.id

  try {
    // If setting as default, unset other defaults first
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    if (data.id) {
      // Update existing
      await prisma.address.update({
        where: { id: data.id, userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone ?? null,
          line1: data.line1,
          line2: data.line2 ?? null,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          isDefault: data.isDefault ?? false,
        },
      })
    } else {
      await prisma.address.create({
        data: {
          userId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone ?? null,
          line1: data.line1,
          line2: data.line2 ?? null,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: 'BD',
          isDefault: data.isDefault ?? false,
        },
      })
    }

    revalidatePath('/account/addresses')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to save address' }
  }
}

export async function deleteAddress(addressId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' }

  try {
    await prisma.address.deleteMany({
      where: { id: addressId, userId: session.user.id },
    })
    revalidatePath('/account/addresses')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete address' }
  }
}

// ── Wishlist ───────────────────────────────────────────────────────────────────

export async function toggleWishlist(productId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Not authenticated', added: false }

  const userId = session.user.id

  try {
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    })

    if (existing) {
      await prisma.wishlist.delete({ where: { userId_productId: { userId, productId } } })
      revalidatePath('/account/wishlist')
      return { success: true, added: false }
    } else {
      await prisma.wishlist.create({ data: { userId, productId } })
      revalidatePath('/account/wishlist')
      return { success: true, added: true }
    }
  } catch {
    return { success: false, error: 'Failed to update wishlist', added: false }
  }
}
