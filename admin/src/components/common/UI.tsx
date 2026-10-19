import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

import { humanize } from '@/utils/format'

type Variant = 'primary' | 'ghost' | 'danger' | 'success'

export function Button({
  variant = 'primary',
  size,
  loading,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm'; loading?: boolean }) {
  return (
    <button
      className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? '…' : children}
    </button>
  )
}

export function Input({ label, error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string | null }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <input className={`input ${error ? 'input-error' : ''}`} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

export function Select({
  options,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select className="input select" {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

const TONES: Record<string, string> = {
  ACTIVE: 'success',
  APPROVED: 'success',
  ONLINE: 'success',
  PENDING: 'warning',
  OFFLINE: 'neutral',
  SUSPENDED: 'danger',
  REJECTED: 'danger',
  DEACTIVATED: 'neutral',
  CUSTOMER: 'info',
  DRIVER: 'info',
  ADMIN: 'purple',
  SUPER_ADMIN: 'purple',
}

export function Badge({ value }: { value: string }) {
  return <span className={`badge badge-${TONES[value] ?? 'neutral'}`}>{humanize(value)}</span>
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card stat-card">
      <span className="muted">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="muted small">{hint}</span>}
    </div>
  )
}

export function Alert({ tone = 'danger', children }: { tone?: 'danger' | 'info'; children: ReactNode }) {
  return <div className={`alert alert-${tone}`}>{children}</div>
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}
