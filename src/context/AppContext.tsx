'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  auditLog as seedAudit,
  cases as seedCases,
  circulations as seedCirculations,
  companies as seedCompanies,
  funders as seedFunders,
  users,
} from '@/data/mock'
import type {
  AuditEntry,
  Case,
  Circulation,
  CirculationResponse,
  Company,
  DocCategory,
  DocumentItem,
  ExtractionStatus,
  Funder,
  MandateStatus,
  Person,
  SanctionLetter,
  Shareholder,
  User,
  VerificationStatus,
} from '@/types'

interface AppContextValue {
  user: User | null
  ready: boolean
  login: (email: string) => boolean
  logout: () => void
  companies: Company[]
  cases: Case[]
  funders: Funder[]
  circulations: Circulation[]
  auditLog: AuditEntry[]
  getCompany: (id: string) => Company | undefined
  getCase: (id: string) => Case | undefined
  getCaseByToken: (token: string) => Case | undefined
  updateCase: (id: string, patch: Partial<Case>) => void
  updateCaseFields: (id: string, fields: Partial<Case['fields']>) => void
  updateCompany: (id: string, patch: Partial<Company>) => void
  setCompanyPeople: (companyId: string, people: Person[]) => void
  setCompanyShareholders: (companyId: string, shareholders: Shareholder[]) => void
  updateExtraction: (
    caseId: string,
    fieldKey: string,
    status: ExtractionStatus,
  ) => void
  updateMandateNda: (
    caseId: string,
    which: 'mandate' | 'nda',
    status: MandateStatus,
    note?: string,
    date?: string,
  ) => void
  addDocument: (
    caseId: string,
    doc: {
      name: string
      type: string
      category: DocCategory
      periodLabel?: string
      linkedPersonId?: string
    },
  ) => void
  updateDocumentVerification: (
    caseId: string,
    docId: string,
    status: VerificationStatus,
  ) => void
  updateIntakeConfig: (caseId: string, patch: Partial<Case['intakeConfig']>) => void
  setSanctionLetters: (caseId: string, letters: SanctionLetter[]) => void
  addCirculation: (
    caseId: string,
    funderId: string,
    reason: string,
    score: number,
  ) => void
  updateCirculationStatus: (
    id: string,
    status: CirculationResponse,
    notes?: string,
  ) => void
  createCase: (input: {
    companyId: string
    caseType: Case['caseType']
    amountSought: number
    requirementText: string
  }) => Case
  addFunder: (input: {
    name: string
    category: Funder['category']
    products: string[]
    ticketMin: number
    ticketMax: number
    sectors: string[]
    geography: string[]
    contactName: string
    contactEmail: string
  }) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [companies, setCompanies] = useState(seedCompanies)
  const [cases, setCases] = useState(seedCases)
  const [funders, setFunders] = useState(seedFunders)
  const [circulations, setCirculations] = useState(seedCirculations)
  const [auditLog, setAuditLog] = useState(seedAudit)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('embee_user')
      if (saved) setUser(JSON.parse(saved) as User)
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  const pushAudit = useCallback(
    (caseId: string, action: string) => {
      setAuditLog((prev) => [
        {
          id: `a${Date.now()}`,
          caseId,
          user: user?.name ?? 'System',
          action,
          at: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
        ...prev,
      ])
    },
    [user],
  )

  const login = useCallback((email: string) => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    )
    if (!found) return false
    setUser(found)
    localStorage.setItem('embee_user', JSON.stringify(found))
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('embee_user')
  }, [])

  const getCompany = useCallback(
    (id: string) => companies.find((c) => c.id === id),
    [companies],
  )

  const getCase = useCallback(
    (id: string) => cases.find((c) => c.id === id),
    [cases],
  )

  const getCaseByToken = useCallback(
    (token: string) => cases.find((c) => c.clientLinkToken === token),
    [cases],
  )

  const updateCase = useCallback(
    (id: string, patch: Partial<Case>) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...patch,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : c,
        ),
      )
      pushAudit(id, `Updated case: ${Object.keys(patch).join(', ')}`)
    },
    [pushAudit],
  )

  const updateCaseFields = useCallback(
    (id: string, fields: Partial<Case['fields']>) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                fields: { ...c.fields, ...fields },
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : c,
        ),
      )
      pushAudit(id, 'Updated case fields')
    },
    [pushAudit],
  )

  const updateCompany = useCallback(
    (id: string, patch: Partial<Company>) => {
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      )
      const linked = cases.find((c) => c.companyId === id)
      if (linked) pushAudit(linked.id, `Updated company profile: ${Object.keys(patch).join(', ')}`)
    },
    [cases, pushAudit],
  )

  const setCompanyPeople = useCallback(
    (companyId: string, people: Person[]) => {
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, people } : c)),
      )
      const linked = cases.find((c) => c.companyId === companyId)
      if (linked) pushAudit(linked.id, 'Updated directors / partners list')
    },
    [cases, pushAudit],
  )

  const setCompanyShareholders = useCallback(
    (companyId: string, shareholders: Shareholder[]) => {
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, shareholders } : c)),
      )
      const linked = cases.find((c) => c.companyId === companyId)
      if (linked) pushAudit(linked.id, 'Updated shareholding pattern')
    },
    [cases, pushAudit],
  )

  const updateExtraction = useCallback(
    (caseId: string, fieldKey: string, status: ExtractionStatus) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                extractions: c.extractions.map((e) =>
                  e.fieldKey === fieldKey ? { ...e, status } : e,
                ),
              }
            : c,
        ),
      )
      pushAudit(caseId, `${status} extraction: ${fieldKey}`)
    },
    [pushAudit],
  )

  const updateMandateNda = useCallback(
    (
      caseId: string,
      which: 'mandate' | 'nda',
      status: MandateStatus,
      note?: string,
      date?: string,
    ) => {
      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== caseId) return c
          if (which === 'mandate') {
            return {
              ...c,
              mandateStatus: status,
              mandateNote: note ?? c.mandateNote,
              mandateDate: date ?? c.mandateDate,
            }
          }
          return {
            ...c,
            ndaStatus: status,
            ndaNote: note ?? c.ndaNote,
            ndaDate: date ?? c.ndaDate,
          }
        }),
      )
      pushAudit(caseId, `Set ${which} status to ${status}`)
    },
    [pushAudit],
  )

  const addDocument = useCallback(
    (
      caseId: string,
      doc: {
        name: string
        type: string
        category: DocCategory
        periodLabel?: string
        linkedPersonId?: string
      },
    ) => {
      const item: DocumentItem = {
        id: `d${Date.now()}`,
        name: doc.name,
        type: doc.type,
        category: doc.category,
        periodLabel: doc.periodLabel,
        uploadedBy: user?.name ?? 'Unknown',
        uploadSource: user?.role === 'client' ? 'client' : 'admin',
        uploadedAt: new Date().toISOString().slice(0, 10),
        extractionStatus: 'pending',
        verificationStatus: 'Uploaded',
        size: '—',
        version: 1,
        linkedPersonId: doc.linkedPersonId,
      }
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId ? { ...c, documents: [item, ...c.documents] } : c,
        ),
      )
      pushAudit(caseId, `Uploaded ${doc.name}`)
    },
    [pushAudit, user],
  )

  const updateDocumentVerification = useCallback(
    (caseId: string, docId: string, status: VerificationStatus) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                documents: c.documents.map((d) =>
                  d.id === docId ? { ...d, verificationStatus: status } : d,
                ),
              }
            : c,
        ),
      )
      pushAudit(caseId, `Document ${docId} marked ${status}`)
    },
    [pushAudit],
  )

  const updateIntakeConfig = useCallback(
    (caseId: string, patch: Partial<Case['intakeConfig']>) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? { ...c, intakeConfig: { ...c.intakeConfig, ...patch } }
            : c,
        ),
      )
      pushAudit(caseId, 'Updated document look-back periods')
    },
    [pushAudit],
  )

  const setSanctionLetters = useCallback(
    (caseId: string, letters: SanctionLetter[]) => {
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, sanctionLetters: letters } : c)),
      )
      pushAudit(caseId, 'Updated bank sanction letters')
    },
    [pushAudit],
  )

  const addCirculation = useCallback(
    (caseId: string, funderId: string, reason: string, score: number) => {
      setCirculations((prev) => [
        {
          id: `cir${Date.now()}`,
          caseId,
          funderId,
          dateSent: new Date().toISOString().slice(0, 10),
          responseStatus: 'Sent',
          notes: '',
          matchReason: reason,
          score,
          approvedBy: user?.name,
        },
        ...prev,
      ])
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId ? { ...c, status: 'Circulated' as const } : c,
        ),
      )
      pushAudit(caseId, `Circulated two-pager to funder ${funderId}`)
    },
    [pushAudit, user],
  )

  const updateCirculationStatus = useCallback(
    (id: string, status: CirculationResponse, notes?: string) => {
      setCirculations((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, responseStatus: status, notes: notes ?? c.notes }
            : c,
        ),
      )
    },
    [],
  )

  const addFunder = useCallback(
    (input: {
      name: string
      category: Funder['category']
      products: string[]
      ticketMin: number
      ticketMax: number
      sectors: string[]
      geography: string[]
      contactName: string
      contactEmail: string
    }) => {
      setFunders((prev) => [
        {
          id: `f${Date.now()}`,
          name: input.name,
          category: input.category,
          products: input.products,
          ticketMin: input.ticketMin,
          ticketMax: input.ticketMax,
          sectors: input.sectors,
          geography: input.geography,
          contacts: [
            { name: input.contactName, email: input.contactEmail },
          ],
        },
        ...prev,
      ])
    },
    [],
  )

  const createCase = useCallback(
    (input: {
      companyId: string
      caseType: Case['caseType']
      amountSought: number
      requirementText: string
    }) => {
      const token = `${input.companyId}-${Date.now().toString(36)}`
      const newCase: Case = {
        id: `c${Date.now()}`,
        companyId: input.companyId,
        caseType: input.caseType,
        status: 'Draft',
        assignedAdmin: user?.name ?? 'Unassigned',
        clientLinkToken: token,
        clientLinkExpires: '2027-03-01',
        mandateStatus: 'Not Started',
        ndaStatus: 'Not Started',
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        sector:
          getCompany(input.companyId)?.products.split(',')[0]?.trim() ?? '',
        geography: 'Pan India',
        securityOffered: 'TBD',
        completionPct: 8,
        intakeConfig: {
          financialYearsRequired: 3,
          financialYearLabels: ['FY22', 'FY23', 'FY24'],
          bankStatementMonths: 3,
          gstMonths: 12,
        },
        sanctionLetters: [],
        fields: {
          requirementText: input.requirementText,
          amountSought: input.amountSought,
          otherInfo: '',
        },
        documents: [],
        extractions: [],
      }
      setCases((prev) => [newCase, ...prev])
      pushAudit(newCase.id, `Created ${input.caseType} case`)
      return newCase
    },
    [getCompany, pushAudit, user],
  )

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      logout,
      companies,
      cases,
      funders,
      circulations,
      auditLog,
      getCompany,
      getCase,
      getCaseByToken,
      updateCase,
      updateCaseFields,
      updateCompany,
      setCompanyPeople,
      setCompanyShareholders,
      updateExtraction,
      updateMandateNda,
      addDocument,
      updateDocumentVerification,
      updateIntakeConfig,
      setSanctionLetters,
      addCirculation,
      updateCirculationStatus,
      createCase,
      addFunder,
    }),
    [
      user,
      ready,
      login,
      logout,
      companies,
      cases,
      funders,
      circulations,
      auditLog,
      getCompany,
      getCase,
      getCaseByToken,
      updateCase,
      updateCaseFields,
      updateCompany,
      setCompanyPeople,
      setCompanyShareholders,
      updateExtraction,
      updateMandateNda,
      addDocument,
      updateDocumentVerification,
      updateIntakeConfig,
      setSanctionLetters,
      addCirculation,
      updateCirculationStatus,
      createCase,
      addFunder,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
