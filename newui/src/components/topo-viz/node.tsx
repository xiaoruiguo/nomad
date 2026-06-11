import type { Allocation } from '@/api/types'
import type { NodeListStub } from '@/api/types/node'
import type { ScaleLinear } from 'd3-scale'
import { cn } from '@/lib/utils'

interface TopoNodeProps {
  node: NodeListStub
  allocations: Allocation[]
  heightScale: ScaleLinear<number, number>
  selectedAllocId?: string
  onSelectAllocation: (alloc: Allocation) => void
  dense?: boolean
}

const CLIENT_STATUS_COLORS: Record<string, string> = {
  running: '#22c55e',
  complete: '#3b82f6',
  pending: '#eab308',
  failed: '#ef4444',
  lost: '#f87171',
  unknown: '#9ca3af',
}

const NODE_STATUS_BORDER: Record<string, string> = {
  ready: 'border-green-400',
  down: 'border-red-400',
  initializing: 'border-yellow-400',
  ineligible: 'border-gray-300',
  draining: 'border-amber-400',
}

export function TopoNode({
  node,
  allocations,
  heightScale: _heightScale,
  selectedAllocId,
  onSelectAllocation,
  dense = false,
}: TopoNodeProps) {
  const totalCPU = node.NodeResources?.Cpu?.CpuShares ?? 100
  const totalMemory = node.NodeResources?.Memory?.MemoryMB ?? 256

  const cpuAllocs = allocations.map((a) => ({
    alloc: a,
    cpu: a.AllocatedResources?.Cpu?.CpuShares ?? 0,
    mem: a.AllocatedResources?.Memory?.MemoryMB ?? 0,
  }))

  const usedCPU = cpuAllocs.reduce((s, a) => s + a.cpu, 0)
  const usedMemory = cpuAllocs.reduce((s, a) => s + a.mem, 0)

  const cpuPct = totalCPU > 0 ? Math.min((usedCPU / totalCPU) * 100, 100) : 0
  const memPct = totalMemory > 0 ? Math.min((usedMemory / totalMemory) * 100, 100) : 0

  const borderClass = NODE_STATUS_BORDER[node.Status?.toLowerCase()] ?? 'border-gray-300'

  if (dense) {
    const hasSelected = allocations.some((a) => a.ID === selectedAllocId)
    return (
      <div
        className={cn(
          'flex h-6 w-full items-center gap-px rounded-sm border px-0.5',
          borderClass,
          hasSelected && 'ring-2 ring-blue-500'
        )}
        title={`${node.Name} — ${allocations.length} allocs — CPU ${cpuPct.toFixed(0)}% — Mem ${memPct.toFixed(0)}%`}
      >
        {allocations.map((alloc) => {
          const width = totalCPU > 0 ? Math.max((alloc.AllocatedResources?.Cpu?.CpuShares ?? 0) / totalCPU * 100, 4) : 4
          return (
            <button
              key={alloc.ID}
              type="button"
              onClick={() => onSelectAllocation(alloc)}
              className="h-3 rounded-sm"
              style={{
                width: `${width}%`,
                backgroundColor: CLIENT_STATUS_COLORS[alloc.ClientStatus?.toLowerCase()] ?? '#9ca3af',
                opacity: alloc.ID === selectedAllocId ? 1 : 0.8,
              }}
              title={`${alloc.Name} — ${alloc.ClientStatus}`}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-md border bg-gray-50 p-1.5 transition-shadow',
        borderClass,
        allocations.some((a) => a.ID === selectedAllocId) && 'shadow-md shadow-blue-200 ring-1 ring-blue-400'
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="truncate text-xs font-medium text-gray-700" title={node.Name}>
          {node.Name}
        </span>
        <span className="text-[10px] text-gray-400">{allocations.length}</span>
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center gap-1">
          <span className="w-6 text-[9px] text-gray-400">CPU</span>
          <div className="flex h-2 flex-1 overflow-hidden rounded-sm bg-gray-200">
            {allocations.map((alloc) => {
              const pct = totalCPU > 0 ? (alloc.AllocatedResources?.Cpu?.CpuShares ?? 0) / totalCPU * 100 : 0
              return (
                <button
                  key={alloc.ID}
                  type="button"
                  onClick={() => onSelectAllocation(alloc)}
                  className="h-full transition-opacity hover:opacity-80"
                  style={{
                    width: `${Math.max(pct, 1)}%`,
                    backgroundColor: CLIENT_STATUS_COLORS[alloc.ClientStatus?.toLowerCase()] ?? '#9ca3af',
                    opacity: alloc.ID === selectedAllocId ? 1 : 0.75,
                  }}
                  title={`${alloc.Name} — ${alloc.ClientStatus}`}
                />
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-6 text-[9px] text-gray-400">Mem</span>
          <div className="flex h-2 flex-1 overflow-hidden rounded-sm bg-gray-200">
            {allocations.map((alloc) => {
              const pct = totalMemory > 0 ? (alloc.AllocatedResources?.Memory?.MemoryMB ?? 0) / totalMemory * 100 : 0
              return (
                <button
                  key={alloc.ID}
                  type="button"
                  onClick={() => onSelectAllocation(alloc)}
                  className="h-full transition-opacity hover:opacity-80"
                  style={{
                    width: `${Math.max(pct, 1)}%`,
                    backgroundColor: CLIENT_STATUS_COLORS[alloc.ClientStatus?.toLowerCase()] ?? '#9ca3af',
                    opacity: alloc.ID === selectedAllocId ? 1 : 0.75,
                  }}
                  title={`${alloc.Name} — ${alloc.ClientStatus}`}
                />
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-1 flex justify-between text-[9px] text-gray-400">
        <span>CPU {cpuPct.toFixed(0)}%</span>
        <span>Mem {memPct.toFixed(0)}%</span>
      </div>
    </div>
  )
}
