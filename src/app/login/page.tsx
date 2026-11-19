'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Button, Field, Input } from '@/components/ui'

const demos = [
  {
    email: 'harshit@embee.co.in',
    role: 'Administrator',
    note: 'Full access to cases, extraction review and funders',
  },
  {
    email: 'rajesh@aetherindustries.in',
    role: 'Client',
    note: 'Private access to the Aether Term Loan case only',
  },
]

export default function LoginPage() {
  const { user, ready, login } = useApp()
  const router = useRouter()
  const [email, setEmail] = useState('harshit@embee.co.in')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ready || !user) return
    router.replace(user.role === 'admin' ? '/' : '/client')
  }, [ready, user, router])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = login(email)
    if (!ok) {
      setError('No account found for that email. Use a demo account below.')
      return
    }
    const role = email.toLowerCase().includes('embee') ? 'admin' : 'client'
    router.push(role === 'admin' ? '/' : '/client')
  }

  if (!ready || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sidebar text-[13px] text-sidebar-muted">
        Loading workspace…
      </div>
    )
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-sidebar px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.55) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border border-white/20 bg-embee-800 text-sm font-semibold">
              E
            </span>
            <div>
              <p className="text-[13px] font-semibold tracking-[0.18em]">
                EMBEE
              </p>
              <p className="text-[12px] text-sidebar-muted">
                SoftBank Group Company
              </p>
            </div>
          </div>
          <h1 className="mt-14 max-w-md font-display text-[2.75rem] leading-[1.12]">
            Client Onboarding Platform
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
            Capture debt cases, review document extractions, assemble the
            two-page profile, and circulate to funders from a single case
            record.
          </p>
        </div>
        <div className="relative grid gap-4 border-t border-white/10 pt-8 text-[13px] text-white/65">
          <p className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-embee-400" />
            Admin intake with extraction confirmation
          </p>
          <p className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-embee-400" />
            Private client links unique to each case
          </p>
          <p className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-embee-400" />
            Funder matching, approval and response tracking
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-surface px-4 py-10 sm:px-8">
        <div className="w-full max-w-md border border-line bg-panel p-7 shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-embee-700">
            Secure access
          </p>
          <h2 className="mt-2 font-display text-[2rem] text-ink">Sign in</h2>
          <p className="mt-1.5 text-[14px] text-muted">
            Use your Embee email or the client link credentials issued for your
            case.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <Field label="Work email">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="name@embee.co.in"
                required
              />
            </Field>
            {error ? (
              <p className="border border-embee-200 bg-embee-50 px-3 py-2 text-[13px] text-embee-900">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" size="lg">
              Continue to workspace
            </Button>
          </form>

          <div className="mt-8 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Demonstration accounts
            </p>
            {demos.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => setEmail(d.email)}
                className="flex w-full items-start justify-between gap-3 border border-line px-3 py-3 text-left transition hover:border-embee-300 hover:bg-embee-50/60"
              >
                <div>
                  <p className="text-[13px] font-medium text-ink">{d.email}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{d.note}</p>
                </div>
                <span className="shrink-0 border border-line bg-surface px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                  {d.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
