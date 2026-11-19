'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import {
  formatCr,
  matchFunders,
  ratioDebtEquity,
  ratioEbitdaMargin,
} from '@/data/mock'
import type {
  Case,
  CirculationResponse,
  Company,
  MandateStatus,
} from '@/types'
import { CaseTypeFields } from '@/components/case/CaseTypeFields'
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Section,
  Select,
  Textarea,
  statusTone,
} from '@/components/ui'

export type CaseSectionId =
  | 'requirement'
  | 'extraction'
  | 'mandate'
  | 'circulation'
  | 'twopager'
  | 'audit'

export function CaseSection({ section }: { section: CaseSectionId }) {
  const params = useParams<{ id: string }>()
  const id = params.id
  const {
    getCase,
    getCompany,
    updateCase,
    updateCaseFields,
    updateExtraction,
    updateMandateNda,
    addDocument,
    addCirculation,
    updateCirculationStatus,
    circulations,
    funders,
    auditLog,
  } = useApp()

  const caseItem = getCase(id)
  const company = caseItem ? getCompany(caseItem.companyId) : undefined
  const caseCirculations = circulations.filter((c) => c.caseId === caseItem?.id)
  const matches = caseItem ? matchFunders(caseItem) : []
  const caseAudit = auditLog.filter((a) => a.caseId === caseItem?.id)

  if (!caseItem || !company) {
    return (
      <EmptyState
        title="Case not found"
        description="This case may have been removed or the link is invalid."
      />
    )
  }

  if (section === 'requirement') {
    return (
      <IntakeTab
        caseItem={caseItem}
        company={company}
        onSaveFields={(fields) => updateCaseFields(caseItem.id, fields)}
        onSaveCompanyMeta={(patch) => updateCase(caseItem.id, patch)}
      />
    )
  }

  if (section === 'extraction') {
    return (
      <ExtractionTab
        caseItem={caseItem}
        onReview={updateExtraction}
        onUpload={(doc) =>
          addDocument(caseItem.id, {
            name: doc.name,
            type: doc.type,
            category: 'other',
          })
        }
      />
    )
  }

  if (section === 'mandate') {
    return <MandateTab caseItem={caseItem} onUpdate={updateMandateNda} />
  }

  if (section === 'circulation') {
    return (
      <CirculationTab
        caseItem={caseItem}
        matches={matches}
        caseCirculations={caseCirculations}
        funders={funders}
        onSend={addCirculation}
        onUpdateStatus={updateCirculationStatus}
      />
    )
  }

  if (section === 'twopager') {
    return <TwoPagerPreview caseItem={caseItem} company={company} />
  }

  return (
    <Section title="Audit log" subtitle="Every edit with user and time">
      <ul className="space-y-3">
        {caseAudit.map((a) => (
          <li
            key={a.id}
            className="flex flex-col gap-0.5 border border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-ink">{a.action}</p>
              <p className="text-xs text-muted">{a.user}</p>
            </div>
            <p className="text-xs text-muted">{a.at}</p>
          </li>
        ))}
        {caseAudit.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Edits will appear here as the case progresses."
          />
        ) : null}
      </ul>
    </Section>
  )
}

