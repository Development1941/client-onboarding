'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useApp } from '@/context/AppContext'
import {
  IconCases,
  IconClose,
  IconFunders,
  IconLogout,
  IconMenu,
} from './icons'
import { Button } from './ui'

const adminNav = [
  {
    href: '/',
    label: 'Case Dashboard',
    description: 'Pipeline & intake',
    exact: true,
    icon: IconCases,
  },
  {
    href: '/funders',
    label: 'Funder Database',
    description: 'Institutions & contacts',
    exact: false,
    icon: IconFunders,
  },
]

function usePageMeta(pathname: string) {
  return useMemo(() => {
    if (pathname.startsWith('/cases/')) {
      return {
        title: 'Case workspace',
        subtitle: 'Company · documents · requirement · circulation',
      }
    }
    if (pathname.startsWith('/funders')) {
      return {
        title: 'Funder database',
        subtitle: 'Institutions, products and contacts',
      }
    }
    return {
      title: 'Case dashboard',
      subtitle: 'All debt cases under Embee coverage',
    }
  }, [pathname])
}

function SidebarBrand() {
  return (
    <Link href="/" className="flex items-center gap-3 px-1">
      <span className="flex h-9 w-9 items-center justify-center border border-white/15 bg-embee-800 text-[13px] font-semibold tracking-wide text-white">
        E
      </span>
      <div>
        <p className="text-[13px] font-semibold tracking-wide text-white">
          EMBEE
        </p>
        <p className="text-[11px] text-sidebar-muted">Client Onboarding</p>
      </div>
    </Link>
  )
}

function AdminNavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-1">
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted">
        Workspace
      </p>
      {adminNav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-start gap-3 border-l-2 px-3 py-2.5 transition ${
              active
                ? 'border-embee-400 bg-white/8 text-white'
                : 'border-transparent text-sidebar-muted hover:border-white/20 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <span className="block text-[13px] font-medium leading-tight">
                {item.label}
              </span>
              <span className="mt-0.5 block text-[11px] opacity-70">
                {item.description}
              </span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout, cases } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const meta = usePageMeta(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)

  const openReview = cases.filter((c) => c.status === 'Under Review').length

  function signOut() {
    logout()
    router.push('/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-white">
      <div className="border-b border-white/10 px-4 py-5">
        <SidebarBrand />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-5">
        <AdminNavLinks
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />

        <div className="mt-8 border border-white/10 bg-white/5 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
            Attention
          </p>
          <p className="mt-1.5 text-[13px] text-white">
            {openReview} case{openReview === 1 ? '' : 's'} under review
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-sidebar-muted">
            Confirm extractions before values feed the two-pager.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
          Signed in
        </p>
        <p className="mt-1 truncate text-[13px] font-medium text-white">
          {user?.name}
        </p>
        <p className="truncate text-[11px] text-sidebar-muted">{user?.email}</p>
        <button
          type="button"
          onClick={signOut}
          className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-sidebar-muted transition hover:text-white"
        >
          <IconLogout />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-stone-900/20 lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(18rem,88vw)] shadow-2xl">
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded border border-white/15 bg-white/10 p-1.5 text-white"
              >
                <IconClose />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      ) : null}

      {/* Top header */}
      <header className="sticky top-0 z-30 border-b border-line bg-panel/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="border border-line bg-white p-1.5 text-ink lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">
                {meta.title}
              </p>
              <p className="hidden truncate text-[11px] text-muted sm:block">
                {meta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 border border-line bg-surface px-2.5 py-1 text-[11px] text-muted md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-embee-700" />
              Debt segment · Phase 1
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-medium text-ink">{user?.name}</p>
              <p className="text-[11px] text-muted">Administrator</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center border border-line bg-embee-50 text-[12px] font-semibold text-embee-900">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}

const clientNav = [
  {
    href: '/client',
    label: 'Case status',
    description: 'Your case overview',
    exact: true,
  },
  {
    href: '/client/company',
    label: 'Company profile',
    description: 'Business particulars',
    exact: false,
  },
  {
    href: '/client/requirement',
    label: 'Requirement',
    description: 'Case fields to fill',
    exact: false,
  },
  {
    href: '/client/documents',
    label: 'Documents',
    description: 'Upload & track files',
    exact: false,
  },
  {
    href: '/client/questions',
    label: 'Ask Embee',
    description: 'Notes & questions',
    exact: false,
  },
]

export function ClientShell({ children }: { children: React.ReactNode }) {
  const { user, logout, getCase, getCompany } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const caseItem = user?.caseId ? getCase(user.caseId) : undefined
  const company = caseItem ? getCompany(caseItem.companyId) : undefined

  function signOut() {
    logout()
    router.push('/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-white">
      <div className="border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-3 px-1">
          <span className="flex h-9 w-9 items-center justify-center border border-white/15 bg-embee-800 text-[13px] font-semibold tracking-wide text-white">
            E
          </span>
          <div>
            <p className="text-[13px] font-semibold tracking-wide text-white">
              EMBEE
            </p>
            <p className="text-[11px] text-sidebar-muted">Client workspace</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted">
          Your case only
        </p>
        <nav className="space-y-0.5">
          {clientNav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block border-l-2 px-3 py-2.5 transition ${
                  active
                    ? 'border-embee-400 bg-white/8 text-white'
                    : 'border-transparent text-sidebar-muted hover:border-white/20 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="block text-[13px] font-medium leading-tight">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[11px] opacity-70">
                  {item.description}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 border border-white/10 bg-white/5 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
            Privacy
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/75">
            You see only this case. No case list, other companies, or funder
            details are shown.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
          Signed in
        </p>
        <p className="mt-1 truncate text-[13px] font-medium text-white">
          {user?.name}
        </p>
        <p className="truncate text-[11px] text-sidebar-muted">{user?.email}</p>
        <button
          type="button"
          onClick={signOut}
          className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-sidebar-muted transition hover:text-white"
        >
          <IconLogout />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-stone-900/20 lg:block">
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(18rem,88vw)] shadow-2xl">
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded border border-white/15 bg-white/10 p-1.5 text-white"
              >
                <IconClose />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-line bg-panel/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="border border-line bg-white p-1.5 text-ink lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">
                {company?.name ?? 'Client workspace'}
              </p>
              <p className="hidden truncate text-[11px] text-muted sm:block">
                {caseItem
                  ? `${caseItem.caseType} · Status: ${caseItem.status} · Expires ${caseItem.clientLinkExpires}`
                  : 'Private case access'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-medium text-ink">{user?.name}</p>
              <p className="text-[11px] text-muted">Client</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center border border-line bg-embee-50 text-[12px] font-semibold text-embee-900">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  )
}
