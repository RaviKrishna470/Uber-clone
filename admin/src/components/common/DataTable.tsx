import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  width?: number | string
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  emptyText?: string
  /** Server-side pagination */
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
}

export function DataTable<T extends object>({
  columns,
  rows,
  rowKey,
  loading,
  emptyText = 'No records found',
  page,
  pageSize,
  total,
  onPageChange,
}: Props<T>) {
  const paginated = page !== undefined && pageSize !== undefined && total !== undefined && onPageChange
  const pages = paginated ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const from = paginated && total > 0 ? (page - 1) * pageSize + 1 : 0
  const to = paginated ? Math.min(total, page * pageSize) : rows.length

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ textAlign: c.align ?? 'left', width: c.width }}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={loading ? 'is-loading' : undefined}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty">
                  {loading ? 'Loading…' : emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((c) => (
                    <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {paginated && (
        <div className="table-footer">
          <span className="muted">
            {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
          </span>
          <div className="pager">
            <button className="btn btn-ghost btn-sm" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>
              Previous
            </button>
            <span className="muted">
              Page {page} of {pages}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={page >= pages || loading} onClick={() => onPageChange(page + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
