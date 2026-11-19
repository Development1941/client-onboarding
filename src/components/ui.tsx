'use client'

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'red' | 'green' | 'amber' | 'blue' | 'purple'
}) {
  const tones = {
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    red: 'bg-embee-50 text-embee-900 border-embee-200',
    green: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    amber: 'bg-amber-50 text-amber-950 border-amber-200',
    blue: 'bg-sky-50 text-sky-900 border-sky-200',
    purple: 'bg-violet-50 text-violet-900 border-violet-200',
  }
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

export function statusTone(status: string) {
  const map: Record<
    string,
    'neutral' | 'red' | 'green' | 'amber' | 'blue' | 'purple'
  > = {
    Draft: 'neutral',
    'Client Filling': 'blue',
    'Under Review': 'amber',
    'Ready for Circulation': 'purple',
    Circulated: 'green',
    Closed: 'neutral',
    'Not Started': 'neutral',
    'In Progress': 'amber',
    Done: 'green',
    pending: 'neutral',
    extracted: 'amber',
    confirmed: 'green',
    rejected: 'red',
    Sent: 'blue',
    Interested: 'green',
    'Queries Raised': 'amber',
    Declined: 'red',
    'Term Sheet Issued': 'purple',
  }
  return map[status] ?? 'neutral'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}) {
  const variants = {
    primary: 'bg-embee-800 text-white hover:bg-embee-900 border border-embee-800',
    secondary:
      'bg-white text-ink border border-line hover:border-embee-300 hover:bg-embee-50',
    ghost: 'bg-transparent text-muted border border-transparent hover:bg-stone-100 hover:text-ink',
    danger: 'bg-red-700 text-white border border-red-700 hover:bg-red-800',
  }
  const sizes = {
    sm: 'px-2.5 py-1.5 text-[12px]',
    md: 'px-3.5 py-2 text-[13px]',
    lg: 'px-4.5 py-2.5 text-[14px]',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </span>
      {children}
      {hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
    </label>
  )
}

const control =
  'w-full border border-line bg-white px-3 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-stone-400 focus:border-embee-500 focus:ring-1 focus:ring-embee-200'

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${control} ${className}`} {...props} />
}

export function Select({
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${control} ${className}`} {...props} />
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${control} min-h-[104px] resize-y leading-relaxed ${className}`}
      {...props}
    />
  )
}

export function Section({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`border border-line bg-panel shadow-[0_1px_0_rgba(28,25,23,0.03)] ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-[1.35rem] leading-snug text-ink">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-[13px] text-muted">{subtitle}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="border border-dashed border-line bg-surface px-6 py-10 text-center">
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[13px] text-muted">{description}</p>
    </div>
  )
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="border border-line bg-panel px-4 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
        {label}
      </p>
      <p className="mt-1.5 font-display text-[1.85rem] leading-none text-embee-900">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[12px] text-muted">{hint}</p> : null}
    </div>
  )
}
