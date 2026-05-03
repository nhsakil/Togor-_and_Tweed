import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return unauthorized()
  const { searchParams } = new URL(req.url)
  const page   = parseInt(searchParams.get('page')   ?? '1')
  const limit  = parseInt(searchParams.get('limit')  ?? '20')
  const search = searchParams.get('search') ?? ''
  const where  = search ? { OR: [{ name: { contains: search } }, { brand: { contains: search } }] } : {}
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip: (page - 1) * limit, take: limit,
      include: {
        category: { select: { name: true } },
        images:   { where: { isDefault: true }, take: 1 },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])
  return NextResponse.json({ data: products, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return unauthorized()
  try {
    const body = await req.json()
    const { variants = [], ...rest } = body

    // Core product data — only fields that are guaranteed to exist in the DB
    const coreData: Record<string, unknown> = {
      name:       rest.name?.trim(),
      slug:       (rest.slug?.trim()) || rest.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      categoryId: rest.categoryId,
      basePrice:  parseFloat(rest.basePrice),
      salePrice:  rest.salePrice ? parseFloat(rest.salePrice) : null,
      brand:      rest.brand?.trim() || null,
      isFeatured: rest.isFeatured ?? false,
      isActive:   rest.isActive   ?? true,
    }

    // Safely add optional columns that may not exist yet (added via migration)
    if (rest.description !== undefined) coreData.description = rest.description || null
    if (rest.tags        !== undefined) coreData.tags        = rest.tags        || null
    if (rest.metaTitle   !== undefined) coreData.metaTitle   = rest.metaTitle   || null
    if (rest.metaDesc    !== undefined) coreData.metaDesc    = rest.metaDesc    || null
    if (rest.sizeChartId !== undefined) coreData.sizeChartId = rest.sizeChartId || null

    // Validate required fields
    if (!coreData.name)       return NextResponse.json({ error: 'Product name is required' },    { status: 400 })
    if (!coreData.categoryId) return NextResponse.json({ error: 'Category is required' },        { status: 400 })
    if (isNaN(coreData.basePrice as number)) return NextResponse.json({ error: 'Valid base price is required' }, { status: 400 })

    // Add variants if provided
    if (variants.length > 0) {
      coreData.variants = {
        create: variants.map((v: {
          sku: string; size?: string; color?: string; colorHex?: string
          price?: string; salePrice?: string; stock?: string
        }) => ({
          sku:       v.sku?.trim(),
          size:      v.size     || null,
          color:     v.color    || null,
          colorHex:  v.colorHex || null,
          price:     v.price    ? parseFloat(v.price)     : null,
          salePrice: v.salePrice? parseFloat(v.salePrice) : null,
          stock:     parseInt(v.stock ?? '0') || 0,
          isActive:  true,
        })),
      }
    }

    const product = await prisma.product.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: coreData as any,
      include: { variants: true },
    })

    return NextResponse.json({ data: product }, { status: 201 })

  } catch (err: unknown) {
    console.error('[Product Create Error]', err)

    // Provide actionable error for known schema issues
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Unknown column') || msg.includes("doesn't exist")) {
      return NextResponse.json({
        error: 'Database schema is out of date. Run `npx prisma db push` in your project folder, then try again.',
      }, { status: 500 })
    }
    if (msg.includes('Unique constraint') || msg.includes('Duplicate entry')) {
      return NextResponse.json({
        error: 'A product with this slug or a variant with this SKU already exists.',
      }, { status: 400 })
    }

    return NextResponse.json({ error: msg || 'Failed to create product' }, { status: 500 })
  }
}
