'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'
import { requireAdmin } from '@/lib/admin-auth'

export async function updateOrderStatus(orderId: string, status: string) {
  if (!await requireAdmin()) throw new Error('Unauthorized')
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  })
  revalidatePath('/admin/orders')
  return { success: true }
}

export async function deleteProduct(productId: string) {
  if (!await requireAdmin()) throw new Error('Unauthorized')
  await prisma.product.delete({ where: { id: productId } })
  revalidatePath('/admin/products')
  return { success: true }
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  if (!await requireAdmin()) throw new Error('Unauthorized')
  await prisma.product.update({ where: { id: productId }, data: { isActive } })
  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteCategory(categoryId: string) {
  if (!await requireAdmin()) throw new Error('Unauthorized')
  const productCount = await prisma.product.count({ where: { categoryId } })
  if (productCount > 0) throw new Error('Cannot delete category with products')
  await prisma.category.delete({ where: { id: categoryId } })
  revalidatePath('/admin/categories')
  return { success: true }
}
