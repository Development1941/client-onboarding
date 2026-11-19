'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'

export function AuthGate({
  children,
  role,
}: {
  children: React.ReactNode
  role?: 'admin' | 'client'
}) {
  const { user, ready } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ready) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (role && user.role !== role) {
      router.replace(user.role === 'admin' ? '/' : '/client')
    }
  }, [ready, user, role, router, pathname])

  if (!ready || !user || (role && user.role !== role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-muted">
        Loading…
      </div>
    )
  }

  return <>{children}</>
}
