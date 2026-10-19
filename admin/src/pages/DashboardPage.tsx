import { useEffect, useState } from 'react'

import { Alert, BarChart, ChartCard, DonutChart, PageHeader, StatCard } from '@/components/common'
import { adminService } from '@/services/admin.service'
import type { DashboardStats } from '@/types'
import { getErrorMessage } from '@/utils/appError'

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminService.getStats().then(setStats).catch((e) => setError(getErrorMessage(e)))
  }, [])

  const signups = stats?.signups_last_7_days.map((d) => ({
    label: new Date(d.label).toLocaleDateString('en-IN', { weekday: 'short' }),
    value: d.value,
  }))

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Platform overview" />
      {error && <Alert>{error}</Alert>}

      <div className="stat-grid">
        <StatCard label="Total users" value={stats?.total_users ?? '—'} />
        <StatCard label="Drivers" value={stats?.total_drivers ?? '—'} />
        <StatCard label="Pending approval" value={stats?.pending_drivers ?? '—'} hint="Drivers awaiting review" />
        <StatCard label="Drivers online" value={stats?.online_drivers ?? '—'} />
      </div>

      <div className="chart-grid">
        <ChartCard title="New signups" subtitle="Last 7 days">
          <BarChart data={signups ?? []} />
        </ChartCard>
        <ChartCard title="Users by role">
          <DonutChart data={stats?.users_by_role ?? []} />
        </ChartCard>
        <ChartCard title="Drivers by approval status">
          <DonutChart data={stats?.drivers_by_approval ?? []} />
        </ChartCard>
        <ChartCard title="Rides" subtitle="Daily / weekly ride counts and revenue">
          <div className="chart-empty muted">Available once ride booking ships (Phase 2–3).</div>
        </ChartCard>
      </div>
    </>
  )
}
