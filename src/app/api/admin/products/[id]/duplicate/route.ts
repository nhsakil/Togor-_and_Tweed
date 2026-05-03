import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

function uniqueSlug(base: string) {
  const suffix = Date.now().toString(36)
  return `${base}-copy-${suffix}`
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return unauthorized()

  const { id } = await params

  const original = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      images: true,
    },
  })

  if (!original) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  // Build a unique slug
  const newSlug = uniqueSlug(original.slug)

  const copy = await prisma.product.create({
    data: {
      name:        original.name + ' (Copy)',
      slug:        newSlug,
      description: original.description,
      categoryId:  original.categoryId,
      basePrice:   original.basePrice,
      salePrice:   original.salePrice,
      brand:       original.brand,
      tags:        original.tags,
      isFeatured:  false,
      isActive:    false,       // draft by default
      metaTitle:   original.metaTitle,
      metaDesc:    original.metaDesc,
      sizeChartId: original.sizeChartId,

      // Copy images
      images: {
        create: original.images.map(img => ({
          url:       img.url,
          publicId:  img.publicId,
          altText:   img.altText,
          sortOrder: img.sortOrder,
          isDefault: img.isDefault,
        })),
      },

      // Copy variants with new SKUs
      variants: {
        create: original.variants.map((v, i) => ({
          sku:        `${v.sku}-copy-${Date.now().toString(36)}-${i}`,
          size:       v.size,
          color:      v.color,
          colorHex:   v.colorHex,
          price:      v.price,
          salePrice:  v.salePrice,
          stock:      v.stock,
          weight:     v.weight,
          isActive:   v.isActive,
        })),
      },
    },
    select: { id: true, slug: true, name: true },
  })

  return NextResponse.json({ data: copy })
}
