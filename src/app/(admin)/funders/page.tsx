'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { formatCr } from '@/data/mock'
import type { FunderCategory } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import {
  Badge,
  EmptyState,
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

export default function FundersPage() {
  const { funders, circulations } = useApp()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FunderCategory | 'All'>('All')

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
              description="Try a different search or category filter."
            />
          ) : null}
        </div>
      </Section>
    </div>
  )
}
