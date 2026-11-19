export type Role = 'admin' | 'client'

export type CaseType =
  | 'Term Loan'
  | 'CC Limit'
  | 'Takeover'
  | 'Buyback Funding'
  | 'Special Situation'
  | 'Acquisition Finance'

export type CaseStatus =
  | 'Draft'
  | 'Client Filling'
  | 'Under Review'
  | 'Ready for Circulation'
  | 'Circulated'
  | 'Closed'

export type MandateStatus = 'Not Started' | 'In Progress' | 'Done'
export type ExtractionStatus = 'pending' | 'extracted' | 'confirmed' | 'rejected'
export type CirculationResponse =
  | 'Sent'
  | 'Interested'
  | 'Queries Raised'
  | 'Declined'
  | 'Term Sheet Issued'

export type FunderCategory =
  | 'PSU Bank'
  | 'Private Bank'
  | 'NBFC'
  | 'AIF'
  | 'Other Financial Institution'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  caseId?: string
}

export interface Person {
  id: string
  name: string
  role: string
  profile: string
  shareholding: number
}

export interface FinancialYear {
  id: string
  label: string
  revenue: number
  ebitda: number
  pat: number
  netWorth: number
  debt: number
  cash?: number
  inventory?: number
  receivables?: number
}

export interface ExistingFacility {
  id: string
  lender: string
  facilityType: string
  limit: number
  outstanding: number
  interestRate: number
  security: string
  personalGuarantor: string
}

export interface Company {
  id: string
  name: string
  constitution: string
  cin: string
  pan: string
  incorporationYear: number
  locations: string
  businessDescription: string
  capacities: string
  products: string
  keyClients: string
  people: Person[]
  financials: FinancialYear[]
  facilities: ExistingFacility[]
}

export interface ExtractedValue {
  fieldKey: string
  label: string
  value: string
  sourceDoc: string
  sourcePage: number
  status: ExtractionStatus
}

export interface DocumentItem {
  id: string
  name: string
  type: string
  uploadedBy: string
  uploadSource: 'admin' | 'client'
  uploadedAt: string
  extractionStatus: ExtractionStatus
  size: string
}

export interface CaseFields {
  requirementText: string
  amountSought: number
  otherInfo: string

  // Term Loan
  projectReportStatus?: string
  landArea?: string
  landValuation?: string
  buildingType?: string
  buildingSqft?: string
  architectEstimate?: string
  plantMachineryNotes?: string
  projProducts?: string
  projCapacities?: string
  projSellingPrice?: string
  projRawMaterials?: string
  projMaterialCost?: string
  projAdminExpenses?: string
  projectCost?: number
  promoterContribution?: number
  loanAsk?: number
  tenure?: string
  moratorium?: string

  // CC Limit
  currentLimit?: number
  enhancementSought?: number
  enhancementReason?: string
  utilisation?: string
  debtorDays?: string
  creditorDays?: string
  inventoryDays?: string
  salesProjections?: string
  stockDebtorNotes?: string

  // Takeover
  facilityToTakeover?: string
  takeoverReason?: string
  takeoverLender?: string
  takeoverOutstanding?: string
  repaymentTrack?: string
  securityHeld?: string
  foreclosureTerms?: string

  // Buyback
  buybackPurpose?: string
  exitingParty?: string
  buybackAmount?: number
  buybackPrice?: string
  shareholdingBefore?: string
  shareholdingAfter?: string
  buybackRepaymentSource?: string
  buybackApprovals?: string

  // Special Situation
  stressScenario?: string
  accountStatus?: string
  overdues?: string
  litigation?: string
  turnaroundPlan?: string
  specialSecurity?: string

  // Acquisition
  targetCompany?: string
  dealValuation?: number
  consideration?: string
  dealRationale?: string
  debtEquitySplit?: string
  acquisitionRepaymentSource?: string
  dealStatus?: string
}

export interface Case {
  id: string
  companyId: string
  caseType: CaseType
  status: CaseStatus
  assignedAdmin: string
  clientLinkToken: string
  clientLinkExpires: string
  mandateStatus: MandateStatus
  mandateDate?: string
  mandateNote?: string
  mandateCopy?: string
  ndaStatus: MandateStatus
  ndaDate?: string
  ndaNote?: string
  ndaCopy?: string
  createdAt: string
  updatedAt: string
  fields: CaseFields
  documents: DocumentItem[]
  extractions: ExtractedValue[]
  sector: string
  geography: string
  securityOffered: string
  completionPct: number
}

export interface Funder {
  id: string
  name: string
  category: FunderCategory
  products: string[]
  ticketMin: number
  ticketMax: number
  sectors: string[]
  geography: string[]
  contacts: { name: string; email: string; phone?: string }[]
  notes?: string
}

export interface Circulation {
  id: string
  caseId: string
  funderId: string
  dateSent: string
  responseStatus: CirculationResponse
  notes: string
  matchReason: string
  score: number
  approvedBy?: string
}

export interface AuditEntry {
  id: string
  caseId: string
  user: string
  action: string
  at: string
}
