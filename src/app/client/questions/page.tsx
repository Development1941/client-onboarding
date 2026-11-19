'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { PageHeader } from '@/components/PageHeader'
import { Button, EmptyState, Field, Section, Textarea } from '@/components/ui'

export default function ClientQuestionsPage() {
  const { user, getCase, getCompany, updateCaseFields } = useApp()
  const caseItem = user?.caseId ? getCase(user.caseId) : undefined
  const company = caseItem ? getCompany(caseItem.companyId) : undefined
  const [otherInfo, setOtherInfo] = useState(caseItem?.fields.otherInfo ?? '')
  const [saved, setSaved] = useState(false)

  if (!caseItem || !company) {
    return (
      <EmptyState
        title="No case linked"
        description="Contact Embee if you expected to leave a note here."
      />
    )
  }

  function save() {
    if (!caseItem) return
    updateCaseFields(caseItem.id, { otherInfo })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Client · Ask Embee"
        title="Other information & questions"
        description="Add context Embee should know, or ask the team a question about your case."
        breadcrumbs={[
          { label: 'Client workspace', href: '/client' },
          { label: 'Ask Embee' },
        ]}
        actions={
          <Button onClick={save}>{saved ? 'Saved' : 'Save note'}</Button>
        }
      />

      <Section
        title="Message for the Embee team"
        subtitle={`Your note is visible to ${caseItem.assignedAdmin} on this case only`}
      >
        <Field label="Other information or questions">
          <Textarea
            className="min-h-[180px]"
            value={otherInfo}
            onChange={(e) => setOtherInfo(e.target.value)}
            placeholder="Ask anything or add context Embee should know…"
          />
        </Field>
      </Section>
    </div>
  )
}
