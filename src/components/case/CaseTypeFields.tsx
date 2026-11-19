'use client'

import type { Case, CaseFields } from '@/types'
import { Field, Input, Textarea } from '@/components/ui'

export function CaseTypeFields({
  caseType,
  fields,
  setFields,
}: {
  caseType: Case['caseType']
  fields: CaseFields
  setFields: (updater: (f: CaseFields) => CaseFields) => void
}) {
  const set = <K extends keyof CaseFields>(key: K, value: CaseFields[K]) =>
    setFields((f) => ({ ...f, [key]: value }))

  if (caseType === 'Term Loan') {
    return (
      <>
        <Field label="Project report status">
          <Input
            value={fields.projectReportStatus ?? ''}
            onChange={(e) => set('projectReportStatus', e.target.value)}
          />
        </Field>
        <Field label="Land area">
          <Input
            value={fields.landArea ?? ''}
            onChange={(e) => set('landArea', e.target.value)}
          />
        </Field>
        <Field label="Land valuation">
          <Input
            value={fields.landValuation ?? ''}
            onChange={(e) => set('landValuation', e.target.value)}
          />
        </Field>
        <Field label="Building type">
          <Input
            value={fields.buildingType ?? ''}
            onChange={(e) => set('buildingType', e.target.value)}
          />
        </Field>
        <Field label="Building sq ft">
          <Input
            value={fields.buildingSqft ?? ''}
            onChange={(e) => set('buildingSqft', e.target.value)}
          />
        </Field>
        <Field label="Architect estimate">
          <Input
            value={fields.architectEstimate ?? ''}
            onChange={(e) => set('architectEstimate', e.target.value)}
          />
        </Field>
        <Field label="Plant & machinery notes" className="sm:col-span-2">
          <Textarea
            value={fields.plantMachineryNotes ?? ''}
            onChange={(e) => set('plantMachineryNotes', e.target.value)}
          />
        </Field>
        <Field label="Projected products">
          <Input
            value={fields.projProducts ?? ''}
            onChange={(e) => set('projProducts', e.target.value)}
          />
        </Field>
        <Field label="Projected capacities">
          <Input
            value={fields.projCapacities ?? ''}
            onChange={(e) => set('projCapacities', e.target.value)}
          />
        </Field>
        <Field label="Selling price">
          <Input
            value={fields.projSellingPrice ?? ''}
            onChange={(e) => set('projSellingPrice', e.target.value)}
          />
        </Field>
        <Field label="Raw materials">
          <Input
            value={fields.projRawMaterials ?? ''}
            onChange={(e) => set('projRawMaterials', e.target.value)}
          />
        </Field>
        <Field label="Average material cost">
          <Input
            value={fields.projMaterialCost ?? ''}
            onChange={(e) => set('projMaterialCost', e.target.value)}
          />
        </Field>
        <Field label="Admin & other expenses">
          <Input
            value={fields.projAdminExpenses ?? ''}
            onChange={(e) => set('projAdminExpenses', e.target.value)}
          />
        </Field>
        <Field label="Project cost (₹ Cr)">
          <Input
            type="number"
            value={fields.projectCost ?? ''}
            onChange={(e) => set('projectCost', Number(e.target.value))}
          />
        </Field>
        <Field label="Promoter contribution (₹ Cr)">
          <Input
            type="number"
            value={fields.promoterContribution ?? ''}
            onChange={(e) =>
              set('promoterContribution', Number(e.target.value))
            }
          />
        </Field>
        <Field label="Loan ask (₹ Cr)">
          <Input
            type="number"
            value={fields.loanAsk ?? ''}
            onChange={(e) => set('loanAsk', Number(e.target.value))}
          />
        </Field>
        <Field label="Tenure">
          <Input
            value={fields.tenure ?? ''}
            onChange={(e) => set('tenure', e.target.value)}
          />
        </Field>
        <Field label="Moratorium">
          <Input
            value={fields.moratorium ?? ''}
            onChange={(e) => set('moratorium', e.target.value)}
          />
        </Field>
      </>
    )
  }

  if (caseType === 'CC Limit') {
    return (
      <>
        <Field label="Current limit (₹ Cr)">
          <Input
            type="number"
            value={fields.currentLimit ?? ''}
            onChange={(e) => set('currentLimit', Number(e.target.value))}
          />
        </Field>
        <Field label="Enhancement sought (₹ Cr)">
          <Input
            type="number"
            value={fields.enhancementSought ?? ''}
            onChange={(e) => set('enhancementSought', Number(e.target.value))}
          />
        </Field>
        <Field label="Utilisation">
          <Input
            value={fields.utilisation ?? ''}
            onChange={(e) => set('utilisation', e.target.value)}
          />
        </Field>
        <Field label="Debtor days">
          <Input
            value={fields.debtorDays ?? ''}
            onChange={(e) => set('debtorDays', e.target.value)}
          />
        </Field>
        <Field label="Creditor days">
          <Input
            value={fields.creditorDays ?? ''}
            onChange={(e) => set('creditorDays', e.target.value)}
          />
        </Field>
        <Field label="Inventory days">
          <Input
            value={fields.inventoryDays ?? ''}
            onChange={(e) => set('inventoryDays', e.target.value)}
          />
        </Field>
        <Field label="Sales projections" className="sm:col-span-2">
          <Textarea
            value={fields.salesProjections ?? ''}
            onChange={(e) => set('salesProjections', e.target.value)}
          />
        </Field>
        <Field label="Stock & debtor statements" className="sm:col-span-2">
          <Textarea
            value={fields.stockDebtorNotes ?? ''}
            onChange={(e) => set('stockDebtorNotes', e.target.value)}
          />
        </Field>
        <Field label="Reason for enhancement" className="sm:col-span-2">
          <Textarea
            value={fields.enhancementReason ?? ''}
            onChange={(e) => set('enhancementReason', e.target.value)}
          />
        </Field>
      </>
    )
  }

  if (caseType === 'Takeover') {
    return (
      <>
        <Field label="Facility to take over" className="sm:col-span-2">
          <Input
            value={fields.facilityToTakeover ?? ''}
            onChange={(e) => set('facilityToTakeover', e.target.value)}
          />
        </Field>
        <Field label="Lender">
          <Input
            value={fields.takeoverLender ?? ''}
            onChange={(e) => set('takeoverLender', e.target.value)}
          />
        </Field>
        <Field label="Outstanding">
          <Input
            value={fields.takeoverOutstanding ?? ''}
            onChange={(e) => set('takeoverOutstanding', e.target.value)}
          />
        </Field>
        <Field label="Repayment track record" className="sm:col-span-2">
          <Textarea
            value={fields.repaymentTrack ?? ''}
            onChange={(e) => set('repaymentTrack', e.target.value)}
          />
        </Field>
        <Field label="Security held" className="sm:col-span-2">
          <Textarea
            value={fields.securityHeld ?? ''}
            onChange={(e) => set('securityHeld', e.target.value)}
          />
        </Field>
        <Field label="Foreclosure terms" className="sm:col-span-2">
          <Textarea
            value={fields.foreclosureTerms ?? ''}
            onChange={(e) => set('foreclosureTerms', e.target.value)}
          />
        </Field>
        <Field label="Reason" className="sm:col-span-2">
          <Textarea
            value={fields.takeoverReason ?? ''}
            onChange={(e) => set('takeoverReason', e.target.value)}
          />
        </Field>
      </>
    )
  }

  if (caseType === 'Buyback Funding') {
    return (
      <>
        <Field label="Purpose" className="sm:col-span-2">
          <Textarea
            value={fields.buybackPurpose ?? ''}
            onChange={(e) => set('buybackPurpose', e.target.value)}
          />
        </Field>
        <Field label="Exiting party">
          <Input
            value={fields.exitingParty ?? ''}
            onChange={(e) => set('exitingParty', e.target.value)}
          />
        </Field>
        <Field label="Buyback amount (₹ Cr)">
          <Input
            type="number"
            value={fields.buybackAmount ?? ''}
            onChange={(e) => set('buybackAmount', Number(e.target.value))}
          />
        </Field>
        <Field label="Buyback price">
          <Input
            value={fields.buybackPrice ?? ''}
            onChange={(e) => set('buybackPrice', e.target.value)}
          />
        </Field>
        <Field label="Shareholding before">
          <Input
            value={fields.shareholdingBefore ?? ''}
            onChange={(e) => set('shareholdingBefore', e.target.value)}
          />
        </Field>
        <Field label="Shareholding after">
          <Input
            value={fields.shareholdingAfter ?? ''}
            onChange={(e) => set('shareholdingAfter', e.target.value)}
          />
        </Field>
        <Field label="Repayment source" className="sm:col-span-2">
          <Textarea
            value={fields.buybackRepaymentSource ?? ''}
            onChange={(e) => set('buybackRepaymentSource', e.target.value)}
          />
        </Field>
        <Field label="Approvals" className="sm:col-span-2">
          <Textarea
            value={fields.buybackApprovals ?? ''}
            onChange={(e) => set('buybackApprovals', e.target.value)}
          />
        </Field>
      </>
    )
  }

  if (caseType === 'Special Situation') {
    return (
      <>
        <Field label="Scenario behind the stress" className="sm:col-span-2">
          <Textarea
            value={fields.stressScenario ?? ''}
            onChange={(e) => set('stressScenario', e.target.value)}
          />
        </Field>
        <Field label="Account status">
          <Input
            value={fields.accountStatus ?? ''}
            onChange={(e) => set('accountStatus', e.target.value)}
          />
        </Field>
        <Field label="Overdues">
          <Input
            value={fields.overdues ?? ''}
            onChange={(e) => set('overdues', e.target.value)}
          />
        </Field>
        <Field label="Litigation" className="sm:col-span-2">
          <Textarea
            value={fields.litigation ?? ''}
            onChange={(e) => set('litigation', e.target.value)}
          />
        </Field>
        <Field label="Turnaround plan" className="sm:col-span-2">
          <Textarea
            value={fields.turnaroundPlan ?? ''}
            onChange={(e) => set('turnaroundPlan', e.target.value)}
          />
        </Field>
        <Field label="Security" className="sm:col-span-2">
          <Textarea
            value={fields.specialSecurity ?? ''}
            onChange={(e) => set('specialSecurity', e.target.value)}
          />
        </Field>
      </>
    )
  }

  // Acquisition Finance
  return (
    <>
      <Field label="Target company" className="sm:col-span-2">
        <Input
          value={fields.targetCompany ?? ''}
          onChange={(e) => set('targetCompany', e.target.value)}
        />
      </Field>
      <Field label="Valuation (₹ Cr)">
        <Input
          type="number"
          value={fields.dealValuation ?? ''}
          onChange={(e) => set('dealValuation', Number(e.target.value))}
        />
      </Field>
      <Field label="Consideration">
        <Input
          value={fields.consideration ?? ''}
          onChange={(e) => set('consideration', e.target.value)}
        />
      </Field>
      <Field label="Deal rationale" className="sm:col-span-2">
        <Textarea
          value={fields.dealRationale ?? ''}
          onChange={(e) => set('dealRationale', e.target.value)}
        />
      </Field>
      <Field label="Debt & equity split">
        <Input
          value={fields.debtEquitySplit ?? ''}
          onChange={(e) => set('debtEquitySplit', e.target.value)}
        />
      </Field>
      <Field label="Deal status">
        <Input
          value={fields.dealStatus ?? ''}
          onChange={(e) => set('dealStatus', e.target.value)}
        />
      </Field>
      <Field label="Repayment source" className="sm:col-span-2">
        <Textarea
          value={fields.acquisitionRepaymentSource ?? ''}
          onChange={(e) => set('acquisitionRepaymentSource', e.target.value)}
        />
      </Field>
    </>
  )
}
