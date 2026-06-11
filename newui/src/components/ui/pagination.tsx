import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  totalItems?: number
  pageSizeOptions?: number[]
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const pages = useMemo(() => {
    const result: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i)
      return result
    }
    result.push(1)
    if (currentPage > 3) result.push('ellipsis')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) result.push(i)
    if (currentPage < totalPages - 2) result.push('ellipsis')
    result.push(totalPages)
    return result
  }, [currentPage, totalPages])

  const startItem = totalItems != null && pageSize ? (currentPage - 1) * pageSize + 1 : undefined
  const endItem = totalItems != null && pageSize ? Math.min(currentPage * pageSize, totalItems) : undefined

  return (
    <div className="flex items-center justify-between gap-4 px-2 py-3">
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        {totalItems != null && (
          <span>
            Showing {startItem}–{endItem} of {totalItems}
          </span>
        )}
        {pageSize && onPageSizeChange && (
          <>
            <span className="text-neutral-300 dark:text-neutral-600">|</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}/page
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          ←
        </Button>
        {pages.map((page, i) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-sm text-neutral-400"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors',
                page === currentPage
                  ? 'bg-primary-500 font-medium text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              )}
            >
              {page}
            </button>
          )
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          →
        </Button>
      </div>
    </div>
  )
}
