'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import type { Session } from 'next-auth'

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session?: Session | null
}) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #c8a96e',
          },
        }}
      />
    </SessionProvider>
  )
}
