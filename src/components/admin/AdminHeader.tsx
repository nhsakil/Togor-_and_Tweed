import { signOut } from '@/lib/auth'
import { LogOut } from 'lucide-react'

interface Props {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function AdminHeader({ user }: Props) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.name ?? user.email}</span>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </header>
  )
}
