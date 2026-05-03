'use server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  return session
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin()
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  })
  revalidatePath('/admin/orders')
  return { success: true }
}

export async function deleteProduct(productId: string) {
  await requireAdmin()
  await prisma.product.delete({ where: { id: productId } })
  revalidatePath('/admin/products')
  return { success: true }
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  await requireAdmin()
  await prisma.product.update({ where: { id: productId }, data: { isActive } })
  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin()
  const productCount = await prisma.product.count({ where: { categoryId } })
  if (productCount > 0) throw new Error('Cannot delete category with products')
  await prisma.category.delete({ where: { id: categoryId } })
  revalidatePath('/admin/categories')
  return { success: true }
}
