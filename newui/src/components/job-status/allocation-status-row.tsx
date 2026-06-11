import type { Allocation } from '@/api/types'
import { IndividualAllocation } from './individual-allocation'
import { AllocationStatusBlock } from './allocation-status-block'

interface AllocationStatusRowProps {
  allocBlock: Map<string, Allocation[]>
  showSummaries: boolean
  width: number
  onSelectAllocation?: (alloc: Allocation) => void
  selectedAllocId?: string
}

export function AllocationStatusRow({
  allocBlock,
  showSummaries,
  width,
  onSelectAllocation,
  selectedAllocId,
}: AllocationStatusRowProps) {
  const totalAllocs = Array.from(allocBlock.values()).reduce((sum, a) => sum + a.length, 0)
  const shouldSummarize = showSummaries || totalAllocs > Math.floor(width / 8)

  if (shouldSummarize) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {Array.from(allocBlock.entries()).map(([status, allocs]) => (
          <AllocationStatusBlock
            key={status}
            allocs={allocs}
            status={status}
            width={width}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {Array.from(allocBlock.entries()).map(([_status, allocs]) =>
        allocs.map((alloc) => (
          <IndividualAllocation
            key={alloc.ID}
            allocation={alloc}
            isCanary={alloc.DeploymentStatus?.Canary ?? false}
            isSelected={alloc.ID === selectedAllocId}
            onClick={onSelectAllocation}
          />
        ))
      )}
    </div>
  )
}
