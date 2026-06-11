import { GaugeChart } from '@/components/charts/gauge-chart'
import type { Node } from '@/api/types/node'

interface NodeResourceChartProps {
  node: Node
}

export function NodeResourceChart({ node }: NodeResourceChartProps) {
  const cpu = node.NodeResources?.Cpu
  const memory = node.NodeResources?.Memory
  const reservedCpu = node.ReservedResources?.Cpu
  const reservedMemory = node.ReservedResources?.Memory

  const totalCpu = cpu?.CpuShares ?? 0
  const totalMemory = memory?.MemoryMB ?? 0
  const reservedCpuShares = reservedCpu?.CpuShares ?? 0
  const reservedMemoryMB = reservedMemory?.MemoryMB ?? 0

  const availableCpu = Math.max(0, totalCpu - reservedCpuShares)
  const availableMemory = Math.max(0, totalMemory - reservedMemoryMB)

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Resources</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <GaugeChart
            value={totalCpu - availableCpu}
            max={totalCpu}
            label="CPU"
            color="#3b82f6"
            size={120}
          />
          <div className="mt-2 space-y-1 text-center text-xs text-neutral-500">
            <div>Allocated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{totalCpu - availableCpu}</span></div>
            <div>Reserved: <span className="font-medium text-neutral-700 dark:text-neutral-300">{reservedCpuShares}</span></div>
            <div>Available: <span className="font-medium text-success-600">{availableCpu}</span></div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <GaugeChart
            value={totalMemory - availableMemory}
            max={totalMemory}
            label="Memory (MB)"
            color="#8b5cf6"
            size={120}
          />
          <div className="mt-2 space-y-1 text-center text-xs text-neutral-500">
            <div>Allocated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{totalMemory - availableMemory} MB</span></div>
            <div>Reserved: <span className="font-medium text-neutral-700 dark:text-neutral-300">{reservedMemoryMB} MB</span></div>
            <div>Available: <span className="font-medium text-success-600">{availableMemory} MB</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
