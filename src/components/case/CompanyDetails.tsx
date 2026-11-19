'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import type { Person, Shareholder, ShareholderType } from '@/types'
import { Button, Field, Input, Section, Select, Textarea } from '@/components/ui'

const CONSTITUTIONS = [
  'Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'Public Limited',
]

const ROLES = [
  'Promoter / Managing Director',
  'Promoter / Director',
  'Director',
  'Director (Independent)',
  'Partner',
  'Proprietor',
  'CEO',
  'CFO',
  'Company Secretary',
]

export function CompanyDetailsScreen() {
  const { id } = useParams<{ id: string }>()
  const {
    getCase,
    getCompany,
    updateCompany,
    setCompanyPeople,
    setCompanyShareholders,
  } = useApp()
  const caseItem = getCase(id)!
  const company = getCompany(caseItem.companyId)!

  const [form, setForm] = useState({
    name: company.name,
    registeredAddress: company.registeredAddress,
    incorporationYear: company.incorporationYear,
    constitution: company.constitution,
    cin: company.cin,
    pan: company.pan,
    gstin: company.gstin ?? '',
    businessDescription: company.businessDescription,
    products: company.products,
    capacities: company.capacities,
    keyClients: company.keyClients,
    locations: company.locations,
  })
  const [people, setPeople] = useState<Person[]>(company.people)
  const [shareholders, setShareholders] = useState<Shareholder[]>(
    company.shareholders,
  )
  const [saved, setSaved] = useState(false)

  const shareTotal = useMemo(
    () => shareholders.reduce((sum, s) => sum + (Number(s.percentage) || 0), 0),
    [shareholders],
  )
  const shareOk = Math.abs(shareTotal - 100) < 0.01

  function saveDraft() {
    updateCompany(company.id, {
      ...form,
      incorporationYear: Number(form.incorporationYear),
    })
    setCompanyPeople(company.id, people)
    setCompanyShareholders(company.id, shareholders)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addPerson() {
    setPeople((prev) => [
      ...prev,
      {
        id: `p${Date.now()}`,
        name: '',
        role: 'Director',
        din: '',
        profile: '',
        shareholding: 0,
      },
    ])
  }

  function addShareholder() {
    setShareholders((prev) => [
      ...prev,
      {
        id: `sh${Date.now()}`,
        name: '',
        type: 'Individual',
        percentage: 0,
      },
    ])
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-embee-700">
            Admin demo · Screen 1
          </p>
          <h2 className="mt-1 font-display text-[1.55rem] text-ink">
            Company details
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">
            Create or verify the company record before financial and document
            intake. Repeatable people and shareholder rows, with shareholding
            total validation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={saveDraft}>
            {saved ? 'Saved' : 'Save draft'}
          </Button>
          <Button onClick={saveDraft}>Save & continue</Button>
        </div>
      </div>

      <Section title="Company / business identity" subtitle="Registered legal particulars">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company / business name *" className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Enter registered legal name"
            />
          </Field>
          <Field label="Registered office address *" className="sm:col-span-2">
            <Textarea
              value={form.registeredAddress}
              onChange={(e) =>
                setForm((f) => ({ ...f, registeredAddress: e.target.value }))
              }
              placeholder="Building, street, city, state, PIN code"
            />
          </Field>
          <Field label="Year of incorporation / establishment">
            <Input
              type="number"
              value={form.incorporationYear}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  incorporationYear: Number(e.target.value),
                }))
              }
              placeholder="YYYY"
            />
          </Field>
          <Field label="Constitution of business *">
            <Select
              value={form.constitution}
              onChange={(e) =>
                setForm((f) => ({ ...f, constitution: e.target.value }))
              }
            >
              {CONSTITUTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              {!CONSTITUTIONS.includes(form.constitution) ? (
                <option value={form.constitution}>{form.constitution}</option>
              ) : null}
            </Select>
          </Field>
          <Field label="CIN / LLPIN">
            <Input
              value={form.cin}
              onChange={(e) => setForm((f) => ({ ...f, cin: e.target.value }))}
            />
          </Field>
          <Field label="Company PAN">
            <Input
              value={form.pan}
              onChange={(e) => setForm((f) => ({ ...f, pan: e.target.value }))}
            />
          </Field>
          <Field label="GSTIN">
            <Input
              value={form.gstin}
              onChange={(e) =>
                setForm((f) => ({ ...f, gstin: e.target.value }))
              }
            />
          </Field>
          <Field label="Operating locations">
            <Input
              value={form.locations}
              onChange={(e) =>
                setForm((f) => ({ ...f, locations: e.target.value }))
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Directors / partners / proprietor"
        subtitle="Add each person with designation and DIN / ID where applicable"
        actions={
          <Button variant="secondary" size="sm" onClick={addPerson}>
            + Add another person
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="hidden grid-cols-[1.4fr_1.2fr_0.8fr_auto] gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted sm:grid">
            <span>Name</span>
            <span>Designation / role</span>
            <span>DIN / ID</span>
            <span />
          </div>
          {people.map((p, idx) => (
            <div
              key={p.id}
              className="grid gap-3 border border-line bg-surface/40 p-3 sm:grid-cols-[1.4fr_1.2fr_0.8fr_auto] sm:items-end"
            >
              <Field label="Name">
                <Input
                  value={p.name}
                  placeholder="Add director / partner name"
                  onChange={(e) =>
                    setPeople((prev) =>
                      prev.map((row, i) =>
                        i === idx ? { ...row, name: e.target.value } : row,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="Designation / role">
                <Select
                  value={p.role}
                  onChange={(e) =>
                    setPeople((prev) =>
                      prev.map((row, i) =>
                        i === idx ? { ...row, role: e.target.value } : row,
                      ),
                    )
                  }
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  {!ROLES.includes(p.role) ? (
                    <option value={p.role}>{p.role}</option>
                  ) : null}
                </Select>
              </Field>
              <Field label="DIN / ID">
                <Input
                  value={p.din ?? ''}
                  placeholder="Enter number"
                  onChange={(e) =>
                    setPeople((prev) =>
                      prev.map((row, i) =>
                        i === idx ? { ...row, din: e.target.value } : row,
                      ),
                    )
                  }
                />
              </Field>
              <Button
                variant="ghost"
                size="sm"
                className="mb-0.5"
                onClick={() =>
                  setPeople((prev) => prev.filter((_, i) => i !== idx))
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Shareholding pattern"
        subtitle="Target total 100%. Corporate and individual rows are supported."
        actions={
          <Button variant="secondary" size="sm" onClick={addShareholder}>
            + Add another shareholder
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="hidden grid-cols-[1.5fr_1fr_0.7fr_auto] gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted sm:grid">
            <span>Shareholder name</span>
            <span>Type</span>
            <span>Shareholding %</span>
            <span />
          </div>
          {shareholders.map((s, idx) => (
            <div
              key={s.id}
              className="grid gap-3 border border-line bg-surface/40 p-3 sm:grid-cols-[1.5fr_1fr_0.7fr_auto] sm:items-end"
            >
              <Field label="Shareholder name">
                <Input
                  value={s.name}
                  placeholder="Enter shareholder name"
                  onChange={(e) =>
                    setShareholders((prev) =>
                      prev.map((row, i) =>
                        i === idx ? { ...row, name: e.target.value } : row,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="Type">
                <Select
                  value={s.type}
                  onChange={(e) =>
                    setShareholders((prev) =>
                      prev.map((row, i) =>
                        i === idx
                          ? {
                              ...row,
                              type: e.target.value as ShareholderType,
                            }
                          : row,
                      ),
                    )
                  }
                >
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate</option>
                </Select>
              </Field>
              <Field label="Shareholding %">
                <Input
                  type="number"
                  step="0.01"
                  value={s.percentage}
                  onChange={(e) =>
                    setShareholders((prev) =>
                      prev.map((row, i) =>
                        i === idx
                          ? { ...row, percentage: Number(e.target.value) }
                          : row,
                      ),
                    )
                  }
                />
              </Field>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setShareholders((prev) => prev.filter((_, i) => i !== idx))
                }
              >
                Remove
              </Button>
            </div>
          ))}
          <div
            className={`flex items-center justify-between border px-4 py-3 text-[13px] ${
              shareOk
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-950'
            }`}
          >
            <span className="font-semibold">Shareholding total</span>
            <span className="tabular-nums">
              {shareTotal.toFixed(2)}% {shareOk ? '· Valid' : '· Must equal 100%'}
            </span>
          </div>
        </div>
      </Section>

      <Section title="Business description" subtitle="Products, industry, operating model and key activities">
        <div className="grid gap-4">
          <Field label="Business description">
            <Textarea
              className="min-h-[120px]"
              value={form.businessDescription}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  businessDescription: e.target.value,
                }))
              }
              placeholder="One paragraph describing the company's business, products/services, industry, operating model and key activities."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Products / services">
              <Input
                value={form.products}
                onChange={(e) =>
                  setForm((f) => ({ ...f, products: e.target.value }))
                }
              />
            </Field>
            <Field label="Capacities">
              <Input
                value={form.capacities}
                onChange={(e) =>
                  setForm((f) => ({ ...f, capacities: e.target.value }))
                }
              />
            </Field>
            <Field label="Key clients" className="sm:col-span-2">
              <Input
                value={form.keyClients}
                onChange={(e) =>
                  setForm((f) => ({ ...f, keyClients: e.target.value }))
                }
              />
            </Field>
          </div>
        </div>
      </Section>
    </div>
  )
}
