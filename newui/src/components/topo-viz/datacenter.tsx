import type { Allocation } from '@/api/types'
import type { NodeListStub } from '@/api/types/node'
import type { ScaleLinear } from 'd3-scale'
import { TopoNode } from './node'

interface TopoDatacenterProps {
  name: string
  nodes: NodeListStub[]
  allocations: Allocation[]
  allocsByNode: Map<string, Allocation[]>
  heightScale: ScaleLinear<number, number>
  selectedAllocId?: string
  onSelectAllocation: (alloc: Allocation) => void
}

export function TopoDatacenter({
  name,
  nodes,
  allocations: _allocations,
  allocsByNode,
  heightScale,
  selectedAllocId,
  onSelectAllocation,
}: TopoDatacenterProps) {
  const isDense = nodes.length > 50

  const totalAllocs = nodes.reduce((sum, n) => sum + (allocsByNode.get(n.ID)?.length ?? 0), 0)
  const totalCPU = nodes.reduce(
    (sum, n) => sum + (n.NodeResources?.Cpu?.CpuShares ?? 0),
    0
  )
  const totalMemory = nodes.reduce(
    (sum, n) => sum + (n.NodeResources?.Memory?.MemoryMB ?? 0),
    0
  )

  const height = heightScale(nodes.length)

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">{name}</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {nodes.length} node{nodes.length !== 1 ? 's' : ''}
          </span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
            {totalAllocs} alloc{totalAllocs !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{totalCPU} CPU shares</span>
          <span>{totalMemory.toLocaleString()} MB RAM</span>
        </div>
      </div>
      <div
        className="grid gap-1 p-2"
        style={{
          gridTemplateColumns: isDense ? 'repeat(auto-fill, minmax(40px, 1fr))' : 'repeat(auto-fill, minmax(120px, 1fr))',
          minHeight: height,
        }}
      >
        {nodes.map((node) => (
          <TopoNode
            key={node.ID}
            node={node}
            allocations={allocsByNode.get(node.ID) ?? []}
            heightScale={heightScale}
            selectedAllocId={selectedAllocId}
            onSelectAllocation={onSelectAllocation}
            dense={isDense}
          />
        ))}
      </div>
    </div>
  )
}
