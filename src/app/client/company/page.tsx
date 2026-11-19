'use client'

import { useApp } from '@/context/AppContext'
import { PageHeader } from '@/components/PageHeader'
import { Badge, EmptyState, Section } from '@/components/ui'

export default function ClientCompanyPage() {
  const { user, getCase, getCompany } = useApp()
  const caseItem = user?.caseId ? getCase(user.caseId) : undefined
  const company = caseItem ? getCompany(caseItem.companyId) : undefined

  if (!caseItem || !company) {
    return (
      <EmptyState
        title="No case linked"
        description="Contact Embee if you expected to see a company profile here."
      />
    )
  }

  const shareTotal = company.shareholders.reduce(
    (s, row) => s + row.percentage,
    0,
  )

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Client · Company"
        title="Company profile"
        description="These particulars are shared with Embee for your case. Contact your Embee lead if corrections are needed."
        breadcrumbs={[
          { label: 'Client workspace', href: '/client' },
          { label: 'Company' },
        ]}
      />

      <Section title="Registered particulars">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Legal name" value={company.name} />
          <Info label="Constitution" value={company.constitution} />
          <Info label="Incorporation year" value={String(company.incorporationYear)} />
          <Info label="CIN / LLPIN" value={company.cin} />
          <Info label="PAN" value={company.pan} />
          <Info label="GSTIN" value={company.gstin ?? '—'} />
          <Info
            label="Registered office"
            value={company.registeredAddress}
            className="sm:col-span-2 lg:col-span-3"
          />
          <Info
            label="Locations"
            value={company.locations}
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>
      </Section>

      <Section title="Business description">
        <p className="text-[14px] leading-relaxed text-ink">
          {company.businessDescription}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Info label="Products / services" value={company.products} />
          <Info label="Capacities" value={company.capacities} />
          <Info
            label="Key clients"
            value={company.keyClients}
            className="sm:col-span-2"
          />
        </div>
      </Section>

      <Section title="Directors / partners / key people">
        <div className="space-y-3">
          {company.people.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-start justify-between gap-3 border border-line px-4 py-3"
            >
              <div>
                <p className="text-[14px] font-semibold text-ink">{p.name}</p>
                <p className="text-[12px] text-embee-800">{p.role}</p>
                {p.din ? (
                  <p className="mt-1 text-[12px] text-muted">DIN / ID: {p.din}</p>
                ) : null}
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {p.profile}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Shareholding pattern"
        subtitle={`Total ${shareTotal.toFixed(2)}%`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-[0.08em] text-muted">
                <th className="pb-2 font-semibold">Shareholder</th>
                <th className="pb-2 font-semibold">Type</th>
                <th className="pb-2 font-semibold">%</th>
              </tr>
            </thead>
            <tbody>
              {company.shareholders.map((s) => (
                <tr key={s.id} className="border-b border-line/70">
                  <td className="py-2.5 font-medium text-ink">{s.name}</td>
                  <td className="py-2.5">
                    <Badge>{s.type}</Badge>
                  </td>
                  <td className="py-2.5 tabular-nums">{s.percentage.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}

function Info({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-[14px] text-ink">{value}</p>
    </div>
  )
}
