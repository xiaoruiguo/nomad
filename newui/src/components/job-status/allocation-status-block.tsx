import type { Allocation } from '@/api/types'
import { cn } from '@/lib/utils'

interface AllocationStatusBlockProps {
  allocs: Allocation[]
  status: string
  width: number
}

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-green-500',
  complete: 'bg-blue-500',
  pending: 'bg-yellow-500',
  failed: 'bg-red-500',
  lost: 'bg-red-400',
  unknown: 'bg-gray-400',
}

export function AllocationStatusBlock({ allocs, status, width }: AllocationStatusBlockProps) {
  const color = STATUS_COLORS[status.toLowerCase()] ?? 'bg-gray-400'
  const maxVisible = Math.max(1, Math.floor(width / 8))
  const visible = allocs.slice(0, maxVisible)
  const overflow = allocs.length - visible.length

  return (
    <div className="flex items-center gap-0.5" title={`${allocs.length} ${status}`}>
      {visible.map((alloc) => (
        <span
          key={alloc.ID}
          className={cn('inline-block h-4 w-1.5 rounded-sm', color)}
        />
      ))}
      {overflow > 0 && (
        <span className="ml-0.5 text-xs text-gray-500">+{overflow}</span>
      )}
    </div>
  )
}
