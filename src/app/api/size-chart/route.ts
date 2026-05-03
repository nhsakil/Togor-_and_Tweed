import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json({ data: null })

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      sizeChartId: true,
      category: { select: { sizeChartId: true } },
    },
  }).catch(() => null)

  const chartId = product?.sizeChartId ?? product?.category?.sizeChartId ?? null
  if (!chartId) return NextResponse.json({ data: null })

  const chart = await prisma.sizeChart.findUnique({
    where: { id: chartId },
    include: { rows: { orderBy: { sortOrder: 'asc' } } },
  }).catch(() => null)

  if (!chart) return NextResponse.json({ data: null })

  return NextResponse.json({
    data: {
      id: chart.id,
      name: chart.name,
      columns: JSON.parse(chart.columns) as string[],
      rows: chart.rows.map(r => ({ id: r.id, values: JSON.parse(r.values) as string[] })),
    },
  })
}
