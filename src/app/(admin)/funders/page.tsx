'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { formatCr } from '@/data/mock'
import type { CaseType, FunderCategory } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Section,
  Select,
  Stat,
} from '@/components/ui'

const CATEGORIES: Array<FunderCategory | 'All'> = [
  'All',
  'PSU Bank',
  'Private Bank',
  'NBFC',
  'AIF',
  'Other Financial Institution',
]

const PRODUCTS: CaseType[] = [
  'Term Loan',
  'CC Limit',
  'Takeover',
  'Buyback Funding',
  'Special Situation',
  'Acquisition Finance',
]

export default function FundersPage() {
  const { funders, circulations, addFunder } = useApp()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FunderCategory | 'All'>('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: 'Private Bank' as FunderCategory,
    product: 'Term Loan' as CaseType,
    ticketMin: 10,
    ticketMax: 100,
    sectors: 'Manufacturing',
    geography: 'Pan India',
    contactName: '',
    contactEmail: '',
  })

  const filtered = useMemo(() => {
    return funders.filter((f) => {
      const q = query.toLowerCase()
      const matchesQ =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.sectors.some((s) => s.toLowerCase().includes(q)) ||
        f.products.some((p) => p.toLowerCase().includes(q))
      const matchesCat = category === 'All' || f.category === category
      return matchesQ && matchesCat
    })
  }, [funders, query, category])

  function handleAdd() {
    if (!form.name.trim() || !form.contactEmail.trim()) return
    addFunder({
      name: form.name.trim(),
      category: form.category,
      products: [form.product],
      ticketMin: form.ticketMin,
      ticketMax: form.ticketMax,
      sectors: form.sectors.split(',').map((s) => s.trim()).filter(Boolean),
      geography: form.geography.split(',').map((s) => s.trim()).filter(Boolean),
      contactName: form.contactName.trim() || 'Contact',
      contactEmail: form.contactEmail.trim(),
    })
    setShowAdd(false)
    setForm({
      name: '',
      category: 'Private Bank',
      product: 'Term Loan',
      ticketMin: 10,
      ticketMax: 100,
      sectors: 'Manufacturing',
      geography: 'Pan India',
      contactName: '',
      contactEmail: '',
    })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Institution directory"
        title="Funder database"
        description="Funders have no platform login. Embee manages contacts, matches cases, and records responses after the two-pager is sent by email."
        breadcrumbs={[
          { label: 'Embee' },
          { label: 'Onboarding' },
          { label: 'Funders' },
        ]}
        actions={
          <Button onClick={() => setShowAdd(true)}>Add funder</Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Institutions" value={funders.length} />
        <Stat label="Active circulations" value={circulations.length} />
        <Stat
          label="Categories"
          value={new Set(funders.map((f) => f.category)).size}
        />
      </div>

      <Section
        title="Directory"
        subtitle={`${filtered.length} institution${filtered.length === 1 ? '' : 's'} shown`}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Input
              placeholder="Search name, sector, product…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:w-64"
            />
            <Select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as FunderCategory | 'All')
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        }
      >
        <div className="space-y-3">
          {filtered.map((f) => (
            <article
              key={f.id}
              className="border border-line px-4 py-4 transition hover:border-embee-300 hover:bg-embee-50/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-ink">
                      {f.name}
                    </h3>
                    <Badge tone="red">{f.category}</Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-muted">
                    Ticket range {formatCr(f.ticketMin)} – {formatCr(f.ticketMax)}
                  </p>
                </div>
                <p className="text-[12px] text-muted">
                  {circulations.filter((c) => c.funderId === f.id).length}{' '}
                  circulation
                  {circulations.filter((c) => c.funderId === f.id).length === 1
                    ? ''
                    : 's'}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {f.products.map((p) => (
                  <Badge key={p}>{p}</Badge>
                ))}
              </div>
              <div className="mt-3 grid gap-2 border-t border-line pt-3 text-[12px] text-muted sm:grid-cols-3">
                <p>
                  <span className="font-semibold text-ink">Sectors · </span>
                  {f.sectors.join(', ')}
                </p>
                <p>
                  <span className="font-semibold text-ink">Geography · </span>
                  {f.geography.join(', ')}
                </p>
                <p>
                  <span className="font-semibold text-ink">Contacts · </span>
                  {f.contacts.map((c) => c.name).join(', ')}
                </p>
              </div>
              {f.notes ? (
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  {f.notes}
                </p>
              ) : null}
            </article>
          ))}
          {filtered.length === 0 ? (
            <EmptyState
              title="No funders match"
              description="Try a different search or category filter, or add a funder."
            />
          ) : null}
        </div>
      </Section>

      {showAdd ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center">
          <div className="w-full max-w-lg border border-line bg-panel shadow-2xl">
            <div className="border-b border-line px-6 py-4">
              <h3 className="font-display text-[1.5rem] text-ink">Add funder</h3>
              <p className="mt-1 text-[13px] text-muted">
                Institutions are added one by one. They receive the two-pager by
                email only — no login.
              </p>
            </div>
            <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
              <Field label="Institution name" className="sm:col-span-2">
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </Field>
              <Field label="Category">
                <Select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as FunderCategory,
                    }))
                  }
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Primary product">
                <Select
                  value={form.product}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      product: e.target.value as CaseType,
                    }))
                  }
                >
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Ticket min (₹ Cr)">
                <Input
                  type="number"
                  value={form.ticketMin}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ticketMin: Number(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Ticket max (₹ Cr)">
                <Input
                  type="number"
                  value={form.ticketMax}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ticketMax: Number(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Sectors (comma-separated)" className="sm:col-span-2">
                <Input
                  value={form.sectors}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sectors: e.target.value }))
                  }
                />
              </Field>
              <Field
                label="Geography (comma-separated)"
                className="sm:col-span-2"
              >
                <Input
                  value={form.geography}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, geography: e.target.value }))
                  }
                />
              </Field>
              <Field label="Contact name">
                <Input
                  value={form.contactName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactName: e.target.value }))
                  }
                />
              </Field>
              <Field label="Contact email">
                <Input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactEmail: e.target.value }))
                  }
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
              <Button variant="secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>Save funder</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
