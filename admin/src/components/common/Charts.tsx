import type { ReactNode } from 'react'
import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { CountItem } from '@/types'
import { humanize } from '@/utils/format'

export const CHART_COLORS = ['#276EF1', '#05944F', '#FFC043', '#E11900', '#7356BF', '#6B6B6B']

export function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="card chart-card">
      <header>
        <h3>{title}</h3>
        {subtitle && <p className="muted">{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}

export function BarChart({ data, color = CHART_COLORS[0], height = 260 }: { data: CountItem[]; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
        <Tooltip cursor={{ fill: 'var(--surface)' }} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
        <Bar dataKey="value" name="Count" fill={color} radius={[6, 6, 0, 0]} maxBarSize={44} />
      </RBarChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data, height = 260 }: { data: CountItem[]; height?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div className="chart-empty muted">No data yet</div>
  return (
    <div className="donut">
      <ResponsiveContainer width="55%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="60%" outerRadius="90%" paddingAngle={2} stroke="none">
            {data.map((d, i) => (
              <Cell key={d.label} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [v, humanize(String(n))]} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="legend">
        {data.map((d, i) => (
          <li key={d.label}>
            <span className="swatch" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span>{humanize(d.label)}</span>
            <strong>{d.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
