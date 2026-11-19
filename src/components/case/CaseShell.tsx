'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { formatCr } from '@/data/mock'
import { Badge, EmptyState, statusTone } from '@/components/ui'

const NAV = [
  {
    group: 'Intake',
    items: [
      { slug: 'company', label: 'Company details', hint: 'Screen 1' },
      { slug: 'documents', label: 'Financial & documents', hint: 'Screen 2' },
      { slug: 'requirement', label: 'Case requirement', hint: 'Template fields' },
    ],
  },
  {
    group: 'Review',
    items: [
      { slug: 'extraction', label: 'Extraction review', hint: 'Confirm values' },
      { slug: 'mandate', label: 'Mandate & NDA', hint: 'Admin only' },
    ],
  },
  {
    group: 'Output',
    items: [
      { slug: 'twopager', label: 'Two-pager', hint: 'Funder profile' },
      { slug: 'circulation', label: 'Circulation', hint: 'Match & send' },
      { slug: 'audit', label: 'Audit log', hint: 'Change trail' },
    ],
  },
]

export function CaseShell({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const { getCase, getCompany } = useApp()
  const caseItem = getCase(id)
  const company = caseItem ? getCompany(caseItem.companyId) : undefined

  if (!caseItem || !company) {
    return (
      <EmptyState
        title="Case not found"
        description="This case may have been removed or the link is invalid."
      />
    )
  }

  const active = pathname.split('/').pop() || 'company'

  return (
    <div className="space-y-5">
      <div className="border border-line bg-panel">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <nav className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
              <Link href="/" className="hover:text-embee-800">
                Cases
              </Link>
              <span className="text-stone-300">/</span>
              <span className="text-ink">{company.name}</span>
            </nav>
            <h1 className="font-display text-[1.85rem] leading-tight text-ink">
              {company.name}
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              {caseItem.caseType} · {formatCr(caseItem.fields.amountSought)} ·{' '}
              {caseItem.assignedAdmin} · Completeness {caseItem.completionPct}%
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="red">{caseItem.caseType}</Badge>
            <Badge tone={statusTone(caseItem.status)}>{caseItem.status}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 px-5 py-2.5 text-[12px] text-muted">
          <span>
            Mandate:{' '}
            <strong className="text-ink">{caseItem.mandateStatus}</strong>
          </span>
          <span>
            NDA: <strong className="text-ink">{caseItem.ndaStatus}</strong>
          </span>
          <span>
            Client link:{' '}
            <code className="border border-embee-200 bg-embee-50 px-1.5 py-0.5 font-mono text-[11px] text-embee-900">
              /c/{caseItem.clientLinkToken}
            </code>
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit border border-line bg-panel lg:sticky lg:top-[4.5rem]">
          <div className="border-b border-line px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Case sections
            </p>
          </div>
          <nav className="space-y-4 px-2 py-3">
            {NAV.map((group) => (
              <div key={group.group}>
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = active === item.slug
                    return (
                      <Link
                        key={item.slug}
                        href={`/cases/${id}/${item.slug}`}
                        className={`block border-l-2 px-3 py-2 transition ${
                          isActive
                            ? 'border-embee-800 bg-embee-50 text-embee-950'
                            : 'border-transparent text-muted hover:bg-surface hover:text-ink'
                        }`}
                      >
                        <span className="block text-[13px] font-semibold">
                          {item.label}
                        </span>
                        <span className="block text-[11px] opacity-75">
                          {item.hint}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
