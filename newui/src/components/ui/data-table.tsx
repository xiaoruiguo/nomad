import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  selectedRowId?: string | null
  emptyMessage?: string
  loading?: boolean
  rowIdKey?: string
}

type SortDirection = 'asc' | 'desc' | null

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  selectedRowId,
  emptyMessage = 'No data available',
  loading = false,
  rowIdKey = 'ID',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        if (sortDirection === 'asc') {
          setSortDirection('desc')
        } else if (sortDirection === 'desc') {
          setSortKey(null)
          setSortDirection(null)
        }
      } else {
        setSortKey(key)
        setSortDirection('asc')
      }
    },
    [sortKey, sortDirection]
  )

  const asRecord = (row: T): Record<string, unknown> => row as Record<string, unknown>

  const sortedData = (() => {
    if (!sortKey || !sortDirection) return data
    return [...data].sort((a, b) => {
      const aVal = asRecord(a)[sortKey]
      const bVal = asRecord(b)[sortKey]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortDirection === 'asc' ? cmp : -cmp
    })
  })()

  const getRowId = (row: T): string => {
    const id = asRecord(row)[rowIdKey]
    return id != null ? String(id) : ''
  }

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="px-4 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {emptyMessage}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400',
                    col.sortable && 'cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-200'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-primary-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                    {col.sortable && sortKey !== col.key && (
                      <span className="text-neutral-300 dark:text-neutral-600">↕</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const rowId = getRowId(row)
              const isSelected = selectedRowId != null && rowId === selectedRowId
              return (
                <tr
                  key={rowId || Math.random()}
                  className={cn(
                    'border-b border-neutral-100 last:border-0 transition-colors dark:border-neutral-800',
                    onRowClick && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                    isSelected && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      {col.render ? col.render(row) : (asRecord(row)[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
