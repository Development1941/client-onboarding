'use client'

import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { formatCr } from '@/data/mock'
import { PageHeader } from '@/components/PageHeader'
import { Badge, EmptyState, Section, statusTone } from '@/components/ui'

export default function ClientOverviewPage() {
  const { user, getCase, getCompany } = useApp()
  const caseItem = user?.caseId ? getCase(user.caseId) : undefined
  const company = caseItem ? getCompany(caseItem.companyId) : undefined

  if (!caseItem || !company) {
    return (
      <EmptyState
        title="No case linked"
        description="Your account is not linked to an active case. Contact the Embee team."
      />
    )
  }

  const sections = [
    {
      href: '/client/company',
      title: 'Company profile',
      body: 'Review business particulars shared with Embee for this case.',
    },
    {
      href: '/client/requirement',
      title: 'Requirement',
      body: `Complete ${caseItem.caseType} fields and the amount sought.`,
    },
    {
      href: '/client/documents',
      title: 'Documents',
      body: 'Upload financials, bank statements, KYC and other supporting files.',
    },
    {
      href: '/client/questions',
      title: 'Ask Embee',
      body: 'Add other information or questions for the Embee team.',
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Screen 3 · Client view"
        title={company.name}
        description="You can see only this case. There is no case list, no other companies, and no funder information."
        breadcrumbs={[
          { label: 'Client workspace' },
          { label: 'Status' },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-line bg-panel px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Case type
          </p>
          <p className="mt-1 text-[14px] font-semibold text-ink">
            {caseItem.caseType}
          </p>
        </div>
        <div className="border border-line bg-panel px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Amount sought
          </p>
          <p className="mt-1 text-[14px] font-semibold text-ink">
            {formatCr(caseItem.fields.amountSought)}
          </p>
        </div>
        <div className="border border-line bg-panel px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Status
          </p>
          <div className="mt-1.5">
            <Badge tone={statusTone(caseItem.status)}>{caseItem.status}</Badge>
          </div>
        </div>
        <div className="border border-line bg-panel px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Link expires
          </p>
          <p className="mt-1 text-[14px] font-semibold text-ink">
            {caseItem.clientLinkExpires}
          </p>
        </div>
      </div>

      <Section
        title="Continue filling your case"
        subtitle={`Assigned Embee contact: ${caseItem.assignedAdmin} · Completeness ${caseItem.completionPct}%`}
      >
        <div className="mb-4 h-2 w-full bg-stone-200">
          <div
            className="h-2 bg-embee-700"
            style={{ width: `${caseItem.completionPct}%` }}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="border border-line px-4 py-4 transition hover:border-embee-300 hover:bg-embee-50/40"
            >
              <p className="text-[14px] font-semibold text-ink">{s.title}</p>
              <p className="mt-1 text-[13px] text-muted">{s.body}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Requirement summary" subtitle="As currently recorded on your case">
        <p className="text-[14px] leading-relaxed text-ink">
          {caseItem.fields.requirementText ||
            'No requirement text yet — open Requirement to add it.'}
        </p>
      </Section>
    </div>
  )
}
