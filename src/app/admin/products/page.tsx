import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import StatusBadge from '@/components/admin/StatusBadge'
import DeleteProductButton from '@/components/admin/DeleteProductButton'
import DuplicateProductButton from '@/components/admin/DuplicateProductButton'
import ProductSearchForm from '@/components/admin/ProductSearchForm'

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { page: pageParam, search = '' } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const limit = 20
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { brand: { contains: search } },
        ],
      }
    : {}

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        images: { where: { isDefault: true }, take: 1 },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{total} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>

      <ProductSearchForm defaultValue={search} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variants
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].altText ?? product.name}
                            className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-xs">
                            {product.name}
                          </p>
                          {product.brand && (
                            <p className="text-xs text-gray-400">{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category.name}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900">
                          ৳{Number(product.basePrice).toLocaleString()}
                        </span>
                        {product.salePrice && (
                          <span className="text-xs text-green-600 ml-1">
                            (৳{Number(product.salePrice).toLocaleString()})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product._count.variants}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DuplicateProductButton productId={product.id} productName={product.name} />
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/products?page=${page - 1}${search ? `&search=${search}` : ''}`}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/products?page=${page + 1}${search ? `&search=${search}` : ''}`}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
