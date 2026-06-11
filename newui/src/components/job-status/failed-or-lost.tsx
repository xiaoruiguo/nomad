import { useState } from 'react'
import type { Allocation } from '@/api/types'
import { cn } from '@/lib/utils'

interface FailedOrLostProps {
  allocations: Allocation[]
}

function isFailedOrLost(alloc: Allocation): boolean {
  const cs = alloc.ClientStatus?.toLowerCase()
  return cs === 'failed' || cs === 'lost' || (alloc.RescheduleTracker?.Events?.length ?? 0) > 0
}

export function FailedOrLost({ allocations }: FailedOrLostProps) {
  const failed = allocations.filter(isFailedOrLost)
  const [expanded, setExpanded] = useState(false)

  if (failed.length === 0) return null

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-red-800"
      >
        <span>{failed.length} Failed / Lost Allocation{failed.length !== 1 ? 's' : ''}</span>
        <svg
          className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <ul className="mt-2 space-y-1">
          {failed.map((alloc) => (
            <li key={alloc.ID} className="flex items-center gap-2 text-xs text-red-700">
              <span className="font-mono">{alloc.Name}</span>
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-600">{alloc.ClientStatus}</span>
              {alloc.DesiredDescription && (
                <span className="text-red-500">{alloc.DesiredDescription}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