function IntakeTab({
  caseItem,
  company,
  onSaveFields,
  onSaveCompanyMeta,
}: {
  caseItem: Case
  company: Company
  onSaveFields: (fields: Partial<Case['fields']>) => void
  onSaveCompanyMeta: (patch: Partial<Case>) => void
}) {
  const [fields, setFields] = useState(caseItem.fields)
  const [meta, setMeta] = useState({
    sector: caseItem.sector,
    geography: caseItem.geography,
    securityOffered: caseItem.securityOffered,
  })
  const [saved, setSaved] = useState(false)

  function save() {
    onSaveFields(fields)
    onSaveCompanyMeta(meta)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <Section
        title="Common core"
        subtitle="Existing on every case — company, people, facilities, financials"
        actions={
          <Button onClick={save}>{saved ? 'Saved' : 'Save changes'}</Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Constitution" value={company.constitution} />
          <Info label="CIN" value={company.cin} />
          <Info label="PAN" value={company.pan} />
          <Info label="Incorporation" value={String(company.incorporationYear)} />
          <Info label="Locations" value={company.locations} />
          <Info label="Key clients" value={company.keyClients} />
        </div>
        <p className="mt-4  bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
          {company.businessDescription}
        </p>

        <h3 className="mt-6 mb-3 text-sm font-semibold text-ink">People</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {company.people.map((p) => (
            <div
              key={p.id}
              className=" border border-line px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-embee-800">{p.role}</p>
                </div>
                <Badge>{p.shareholding}% SH</Badge>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {p.profile}
              </p>
            </div>
          ))}
        </div>

        <h3 className="mt-6 mb-3 text-sm font-semibold text-ink">
          Existing facilities
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted uppercase">
                <th className="pb-2 font-semibold">Lender</th>
                <th className="pb-2 font-semibold">Type</th>
                <th className="pb-2 font-semibold">Limit</th>
                <th className="pb-2 font-semibold">O/S</th>
                <th className="pb-2 font-semibold">Rate</th>
                <th className="pb-2 font-semibold">Security</th>
              </tr>
            </thead>
            <tbody>
              {company.facilities.map((f) => (
                <tr key={f.id} className="border-b border-line/60">
                  <td className="py-2.5">{f.lender}</td>
                  <td className="py-2.5">{f.facilityType}</td>
                  <td className="py-2.5">{formatCr(f.limit)}</td>
                  <td className="py-2.5">{formatCr(f.outstanding)}</td>
                  <td className="py-2.5">{f.interestRate}%</td>
                  <td className="py-2.5 text-muted">{f.security}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 mb-3 text-sm font-semibold text-ink">
          Financials (₹ Cr) & ratios
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted uppercase">
                <th className="pb-2 font-semibold">FY</th>
                <th className="pb-2 font-semibold">Revenue</th>
                <th className="pb-2 font-semibold">EBITDA</th>
                <th className="pb-2 font-semibold">PAT</th>
                <th className="pb-2 font-semibold">Net worth</th>
                <th className="pb-2 font-semibold">Debt</th>
                <th className="pb-2 font-semibold">EBITDA %</th>
                <th className="pb-2 font-semibold">D/E</th>
              </tr>
            </thead>
            <tbody>
              {company.financials.map((fy) => (
                <tr key={fy.id} className="border-b border-line/60">
                  <td className="py-2.5 font-medium">{fy.label}</td>
                  <td className="py-2.5">{fy.revenue}</td>
                  <td className="py-2.5">{fy.ebitda}</td>
                  <td className="py-2.5">{fy.pat}</td>
                  <td className="py-2.5">{fy.netWorth}</td>
                  <td className="py-2.5">{fy.debt}</td>
                  <td className="py-2.5">
                    {ratioEbitdaMargin(fy.revenue, fy.ebitda)}
                  </td>
                  <td className="py-2.5">
                    {ratioDebtEquity(fy.debt, fy.netWorth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title={`${caseItem.caseType} requirement`}
        subtitle="Template-specific fields for this case type"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount sought (₹ Cr)" className="sm:col-span-1">
            <Input
              type="number"
              value={fields.amountSought}
              onChange={(e) =>
                setFields((f) => ({
                  ...f,
                  amountSought: Number(e.target.value),
                }))
              }
            />
          </Field>
          <Field label="Sector">
            <Input
              value={meta.sector}
              onChange={(e) =>
                setMeta((m) => ({ ...m, sector: e.target.value }))
              }
            />
          </Field>
          <Field label="Geography">
            <Input
              value={meta.geography}
              onChange={(e) =>
                setMeta((m) => ({ ...m, geography: e.target.value }))
              }
            />
          </Field>
          <Field label="Security offered">
            <Input
              value={meta.securityOffered}
              onChange={(e) =>
                setMeta((m) => ({ ...m, securityOffered: e.target.value }))
              }
            />
          </Field>
          <Field label="Requirement" className="sm:col-span-2">
            <Textarea
              value={fields.requirementText}
              onChange={(e) =>
                setFields((f) => ({
                  ...f,
                  requirementText: e.target.value,
                }))
              }
            />
          </Field>
          <Field
            label="Other info / questions for Embee"
            className="sm:col-span-2"
          >
            <Textarea
              value={fields.otherInfo}
              onChange={(e) =>
                setFields((f) => ({ ...f, otherInfo: e.target.value }))
              }
            />
          </Field>

          <CaseTypeFields
            caseType={caseItem.caseType}
            fields={fields}
            setFields={(updater) => setFields((f) => updater(f))}
          />
        </div>
      </Section>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  )
}

function ExtractionTab({
  caseItem,
  onReview,
  onUpload,
}: {
  caseItem: Case
  onReview: (
    caseId: string,
    fieldKey: string,
    status: 'confirmed' | 'rejected' | 'extracted' | 'pending',
  ) => void
  onUpload: (doc: { name: string; type: string }) => void
}) {
  const [docType, setDocType] = useState('Audited Financials')
  const [docName, setDocName] = useState('')

  function handleUpload(e: FormEvent) {
    e.preventDefault()
    if (!docName.trim()) return
    onUpload({ name: docName.trim(), type: docType })
    setDocName('')
  }

  return (
    <div className="space-y-5">
      <Section
        title="Documents"
        subtitle="Upload & tag type — extraction maps to form fields"
      >
        <form
          onSubmit={handleUpload}
          className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px_auto]"
        >
          <Input
            placeholder="File name (demo upload)"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
          />
          <Select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            {[
              'Audited Financials',
              'Sanction Letter',
              'Shareholding Pattern',
              'Bank Statement',
              'Project Report',
              'Other',
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Button type="submit">Upload</Button>
        </form>

        <div className="space-y-2">
          {caseItem.documents.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3  border border-line px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-ink">{d.name}</p>
                <p className="text-xs text-muted">
                  {d.type} · {d.size} · {d.uploadedBy} · {d.uploadedAt}
                </p>
              </div>
              <Badge tone={statusTone(d.extractionStatus)}>
                {d.extractionStatus}
              </Badge>
            </div>
          ))}
          {caseItem.documents.length === 0 ? (
            <EmptyState
              title="No documents yet"
              description="Upload audited financials, sanction letters, or shareholding patterns."
            />
          ) : null}
        </div>
      </Section>

      <Section
        title="Extraction review"
        subtitle="Extracted values need admin confirm before they reach the two-pager"
      >
        <div className="space-y-3">
          {caseItem.extractions.map((ex) => (
            <div
              key={ex.fieldKey}
              className="grid gap-3  border border-line p-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {ex.fieldKey.replaceAll('_', ' ')}
                  </p>
                  <Badge tone={statusTone(ex.status)}>
                    {ex.status === 'extracted'
                      ? 'extracted, needs review'
                      : ex.status}
                  </Badge>
                </div>
                <p className="mt-1 font-display text-2xl text-embee-900">
                  {ex.value}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Source: {ex.sourceDoc} · page {ex.sourcePage}
                </p>
              </div>
              {ex.status === 'extracted' || ex.status === 'pending' ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      onReview(caseItem.id, ex.fieldKey, 'confirmed')
                    }
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      onReview(caseItem.id, ex.fieldKey, 'rejected')
                    }
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
          {caseItem.extractions.length === 0 ? (
            <EmptyState
              title="Nothing to review"
              description="Extracted values will appear here after document processing."
            />
          ) : null}
        </div>
      </Section>
    </div>
  )
}

function MandateTab({
  caseItem,
  onUpdate,
}: {
  caseItem: Case
  onUpdate: (
    caseId: string,
    which: 'mandate' | 'nda',
    status: MandateStatus,
    note?: string,
    date?: string,
  ) => void
}) {
  const [mandateNote, setMandateNote] = useState(caseItem.mandateNote ?? '')
  const [ndaNote, setNdaNote] = useState(caseItem.ndaNote ?? '')

  return (
    <Section
      title="Mandate & NDA"
      subtitle="Admin-only — clients and funders never see this tab"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {(['mandate', 'nda'] as const).map((which) => {
          const status =
            which === 'mandate' ? caseItem.mandateStatus : caseItem.ndaStatus
          const date =
            which === 'mandate' ? caseItem.mandateDate : caseItem.ndaDate
          const note = which === 'mandate' ? mandateNote : ndaNote
          const setNote = which === 'mandate' ? setMandateNote : setNdaNote
          return (
            <div
              key={which}
              className="border border-line bg-surface/60 p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-2xl capitalize text-ink">
                  {which}
                </h3>
                <Badge tone={statusTone(status)}>{status}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                <Field label="Status">
                  <Select
                    value={status}
                    onChange={(e) =>
                      onUpdate(
                        caseItem.id,
                        which,
                        e.target.value as MandateStatus,
                        note,
                        e.target.value === 'Done'
                          ? new Date().toISOString().slice(0, 10)
                          : date,
                      )
                    }
                  >
                    {['Not Started', 'In Progress', 'Done'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Date signed">
                  <Input
                    type="date"
                    value={date ?? ''}
                    onChange={(e) =>
                      onUpdate(
                        caseItem.id,
                        which,
                        status,
                        note,
                        e.target.value,
                      )
                    }
                  />
                </Field>
                <Field label="Note">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onBlur={() =>
                      onUpdate(caseItem.id, which, status, note, date)
                    }
                  />
                </Field>
                <div className=" border border-dashed border-line bg-white px-3 py-6 text-center text-xs text-muted">
                  Signed copy upload (demo placeholder)
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

function CirculationTab({
  caseItem,
  matches,
  caseCirculations,
  funders,
  onSend,
  onUpdateStatus,
}: {
  caseItem: Case
  matches: ReturnType<typeof matchFunders>
  caseCirculations: ReturnType<typeof useApp>['circulations']
  funders: ReturnType<typeof useApp>['funders']
  onSend: (
    caseId: string,
    funderId: string,
    reason: string,
    score: number,
  ) => void
  onUpdateStatus: (
    id: string,
    status: CirculationResponse,
    notes?: string,
  ) => void
}) {
  const sentIds = useMemo(
    () => new Set(caseCirculations.map((c) => c.funderId)),
    [caseCirculations],
  )

  return (
    <div className="space-y-5">
      <Section
        title="Funder shortlist"
        subtitle="Ranked by case type, ticket, sector and geography — approve before send"
      >
        <div className="space-y-3">
          {matches.slice(0, 5).map((f) => (
            <div
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-3  border border-line px-4 py-3"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{f.name}</p>
                  <Badge tone="red">{f.score}% match</Badge>
                  <Badge>{f.category}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">{f.reason}</p>
                <p className="text-xs text-muted">
                  Ticket {formatCr(f.ticketMin)}–{formatCr(f.ticketMax)} ·{' '}
                  {f.contacts.map((c) => c.email).join(', ')}
                </p>
              </div>
              <Button
                size="sm"
                disabled={sentIds.has(f.id)}
                onClick={() =>
                  onSend(caseItem.id, f.id, f.reason, f.score)
                }
              >
                {sentIds.has(f.id) ? 'Sent' : 'Send two-pager'}
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Circulation tracking"
        subtitle="Response status with notes and dates"
      >
        <div className="space-y-3">
          {caseCirculations.map((cir) => {
            const funder = funders.find((f) => f.id === cir.funderId)
            return (
              <div
                key={cir.id}
                className="grid gap-3  border border-line p-4 lg:grid-cols-[1fr_200px]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {funder?.name}
                    </p>
                    <Badge tone={statusTone(cir.responseStatus)}>
                      {cir.responseStatus}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Sent {cir.dateSent} · {cir.matchReason}
                  </p>
                  {cir.notes ? (
                    <p className="mt-2 text-sm text-muted">{cir.notes}</p>
                  ) : null}
                </div>
                <Select
                  value={cir.responseStatus}
                  onChange={(e) =>
                    onUpdateStatus(
                      cir.id,
                      e.target.value as CirculationResponse,
                    )
                  }
                >
                  {[
                    'Sent',
                    'Interested',
                    'Queries Raised',
                    'Declined',
                    'Term Sheet Issued',
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            )
          })}
          {caseCirculations.length === 0 ? (
            <EmptyState
              title="Not circulated yet"
              description="Send the two-pager to shortlisted funders after approval."
            />
          ) : null}
        </div>
      </Section>
    </div>
  )
}

export function TwoPagerPreview({
  caseItem,
  company,
}: {
  caseItem: Case
  company: Company
}) {
  const latest = company.financials[company.financials.length - 1]

  return (
    <Section
      title="Two-page profile"
      subtitle="Only confirmed values feed this output — preview for admin review"
    >
      <div className="overflow-hidden border border-embee-900/20 bg-white">
        <div className="bg-embee-900 px-6 py-5 text-white sm:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-embee-200 uppercase">
            Embee · Confidential
          </p>
          <h3 className="mt-2 font-display text-3xl sm:text-4xl">
            {company.name}
          </h3>
          <p className="mt-1 text-sm text-white/70">
            {caseItem.caseType} · {formatCr(caseItem.fields.amountSought)} ·{' '}
            {caseItem.sector}
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-2">
          <div className="space-y-5 border-b border-line p-6 sm:p-8 lg:border-r lg:border-b-0">
            <div>
              <p className="text-xs font-semibold tracking-wide text-embee-800 uppercase">
                Page 1 · Company
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {company.businessDescription}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Locations" value={company.locations} />
              <Info label="Products" value={company.products} />
              <Info label="Capacities" value={company.capacities} />
              <Info label="Key clients" value={company.keyClients} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase">
                Promoters & key people
              </p>
              <ul className="mt-2 space-y-1.5">
                {company.people.slice(0, 4).map((p) => (
                  <li key={p.id} className="text-sm text-ink">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted">
                      {' '}
                      · {p.role} · {p.shareholding}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold tracking-wide text-embee-800 uppercase">
                Page 2 · Requirement & financials
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {caseItem.fields.requirementText || 'Requirement not filled yet.'}
              </p>
            </div>
            {latest ? (
              <div className="grid grid-cols-2 gap-3  bg-embee-50 p-4 sm:grid-cols-3">
                <MiniStat label="Revenue" value={`${latest.revenue} Cr`} />
                <MiniStat label="EBITDA" value={`${latest.ebitda} Cr`} />
                <MiniStat
                  label="EBITDA %"
                  value={ratioEbitdaMargin(latest.revenue, latest.ebitda)}
                />
                <MiniStat label="PAT" value={`${latest.pat} Cr`} />
                <MiniStat label="Net worth" value={`${latest.netWorth} Cr`} />
                <MiniStat
                  label="D/E"
                  value={ratioDebtEquity(latest.debt, latest.netWorth)}
                />
              </div>
            ) : null}
            <div>
              <p className="text-xs font-semibold text-muted uppercase">
                Existing debt
              </p>
              <ul className="mt-2 space-y-1">
                {company.facilities.map((f) => (
                  <li key={f.id} className="text-sm text-ink">
                    {f.lender} · {f.facilityType} · O/S {formatCr(f.outstanding)}
                  </li>
                ))}
              </ul>
            </div>
            {caseItem.caseType === 'Term Loan' && caseItem.fields.projectCost ? (
              <div className=" border border-line px-4 py-3 text-sm">
                <p className="font-medium text-ink">Project snapshot</p>
                <p className="mt-1 text-muted">
                  Cost {formatCr(caseItem.fields.projectCost ?? 0)} · Promoter{' '}
                  {formatCr(caseItem.fields.promoterContribution ?? 0)} · Ask{' '}
                  {formatCr(caseItem.fields.loanAsk ?? 0)} · Tenure{' '}
                  {caseItem.fields.tenure ?? '—'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wide text-embee-700 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}
