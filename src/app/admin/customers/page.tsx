'use server'

import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const { page: pageParam, search = '' } = await searchParams
  const page  = Math.max(1, parseInt(pageParam ?? '1', 10))
  const limit = 20
  const skip  = (page - 1) * limit

  const where = {
    role: 'CUSTOMER' as const,
    ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
  }

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, image: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{total} registered {total === 1 ? 'customer' : 'customers'}</p>
        </div>
        {search && (
          <Link href="/admin/customers" className="text-sm text-gray-500 hover:text-gray-700">
            Clear search
          </Link>
        )}
      </div>

      <form method="GET" action="/admin/customers" className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name or email..."
          className="flex-1 max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Search
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.image} alt={c.name ?? 'Customer'} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-emerald-600">
                              {(c.name ?? c.email ?? '?')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{c.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{c.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        c._count.orders > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {c._count.orders} {c._count.orders === 1 ? 'order' : 'orders'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/customers?page=${page - 1}${search ? `&search=${search}` : ''}`}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Previous</Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/customers?page=${page + 1}${search ? `&search=${search}` : ''}`}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Next</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
