'use client'

import { FormEvent, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { formatCr } from '@/data/mock'
import { PageHeader } from '@/components/PageHeader'
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

export default function ClientPortalPage() {
  const { user, getCase, getCompany, updateCaseFields, addDocument } = useApp()
  const caseItem = user?.caseId ? getCase(user.caseId) : undefined
  const company = caseItem ? getCompany(caseItem.companyId) : undefined

  const [fields, setFields] = useState(caseItem?.fields)
  const [saved, setSaved] = useState(false)
  const [docName, setDocName] = useState('')
  const [docType, setDocType] = useState('Audited Financials')

  if (!caseItem || !company || !fields) {
    return (
      <EmptyState
        title="No case linked"
        description="Your account is not linked to an active case. Contact the Embee team."
      />
    )
  }

  function save() {
    if (!caseItem || !fields) return
    updateCaseFields(caseItem.id, fields)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function upload(e: FormEvent) {
    e.preventDefault()
    if (!caseItem || !docName.trim()) return
    addDocument(caseItem.id, { name: docName.trim(), type: docType })
    setDocName('')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Screen 3 · Client view"
        title={company.name}
        description="You can see only this case. Fill the sections you have, upload documents, and leave questions for the Embee team. There is no case list and no funder information."
        breadcrumbs={[
          { label: 'Client workspace' },
          { label: company.name },
        ]}
        actions={
          <Button onClick={save}>{saved ? 'Saved' : 'Save progress'}</Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
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
      </div>

      <Section
        title="Requirement & case details"
        subtitle="Complete what you can. Embee can edit any field on your behalf."
      >
        <div className="grid gap-4">
          <Field label="Requirement">
            <Textarea
              value={fields.requirementText}
              onChange={(e) =>
                setFields((f) =>
                  f ? { ...f, requirementText: e.target.value } : f,
                )
              }
            />
          </Field>
          <Field label="Amount sought (₹ Cr)">
            <Input
              type="number"
              value={fields.amountSought}
              onChange={(e) =>
                setFields((f) =>
                  f ? { ...f, amountSought: Number(e.target.value) } : f,
                )
              }
            />
          </Field>

          {caseItem.caseType === 'Term Loan' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project report status">
                <Input
                  value={fields.projectReportStatus ?? ''}
                  onChange={(e) =>
                    setFields((f) =>
                      f ? { ...f, projectReportStatus: e.target.value } : f,
                    )
                  }
                />
              </Field>
              <Field label="Land area">
                <Input
                  value={fields.landArea ?? ''}
                  onChange={(e) =>
                    setFields((f) =>
                      f ? { ...f, landArea: e.target.value } : f,
                    )
                  }
                />
              </Field>
              <Field label="Project cost (₹ Cr)">
                <Input
                  type="number"
                  value={fields.projectCost ?? ''}
                  onChange={(e) =>
                    setFields((f) =>
                      f ? { ...f, projectCost: Number(e.target.value) } : f,
                    )
                  }
                />
              </Field>
              <Field label="Promoter contribution (₹ Cr)">
                <Input
                  type="number"
                  value={fields.promoterContribution ?? ''}
                  onChange={(e) =>
                    setFields((f) =>
                      f
                        ? {
                            ...f,
                            promoterContribution: Number(e.target.value),
                          }
                        : f,
                    )
                  }
                />
              </Field>
              <Field label="Loan ask (₹ Cr)">
                <Input
                  type="number"
                  value={fields.loanAsk ?? ''}
                  onChange={(e) =>
                    setFields((f) =>
                      f ? { ...f, loanAsk: Number(e.target.value) } : f,
                    )
                  }
                />
              </Field>
              <Field label="Tenure">
                <Input
                  value={fields.tenure ?? ''}
                  onChange={(e) =>
                    setFields((f) =>
                      f ? { ...f, tenure: e.target.value } : f,
                    )
                  }
                />
              </Field>
            </div>
          )}

          <Field label="Other information or questions for the Embee team">
            <Textarea
              value={fields.otherInfo}
              onChange={(e) =>
                setFields((f) =>
                  f ? { ...f, otherInfo: e.target.value } : f,
                )
              }
              placeholder="Add context, clarifications or questions for Embee…"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Document upload"
        subtitle="Tag each file by type. Extracted values reach the two-pager only after Embee confirms them."
      >
        <form
          onSubmit={upload}
          className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]"
        >
          <Input
            placeholder="File name"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
          />
          <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
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
              className="flex flex-wrap items-center justify-between gap-2 border border-line px-4 py-3"
            >
              <div>
                <p className="text-[14px] font-medium text-ink">{d.name}</p>
                <p className="text-[12px] text-muted">
                  {d.type} · {d.uploadedAt} · via {d.uploadSource}
                </p>
              </div>
              <Badge tone={statusTone(d.extractionStatus)}>
                {d.extractionStatus}
              </Badge>
            </div>
          ))}
          {caseItem.documents.length === 0 ? (
            <EmptyState
              title="No uploads yet"
              description="Add audited financials, shareholding, or bank statements."
            />
          ) : null}
        </div>
      </Section>
    </div>
  )
}
