import { useState } from 'react'

import { Alert, Badge, Button, DataTable, Input, PageHeader, Select, type Column } from '@/components/common'
import { DEFAULT_PAGE_SIZE } from '@/constants/config'
import { useDebounced, usePagedQuery } from '@/hooks/usePagedQuery'
import { adminService } from '@/services/admin.service'
import type { AdminDriver, ApprovalStatus } from '@/types'
import { getErrorMessage } from '@/utils/appError'
import { formatDate, formatPhone } from '@/utils/format'

const APPROVAL_OPTIONS = [
  { value: '', label: 'All drivers' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
]

type Decision = Exclude<ApprovalStatus, 'PENDING'>

export function DriversPage() {
  const [search, setSearch] = useState('')
  const [approval, setApproval] = useState('')
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState<string | null>(null)
  const q = useDebounced(search)

  const { data, loading, error, reload, setError } = usePagedQuery(
    () => adminService.listDrivers({ search: q, approval_status: approval, page, page_size: DEFAULT_PAGE_SIZE }),
    [q, approval, page],
  )

  const decide = async (d: AdminDriver, status: Decision) => {
    setBusy(`${d.id}:${status}`)
    try {
      await adminService.setDriverApproval(d.id, status)
      await reload()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  const action = (d: AdminDriver, status: Decision, label: string, variant: 'success' | 'danger' | 'ghost') => (
    <Button key={status} size="sm" variant={variant} loading={busy === `${d.id}:${status}`} onClick={() => decide(d, status)}>
      {label}
    </Button>
  )

  const columns: Column<AdminDriver>[] = [
    {
      key: 'driver',
      header: 'Driver',
      render: (d) => (
        <div className="cell-stack">
          <strong>{d.user.name ?? '—'}</strong>
          <span className="muted small">{formatPhone(d.user.phone)}</span>
        </div>
      ),
    },
    { key: 'license_number', header: 'Licence' },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (d) =>
        d.active_vehicle ? (
          <div className="cell-stack">
            <strong>{d.active_vehicle.registration_number}</strong>
            <span className="muted small">
              {[d.active_vehicle.vehicle_type, d.active_vehicle.make_model, d.active_vehicle.color].filter(Boolean).join(' · ')}
            </span>
          </div>
        ) : (
          '—'
        ),
    },
    { key: 'approval_status', header: 'Approval', render: (d) => <Badge value={d.approval_status} /> },
    { key: 'availability_status', header: 'Availability', render: (d) => <Badge value={d.availability_status} /> },
    { key: 'created_at', header: 'Applied', render: (d) => formatDate(d.created_at) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (d) => (
        <div className="row-actions">
          {d.approval_status === 'PENDING' && [action(d, 'APPROVED', 'Approve', 'success'), action(d, 'REJECTED', 'Reject', 'danger')]}
          {d.approval_status === 'APPROVED' && action(d, 'SUSPENDED', 'Suspend', 'danger')}
          {(d.approval_status === 'SUSPENDED' || d.approval_status === 'REJECTED') && action(d, 'APPROVED', 'Approve', 'ghost')}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Drivers" subtitle="Review registrations and manage driver access" />
      <div className="filters">
        <Input
          placeholder="Search name, phone or licence"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <Select options={APPROVAL_OPTIONS} value={approval} onChange={(e) => { setApproval(e.target.value); setPage(1) }} />
      </div>
      {error && <Alert>{error}</Alert>}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(d) => d.id}
        loading={loading}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
    </>
  )
}
