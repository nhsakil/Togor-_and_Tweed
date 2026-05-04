'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import RoleSelector from '@/components/admin/RoleSelector'
import AddAdminForm from '@/components/admin/AddAdminForm'

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const { page: pageParam, search = '' } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const limit = 20
  const skip  = (page - 1) * limit

  const session      = await auth()
  const myRole       = (session?.user as { role?: string })?.role ?? ''
  const isSuperAdmin = myRole === 'SUPER_ADMIN'

  // Only show ADMIN and SUPER_ADMIN users on this page
  const where = {
    role: { in: ['ADMIN', 'SUPER_ADMIN'] as ('ADMIN' | 'SUPER_ADMIN')[] },
    ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-700',
      ADMIN:       'bg-blue-100 text-blue-700',
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>
        {role.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-gray-500 text-sm mt-1">{total} admin {total === 1 ? 'user' : 'users'}</p>
        </div>
        {search && (
          <Link href="/admin/users" className="text-sm text-gray-500 hover:text-gray-700">
            Clear search
          </Link>
        )}
      </div>

      <form method="GET" action="/admin/users" className="flex gap-2">
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

      {/* Add Admin form — SUPER_ADMIN only */}
      {isSuperAdmin && <AddAdminForm />}

      {isSuperAdmin && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-sm text-purple-700">
          You are logged in as <strong>Super Admin</strong> — you can add, promote, or demote admins.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Change Role</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-12 text-center text-gray-400">
                    No admin users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.image} alt={user.name ?? 'User'} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-indigo-600">
                              {(user.name ?? user.email ?? '?')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{user.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">{roleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-gray-600">{user._count.orders}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4">
                        <RoleSelector userId={user.id} currentRole={user.role} myId={(session?.user as { id?: string })?.id ?? ''} />
                      </td>
                    )}
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
                <Link href={`/admin/users?page=${page - 1}${search ? `&search=${search}` : ''}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Previous</Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/users?page=${page + 1}${search ? `&search=${search}` : ''}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Next</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
