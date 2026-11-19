'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Badge, EmptyState, Section, statusTone } from '@/components/ui'
import { formatCr } from '@/data/mock'

export default function ClientLinkPage() {
  const { token } = useParams<{ token: string }>()
  const { ready, user, login, getCaseByToken, getCompany } = useApp()
  const router = useRouter()
  const caseItem = getCaseByToken(token)
  const company = caseItem ? getCompany(caseItem.companyId) : undefined

  useEffect(() => {
    if (!ready || !caseItem) return
    if (user?.role === 'client' && user.caseId === caseItem.id) {
      router.replace('/client')
    }
  }, [ready, user, caseItem, router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </div>
    )
  }

  if (!caseItem || !company) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="Link invalid or expired"
          description="Ask your Embee contact for a fresh client link."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#fdf3f3_0%,_#faf7f7_50%,_#f5f0f0_100%)]">
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-embee-800 text-sm font-bold text-white">
            E
          </span>
          <h1 className="mt-4 font-display text-4xl text-ink">
            Private case link
          </h1>
          <p className="mt-2 text-sm text-muted">
            Opens only this case. Expires {caseItem.clientLinkExpires}.
          </p>
        </div>

        <Section title={company.name}>
          <div className="flex flex-wrap gap-2">
            <Badge tone="red">{caseItem.caseType}</Badge>
            <Badge tone={statusTone(caseItem.status)}>{caseItem.status}</Badge>
          </div>
          <p className="mt-3 text-sm text-muted">
            {formatCr(caseItem.fields.amountSought)} · {caseItem.sector}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink">
            {caseItem.fields.requirementText ||
              'Requirement details will appear once the case is filled.'}
          </p>
          <button
            type="button"
            className="mt-6 w-full rounded-lg bg-embee-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-embee-900"
            onClick={() => {
              login('rajesh@aetherindustries.in')
              router.push('/client')
            }}
          >
            Continue as client
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Demo: continues as Rajesh Kapoor for the linked Aether case.
          </p>
        </Section>
      </div>
    </div>
  )
}
