import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()
  const { id } = await params
  const chart = await prisma.sizeChart.findUnique({
    where: { id },
    include: {
      rows: { orderBy: { sortOrder: 'asc' } },
      categories: { select: { id: true, name: true, slug: true } },
      products:   { select: { id: true, name: true, slug: true } },
    },
  })
  if (!chart) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: chart })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()
  const { id } = await params
  const body = await request.json()
  const { name, description, columns, rows, categoryIds } = body

  // Replace rows atomically
  await prisma.$transaction(async (tx) => {
    await tx.sizeChart.update({
      where: { id },
      data: {
        name: name?.trim() ?? undefined,
        description: description ?? null,
        columns: columns ? JSON.stringify(columns) : undefined,
      },
    })

    if (Array.isArray(rows)) {
      await tx.sizeChartRow.deleteMany({ where: { sizeChartId: id } })
      if (rows.length > 0) {
        await tx.sizeChartRow.createMany({
          data: rows.map((r: { values: string[] }, i: number) => ({
            sizeChartId: id,
            sortOrder: i,
            values: JSON.stringify(r.values),
          })),
        })
      }
    }

    // Update linked categories (set sizeChartId on matching, clear on others that had this chart)
    if (Array.isArray(categoryIds)) {
      await tx.category.updateMany({
        where: { sizeChartId: id, id: { notIn: categoryIds } },
        data: { sizeChartId: null },
      })
      if (categoryIds.length > 0) {
        await tx.category.updateMany({
          where: { id: { in: categoryIds } },
          data: { sizeChartId: id },
        })
      }
    }
  })

  const updated = await prisma.sizeChart.findUnique({
    where: { id },
    include: {
      rows: { orderBy: { sortOrder: 'asc' } },
      categories: { select: { id: true, name: true, slug: true } },
      products:   { select: { id: true, name: true, slug: true } },
    },
  })
  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()
  const { id } = await params
  // Unlink before delete
  await prisma.category.updateMany({ where: { sizeChartId: id }, data: { sizeChartId: null } })
  await prisma.product.updateMany({ where: { sizeChartId: id }, data: { sizeChartId: null } })
  await prisma.sizeChart.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
