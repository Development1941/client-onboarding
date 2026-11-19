'use client'

import { FormEvent, useState } from 'react'
import { useApp } from '@/context/AppContext'
import type { DocCategory } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Section,
  Select,
  statusTone,
} from '@/components/ui'

const TYPES: Array<{ label: string; type: string; category: DocCategory }> = [
  { label: 'Audited Financials', type: 'Audited Financials', category: 'financial' },
  { label: 'Bank Statement', type: 'Bank Statement', category: 'bank_statement' },
  { label: 'GSTR-1 / GSTR-3B', type: 'GST Returns Pack', category: 'gst' },
  { label: 'Sanction Letter', type: 'Sanction Letter', category: 'sanction' },
  { label: 'Shareholding Pattern', type: 'Shareholding Pattern', category: 'other' },
  { label: 'Company KYC', type: 'Company PAN', category: 'company_kyc' },
  { label: 'Individual KYC', type: 'Individual PAN', category: 'individual_kyc' },
  { label: 'Other', type: 'Other', category: 'other' },
]

export default function ClientDocumentsPage() {
  const { user, getCase, getCompany, addDocument } = useApp()
  const caseItem = user?.caseId ? getCase(user.caseId) : undefined
  const company = caseItem ? getCompany(caseItem.companyId) : undefined
  const [docName, setDocName] = useState('')
  const [typeKey, setTypeKey] = useState(TYPES[0].label)

  if (!caseItem || !company) {
    return (
      <EmptyState
        title="No case linked"
        description="Contact Embee if you expected to upload documents."
      />
    )
  }

  function upload(e: FormEvent) {
    e.preventDefault()
    if (!caseItem || !docName.trim()) return
    const meta = TYPES.find((t) => t.label === typeKey) ?? TYPES[0]
    addDocument(caseItem.id, {
      name: docName.trim(),
      type: meta.type,
      category: meta.category,
    })
    setDocName('')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Client · Documents"
        title="Document upload"
        description="Tag each file by type. Extracted values reach the funder profile only after Embee confirms them."
        breadcrumbs={[
          { label: 'Client workspace', href: '/client' },
          { label: 'Documents' },
        ]}
      />

      <Section title="Upload" subtitle="Financials, bank statements, GST, KYC and supporting files">
        <form
          onSubmit={upload}
          className="mb-2 grid gap-3 sm:grid-cols-[1fr_200px_auto]"
        >
          <Field label="File name">
            <Input
              placeholder="e.g. Audited_Financials_FY24.pdf"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
            />
          </Field>
          <Field label="Document type">
            <Select value={typeKey} onChange={(e) => setTypeKey(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.label} value={t.label}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" className="w-full sm:w-auto">
              Upload
            </Button>
          </div>
        </form>
      </Section>

      <Section
        title="Your uploads"
        subtitle={`${caseItem.documents.length} file${caseItem.documents.length === 1 ? '' : 's'} on this case`}
      >
        <div className="space-y-2">
          {caseItem.documents.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 border border-line px-4 py-3"
            >
              <div>
                <p className="text-[14px] font-medium text-ink">{d.name}</p>
                <p className="text-[12px] text-muted">
                  {d.type}
                  {d.periodLabel ? ` · ${d.periodLabel}` : ''} · {d.uploadedAt} ·{' '}
                  {d.uploadSource}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={statusTone(d.extractionStatus)}>
                  extract: {d.extractionStatus}
                </Badge>
                <Badge tone={statusTone(d.verificationStatus)}>
                  {d.verificationStatus}
                </Badge>
              </div>
            </div>
          ))}
          {caseItem.documents.length === 0 ? (
            <EmptyState
              title="No uploads yet"
              description="Add audited financials, bank statements, GST or KYC documents."
            />
          ) : null}
        </div>
      </Section>
    </div>
  )
}
