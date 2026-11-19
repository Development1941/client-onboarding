'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumbs,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}) {
  return (
    <div className="mb-6 border-b border-line pb-5">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
          {breadcrumbs.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? <span className="text-stone-300">/</span> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-embee-800">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ink">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          {eyebrow ? (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-embee-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-[1.85rem] leading-tight text-ink sm:text-[2.15rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}
