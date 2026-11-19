'use client'

import { AuthGate } from '@/components/AuthGate'
import { ClientShell } from '@/components/Layout'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGate role="client">
      <ClientShell>{children}</ClientShell>
    </AuthGate>
  )
}
