'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { formatCr } from '@/data/mock'
import type { CaseType } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import {
  Badge,
  Button,
  Field,
  Input,
  Section,
  Select,
  Stat,
  Textarea,
  statusTone,
} from '@/components/ui'

const CASE_TYPES: CaseType[] = [
  'Term Loan',
  'CC Limit',
  'Takeover',
  'Buyback Funding',
  'Special Situation',
  'Acquisition Finance',
]

export default function DashboardPage() {
  const { cases, companies, getCompany, createCase } = useApp()
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({
    companyId: companies[0]?.id ?? '',
    caseType: 'Term Loan' as CaseType,
    amountSought: 25,
    requirementText: '',
  })

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const company = getCompany(c.companyId)
      const q = query.toLowerCase()
      const matchesQ =
        !q ||
        company?.name.toLowerCase().includes(q) ||
        c.caseType.toLowerCase().includes(q) ||
        c.assignedAdmin.toLowerCase().includes(q)
      const matchesType = typeFilter === 'All' || c.caseType === typeFilter
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter
      return matchesQ && matchesType && matchesStatus
    })
  }, [cases, getCompany, query, typeFilter, statusFilter])

  const stats = useMemo(
    () => ({
      total: cases.length,
      review: cases.filter((c) => c.status === 'Under Review').length,
      ready: cases.filter((c) => c.status === 'Ready for Circulation').length,
      circulated: cases.filter((c) => c.status === 'Circulated').length,
    }),
    [cases],
  )

  function handleCreate() {
    const created = createCase(form)
    setShowNew(false)
    router.push(`/cases/${created.id}`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Screen 1"
        title="Case dashboard"
        description="Administrators see every case. Filter by type and status, open any record, or create a new intake. Clients never see this screen."
        breadcrumbs={[
          { label: 'Embee' },
          { label: 'Onboarding' },
          { label: 'Cases' },
        ]}
        actions={<Button onClick={() => setShowNew(true)}>New case</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total cases" value={stats.total} hint="Across all companies" />
        <Stat label="Under review" value={stats.review} hint="Awaiting extraction confirm" />
        <Stat label="Ready to circulate" value={stats.ready} hint="Two-pager approved path" />
        <Stat label="Circulated" value={stats.circulated} hint="Sent to funders" />
      </div>

      <Section
        title="Pipeline"
        subtitle={`${filtered.length} case${filtered.length === 1 ? '' : 's'} matching current filters`}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Input
              placeholder="Search company, type, admin…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:w-56"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All types</option>
              {CASE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              {[
                'Draft',
                'Client Filling',
                'Under Review',
                'Ready for Circulation',
                'Circulated',
                'Closed',
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-[0.08em] text-muted">
                <th className="pb-3 pr-3 font-semibold">Company</th>
                <th className="pb-3 pr-3 font-semibold">Type</th>
                <th className="pb-3 pr-3 font-semibold">Amount</th>
                <th className="pb-3 pr-3 font-semibold">Status</th>
                <th className="pb-3 pr-3 font-semibold">Completeness</th>
                <th className="pb-3 pr-3 font-semibold">Mandate / NDA</th>
                <th className="pb-3 pr-3 font-semibold">Admin</th>
                <th className="pb-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const company = getCompany(c.companyId)
                return (
                  <tr
                    key={c.id}
                    className="border-b border-line/80 transition hover:bg-embee-50/40"
                  >
                    <td className="py-3.5 pr-3">
                      <Link
                        href={`/cases/${c.id}`}
                        className="font-semibold text-ink hover:text-embee-800"
                      >
                        {company?.name ?? '—'}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-muted">{c.sector}</p>
                    </td>
                    <td className="py-3.5 pr-3">
                      <Badge tone="red">{c.caseType}</Badge>
                    </td>
                    <td className="py-3.5 pr-3 font-medium tabular-nums">
                      {formatCr(c.fields.amountSought)}
                    </td>
                    <td className="py-3.5 pr-3">
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-stone-200">
                          <div
                            className="h-1.5 bg-embee-700"
                            style={{ width: `${c.completionPct}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-muted">
                          {c.completionPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge tone={statusTone(c.mandateStatus)}>
                          M · {c.mandateStatus}
                        </Badge>
                        <Badge tone={statusTone(c.ndaStatus)}>
                          N · {c.ndaStatus}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-muted">{c.assignedAdmin}</td>
                    <td className="py-3.5 tabular-nums text-muted">
                      {c.updatedAt}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-muted">
              No cases match these filters.
            </p>
          ) : null}
        </div>
      </Section>

      {showNew ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center">
          <div className="w-full max-w-lg border border-line bg-panel shadow-2xl">
            <div className="border-b border-line px-6 py-4">
              <h3 className="font-display text-[1.6rem] text-ink">Create case</h3>
              <p className="mt-1 text-[13px] text-muted">
                Starts with the common core. Template fields follow the selected
                case type.
              </p>
            </div>
            <div className="space-y-4 px-6 py-5">
              <Field label="Company">
                <Select
                  value={form.companyId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, companyId: e.target.value }))
                  }
                >
                  {companies.map((co) => (
                    <option key={co.id} value={co.id}>
                      {co.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Case type">
                <Select
                  value={form.caseType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      caseType: e.target.value as CaseType,
                    }))
                  }
                >
                  {CASE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Amount sought (₹ Cr)">
                <Input
                  type="number"
                  value={form.amountSought}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      amountSought: Number(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Requirement summary">
                <Textarea
                  value={form.requirementText}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      requirementText: e.target.value,
                    }))
                  }
                  placeholder="Brief requirement for the intake record…"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
              <Button variant="secondary" onClick={() => setShowNew(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create & open</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
