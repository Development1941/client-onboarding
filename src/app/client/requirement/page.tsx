'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { CaseTypeFields } from '@/components/case/CaseTypeFields'
import { PageHeader } from '@/components/PageHeader'
import {
  Button,
  EmptyState,
  Field,
  Input,
  Section,
  Textarea,
} from '@/components/ui'

export default function ClientRequirementPage() {
  const { user, getCase, getCompany, updateCaseFields } = useApp()
  const caseItem = user?.caseId ? getCase(user.caseId) : undefined
  const company = caseItem ? getCompany(caseItem.companyId) : undefined
  const [fields, setFields] = useState(caseItem?.fields)
  const [saved, setSaved] = useState(false)

  if (!caseItem || !company || !fields) {
    return (
      <EmptyState
        title="No case linked"
        description="Contact Embee if you expected to fill requirement fields."
      />
    )
  }

  function save() {
    if (!caseItem || !fields) return
    updateCaseFields(caseItem.id, fields)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Client · Requirement"
        title={`${caseItem.caseType} requirement`}
        description="Fill the fields you have. Embee can complete or edit any field on your behalf."
        breadcrumbs={[
          { label: 'Client workspace', href: '/client' },
          { label: 'Requirement' },
        ]}
        actions={
          <Button onClick={save}>{saved ? 'Saved' : 'Save progress'}</Button>
        }
      />

      <Section title="Core requirement">
        <div className="grid gap-4 sm:grid-cols-2">
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
          <Field label="Requirement" className="sm:col-span-2">
            <Textarea
              className="min-h-[120px]"
              value={fields.requirementText}
              onChange={(e) =>
                setFields((f) =>
                  f ? { ...f, requirementText: e.target.value } : f,
                )
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title={`${caseItem.caseType} details`}
        subtitle="Template-specific fields for this case type"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <CaseTypeFields
            caseType={caseItem.caseType}
            fields={fields}
            setFields={(updater) =>
              setFields((f) => (f ? updater(f) : f))
            }
          />
        </div>
      </Section>
    </div>
  )
}
