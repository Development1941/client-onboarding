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
  ExtractionStatus,
  Funder,
  MandateStatus,
  User,
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
  addDocument: (caseId: string, doc: { name: string; type: string }) => void
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
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [companies] = useState(seedCompanies)
  const [cases, setCases] = useState(seedCases)
  const [funders] = useState(seedFunders)
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
    (caseId: string, doc: { name: string; type: string }) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                documents: [
                  {
                    id: `d${Date.now()}`,
                    name: doc.name,
                    type: doc.type,
                    uploadedBy: user?.name ?? 'Unknown',
                    uploadSource: user?.role === 'client' ? 'client' : 'admin',
                    uploadedAt: new Date().toISOString().slice(0, 10),
                    extractionStatus: 'pending',
                    size: '—',
                  },
                  ...c.documents,
                ],
              }
            : c,
        ),
      )
      pushAudit(caseId, `Uploaded ${doc.name}`)
    },
    [pushAudit, user],
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
    [pushAudit],
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
      updateExtraction,
      updateMandateNda,
      addDocument,
      addCirculation,
      updateCirculationStatus,
      createCase,
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
      updateExtraction,
      updateMandateNda,
      addDocument,
      addCirculation,
      updateCirculationStatus,
      createCase,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
