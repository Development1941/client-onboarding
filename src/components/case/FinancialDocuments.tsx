'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { formatCr } from '@/data/mock'
import type {
  DocCategory,
  SanctionLetter,
  VerificationStatus,
} from '@/types'
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

const VERIFY: VerificationStatus[] = [
  'Pending',
  'Uploaded',
  'Under Verification',
  'Approved',
  'Rejected',
]

function DocList({
  caseId,
  category,
  emptyTitle,
  emptyDesc,
}: {
  caseId: string
  category: DocCategory
  emptyTitle: string
  emptyDesc: string
}) {
  const { getCase, updateDocumentVerification } = useApp()
  const docs = (getCase(caseId)?.documents ?? []).filter(
    (d) => d.category === category,
  )

  if (docs.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDesc} />
  }

  return (
    <div className="space-y-2">
      {docs.map((d) => (
        <div
          key={d.id}
          className="grid gap-3 border border-line px-4 py-3 lg:grid-cols-[1fr_auto_auto] lg:items-center"
        >
          <div>
            <p className="text-[14px] font-semibold text-ink">{d.name}</p>
            <p className="text-[12px] text-muted">
              {d.type}
              {d.periodLabel ? ` · ${d.periodLabel}` : ''} · v{d.version} ·{' '}
              {d.uploadedBy} · {d.uploadedAt} · {d.uploadSource}
            </p>
          </div>
          <Badge tone={statusTone(d.extractionStatus)}>
            extract: {d.extractionStatus}
          </Badge>
          <Select
            className="w-auto min-w-[10rem]"
            value={d.verificationStatus}
            onChange={(e) =>
              updateDocumentVerification(
                caseId,
                d.id,
                e.target.value as VerificationStatus,
              )
            }
          >
            {VERIFY.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  )
}

function UploadRow({
  caseId,
  category,
  typeOptions,
  periodLabel,
  linkedPersonId,
}: {
  caseId: string
  category: DocCategory
  typeOptions: string[]
  periodLabel?: string
  linkedPersonId?: string
}) {
  const { addDocument } = useApp()
  const [name, setName] = useState('')
  const [type, setType] = useState(typeOptions[0])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addDocument(caseId, {
      name: name.trim(),
      type,
      category,
      periodLabel,
      linkedPersonId,
    })
    setName('')
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-4 grid gap-2 sm:grid-cols-[1fr_180px_auto]"
    >
      <Input
        placeholder="+ Upload file name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Select value={type} onChange={(e) => setType(e.target.value)}>
        {typeOptions.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
      <Button type="submit">Upload</Button>
    </form>
  )
}

export function FinancialDocumentsScreen() {
  const { id } = useParams<{ id: string }>()
  const {
    getCase,
    getCompany,
    updateIntakeConfig,
    setSanctionLetters,
    updateExtraction,
  } = useApp()
  const caseItem = getCase(id)!
  const company = getCompany(caseItem.companyId)!
  const [config, setConfig] = useState(caseItem.intakeConfig)
  const [letters, setLetters] = useState<SanctionLetter[]>(
    caseItem.sanctionLetters,
  )
  const [saved, setSaved] = useState(false)
  const [kycPersonId, setKycPersonId] = useState(company.people[0]?.id ?? '')

  const pendingExtractions = useMemo(
    () =>
      caseItem.extractions.filter(
        (e) => e.status === 'extracted' || e.status === 'pending',
      ),
    [caseItem.extractions],
  )

  function save() {
    updateIntakeConfig(caseItem.id, config)
    setSanctionLetters(caseItem.id, letters)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addLetter() {
    setLetters((prev) => [
      ...prev,
      {
        id: `sl${Date.now()}`,
        bankName: '',
        facilityType: 'Term Loan',
        sanctionAmount: 0,
        sanctionDate: '',
        terms: '',
      },
    ])
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-embee-700">
            Admin demo · Screen 2
          </p>
          <h2 className="mt-1 font-display text-[1.55rem] text-ink">
            Financial & document intake
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">
            Upload documents, configure look-back periods, and review extracted
            information before approval. Each category keeps its own period,
            version and verification status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={save}>
            {saved ? 'Saved' : 'Save draft'}
          </Button>
          <Button onClick={save}>Save & continue</Button>
        </div>
      </div>

      <Section
        title="1. Audited financial statements"
        subtitle={`Default: ${config.financialYearsRequired} years · editable look-back`}
        actions={
          <div className="flex items-center gap-2">
            <Field label="Years required">
              <Select
                className="w-24"
                value={config.financialYearsRequired}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  const labels = Array.from({ length: n }, (_, i) => {
                    const year = 25 - (n - 1 - i)
                    return `FY${year}`
                  })
                  setConfig((c) => ({
                    ...c,
                    financialYearsRequired: n,
                    financialYearLabels: labels,
                  }))
                }}
              >
                {[2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {config.financialYearLabels.map((label, idx) => (
            <Input
              key={`${label}-${idx}`}
              className="w-28"
              value={label}
              onChange={(e) =>
                setConfig((c) => {
                  const next = [...c.financialYearLabels]
                  next[idx] = e.target.value
                  return { ...c, financialYearLabels: next }
                })
              }
            />
          ))}
        </div>
        <UploadRow
          caseId={caseItem.id}
          category="financial"
          typeOptions={[
            'Audited Financials',
            'Balance Sheet',
            'P&L Statement',
            'Cash Flow',
          ]}
          periodLabel={config.financialYearLabels.join('-')}
        />
        <DocList
          caseId={caseItem.id}
          category="financial"
          emptyTitle="No financial statements uploaded"
          emptyDesc="Upload balance sheet, P&L and cash flow for each required year."
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-[0.08em] text-muted">
                <th className="pb-2 font-semibold">FY</th>
                <th className="pb-2 font-semibold">Revenue</th>
                <th className="pb-2 font-semibold">EBITDA</th>
                <th className="pb-2 font-semibold">PAT</th>
                <th className="pb-2 font-semibold">Net worth</th>
                <th className="pb-2 font-semibold">Debt</th>
              </tr>
            </thead>
            <tbody>
              {company.financials.map((fy) => (
                <tr key={fy.id} className="border-b border-line/70">
                  <td className="py-2 font-medium">{fy.label}</td>
                  <td className="py-2 tabular-nums">{fy.revenue}</td>
                  <td className="py-2 tabular-nums">{fy.ebitda}</td>
                  <td className="py-2 tabular-nums">{fy.pat}</td>
                  <td className="py-2 tabular-nums">{fy.netWorth}</td>
                  <td className="py-2 tabular-nums">{fy.debt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="2. Bank statements"
        subtitle={`Default: ${config.bankStatementMonths} months · support multiple accounts`}
        actions={
          <Select
            className="w-36"
            value={config.bankStatementMonths}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                bankStatementMonths: Number(e.target.value),
              }))
            }
          >
            {[3, 6, 12].map((n) => (
              <option key={n} value={n}>
                {n} months
              </option>
            ))}
          </Select>
        }
      >
        <UploadRow
          caseId={caseItem.id}
          category="bank_statement"
          typeOptions={['Bank Statement']}
          periodLabel={`${config.bankStatementMonths} months`}
        />
        <DocList
          caseId={caseItem.id}
          category="bank_statement"
          emptyTitle="No bank statements uploaded"
          emptyDesc="Allow 3 / 6 / 12 months; upload per account where needed."
        />
      </Section>

      <Section
        title="3. GST returns"
        subtitle={`Default: ${config.gstMonths} months · month-wise upload & missing-period tracking`}
        actions={
          <Select
            className="w-36"
            value={config.gstMonths}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                gstMonths: Number(e.target.value),
              }))
            }
          >
            {[6, 12, 24].map((n) => (
              <option key={n} value={n}>
                {n} months
              </option>
            ))}
          </Select>
        }
      >
        <UploadRow
          caseId={caseItem.id}
          category="gst"
          typeOptions={['GSTR-1', 'GSTR-3B', 'GST Returns Pack']}
          periodLabel={`${config.gstMonths} months`}
        />
        <DocList
          caseId={caseItem.id}
          category="gst"
          emptyTitle="No GST returns uploaded"
          emptyDesc="Upload GSTR-1 / GSTR-3B for the required period."
        />
      </Section>

      <Section
        title="4. Bank sanction letters"
        subtitle="Lender, facility, amount, date and key terms — with upload"
        actions={
          <Button variant="secondary" size="sm" onClick={addLetter}>
            + Add another letter
          </Button>
        }
      >
        <div className="space-y-4">
          {letters.map((letter, idx) => (
            <div key={letter.id} className="border border-line p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Bank / NBFC">
                  <Input
                    value={letter.bankName}
                    placeholder="Enter lender name"
                    onChange={(e) =>
                      setLetters((prev) =>
                        prev.map((row, i) =>
                          i === idx
                            ? { ...row, bankName: e.target.value }
                            : row,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Facility type">
                  <Select
                    value={letter.facilityType}
                    onChange={(e) =>
                      setLetters((prev) =>
                        prev.map((row, i) =>
                          i === idx
                            ? { ...row, facilityType: e.target.value }
                            : row,
                        ),
                      )
                    }
                  >
                    {['Term Loan', 'CC', 'OD', 'BG', 'LC', 'Other'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Sanction amount (₹ Cr)">
                  <Input
                    type="number"
                    value={letter.sanctionAmount}
                    onChange={(e) =>
                      setLetters((prev) =>
                        prev.map((row, i) =>
                          i === idx
                            ? {
                                ...row,
                                sanctionAmount: Number(e.target.value),
                              }
                            : row,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Sanction date">
                  <Input
                    type="date"
                    value={letter.sanctionDate}
                    onChange={(e) =>
                      setLetters((prev) =>
                        prev.map((row, i) =>
                          i === idx
                            ? { ...row, sanctionDate: e.target.value }
                            : row,
                        ),
                      )
                    }
                  />
                </Field>
                <Field
                  label="Interest rate / tenure / security"
                  className="sm:col-span-2"
                >
                  <Textarea
                    value={letter.terms}
                    placeholder="Enter extracted or verified terms"
                    onChange={(e) =>
                      setLetters((prev) =>
                        prev.map((row, i) =>
                          i === idx ? { ...row, terms: e.target.value } : row,
                        ),
                      )
                    }
                  />
                </Field>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted">
                <span>
                  {letter.documentName
                    ? `Linked file: ${letter.documentName}`
                    : 'No file linked yet'}{' '}
                  · {formatCr(letter.sanctionAmount)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setLetters((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {letters.length === 0 ? (
            <EmptyState
              title="No sanction letters captured"
              description="Add lender facility details and upload the sanction PDF."
            />
          ) : null}
          <UploadRow
            caseId={caseItem.id}
            category="sanction"
            typeOptions={['Sanction Letter']}
          />
          <DocList
            caseId={caseItem.id}
            category="sanction"
            emptyTitle="No sanction letter files"
            emptyDesc="Upload the signed sanction / facility letter."
          />
        </div>
      </Section>

      <Section title="5. KYC documents" subtitle="Company KYC and individual KYC linked to person records">
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-[13px] font-semibold text-ink">
              Company KYC
            </h3>
            <p className="mb-3 text-[12px] text-muted">
              Company PAN · Incorporation / registration certificate · CIN /
              LLPIN · GST registration · Registered office proof · MOA & AOA /
              Partnership Deed / LLP Agreement
            </p>
            <UploadRow
              caseId={caseItem.id}
              category="company_kyc"
              typeOptions={[
                'Company PAN',
                'Incorporation Certificate',
                'GST Registration',
                'Registered Office Proof',
                'MOA & AOA',
                'Partnership Deed / LLP Agreement',
              ]}
            />
            <DocList
              caseId={caseItem.id}
              category="company_kyc"
              emptyTitle="No company KYC uploaded"
              emptyDesc="Upload company identity and constitutional documents."
            />
          </div>

          <div className="border-t border-line pt-5">
            <h3 className="mb-2 text-[13px] font-semibold text-ink">
              Individual KYC — promoters / directors / partners / shareholders
            </h3>
            <p className="mb-3 text-[12px] text-muted">
              Link KYC to each person record. PAN · Identity & address proof ·
              Photograph
            </p>
            <div className="mb-3 max-w-sm">
              <Field label="Link to person">
                <Select
                  value={kycPersonId}
                  onChange={(e) => setKycPersonId(e.target.value)}
                >
                  {company.people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.role}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <UploadRow
              caseId={caseItem.id}
              category="individual_kyc"
              typeOptions={[
                'Individual PAN',
                'Identity & Address Proof',
                'Photograph',
              ]}
              linkedPersonId={kycPersonId}
            />
            <DocList
              caseId={caseItem.id}
              category="individual_kyc"
              emptyTitle="No individual KYC uploaded"
              emptyDesc="Add KYC for each promoter, director, partner or shareholder."
            />
          </div>
        </div>
      </Section>

      <Section
        title="6. Extraction & verification"
        subtitle="AI/OCR extracts values with source page. Only confirmed values feed ratios and the funder profile."
      >
        <div className="space-y-3">
          {caseItem.extractions.map((ex) => (
            <div
              key={ex.fieldKey}
              className="grid gap-3 border border-line p-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-semibold text-ink">
                    {ex.label}
                  </p>
                  <Badge tone={statusTone(ex.status)}>
                    {ex.status === 'extracted'
                      ? 'extracted, needs review'
                      : ex.status}
                  </Badge>
                </div>
                <p className="mt-1 font-display text-[1.5rem] text-embee-900">
                  {ex.value}
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  Source: {ex.sourceDoc} · page {ex.sourcePage}
                </p>
              </div>
              {ex.status === 'extracted' || ex.status === 'pending' ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      updateExtraction(caseItem.id, ex.fieldKey, 'confirmed')
                    }
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateExtraction(caseItem.id, ex.fieldKey, 'rejected')
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
              title="No extractions yet"
              description="Upload financials or sanction letters to begin extraction review."
            />
          ) : null}
          {pendingExtractions.length > 0 ? (
            <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
              {pendingExtractions.length} value
              {pendingExtractions.length === 1 ? '' : 's'} awaiting admin
              confirmation before feeding the two-pager.
            </p>
          ) : null}
        </div>
      </Section>
    </div>
  )
}
