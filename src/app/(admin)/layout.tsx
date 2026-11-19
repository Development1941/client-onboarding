'use client'

import { AuthGate } from '@/components/AuthGate'
import { AdminShell } from '@/components/Layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGate role="admin">
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  )
}
