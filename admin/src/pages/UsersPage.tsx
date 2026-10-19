import { useState } from 'react'

import { Alert, Badge, Button, DataTable, Input, PageHeader, Select, type Column } from '@/components/common'
import { DEFAULT_PAGE_SIZE } from '@/constants/config'
import { useDebounced, usePagedQuery } from '@/hooks/usePagedQuery'
import { adminService } from '@/services/admin.service'
import { useAuthStore, useIsSuperAdmin } from '@/store/authStore'
import type { AccountStatus, User } from '@/types'
import { getErrorMessage } from '@/utils/appError'
import { formatDate, formatPhone } from '@/utils/format'

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'DRIVER', label: 'Driver' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super admin' },
]
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
]

export function UsersPage() {
  const me = useAuthStore((s) => s.user)
  const isSuperAdmin = useIsSuperAdmin()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState<string | null>(null)
  const q = useDebounced(search)

  const { data, loading, error, reload, setError } = usePagedQuery(
    () => adminService.listUsers({ search: q, role, status, page, page_size: DEFAULT_PAGE_SIZE }),
    [q, role, status, page],
  )

  const changeStatus = async (user: User, next: AccountStatus) => {
    setBusyId(user.id)
    try {
      await adminService.setUserStatus(user.id, next)
      await reload()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  const canModerate = (u: User) => {
    if (u.id === me?.id) return false
    const privileged = u.roles.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN')
    return !privileged || isSuperAdmin
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="cell-stack">
          <strong>{u.name ?? 'Profile incomplete'}</strong>
          <span className="muted small">{u.email ?? '—'}</span>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (u) => formatPhone(u.phone) },
    {
      key: 'roles',
      header: 'Roles',
      render: (u) => (u.roles.length ? <div className="badges">{u.roles.map((r) => <Badge key={r} value={r} />)}</div> : '—'),
    },
    { key: 'account_status', header: 'Status', render: (u) => <Badge value={u.account_status} /> },
    { key: 'created_at', header: 'Joined', render: (u) => formatDate(u.created_at) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) =>
        canModerate(u) ? (
          u.account_status === 'ACTIVE' ? (
            <Button size="sm" variant="danger" loading={busyId === u.id} onClick={() => changeStatus(u, 'SUSPENDED')}>
              Suspend
            </Button>
          ) : (
            <Button size="sm" variant="success" loading={busyId === u.id} onClick={() => changeStatus(u, 'ACTIVE')}>
              Reactivate
            </Button>
          )
        ) : null,
    },
  ]

  return (
    <>
      <PageHeader title="Users" subtitle="Customers, drivers and administrators" />
      <div className="filters">
        <Input
          placeholder="Search name, phone or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <Select options={ROLE_OPTIONS} value={role} onChange={(e) => { setRole(e.target.value); setPage(1) }} />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} />
      </div>
      {error && <Alert>{error}</Alert>}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(u) => u.id}
        loading={loading}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
    </>
  )
}
