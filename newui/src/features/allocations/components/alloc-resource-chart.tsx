import { GaugeChart } from '@/components/charts/gauge-chart'
import type { AllocStats } from '@/api/types/allocation'

interface AllocResourceChartProps {
  stats: AllocStats
}

export function AllocResourceChart({ stats }: AllocResourceChartProps) {
  const cpu = stats.ResourceUsage?.Cpu
  const memory = stats.ResourceUsage?.Memory

  const cpuPercent = cpu?.Percent ?? 0
  const memoryUsage = memory?.Usage ?? 0
  const memoryMax = memory?.MaxUsage ?? memory?.RSS ?? 0

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Resource Usage</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <GaugeChart
            value={cpuPercent}
            max={100}
            label="CPU %"
            color={cpuPercent > 80 ? '#ef4444' : cpuPercent > 60 ? '#f59e0b' : '#3b82f6'}
            size={120}
          />
          <div className="mt-2 text-center text-xs text-neutral-500">
            <div>User: <span className="font-medium text-neutral-700 dark:text-neutral-300">{cpu?.UserMode?.toFixed(1) ?? 0}%</span></div>
            <div>System: <span className="font-medium text-neutral-700 dark:text-neutral-300">{cpu?.SystemMode?.toFixed(1) ?? 0}%</span></div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <GaugeChart
            value={Math.round(memoryUsage / (1024 * 1024))}
            max={Math.round(memoryMax / (1024 * 1024)) || 1}
            label="Memory (MB)"
            color={memoryUsage / (memoryMax || 1) > 0.8 ? '#ef4444' : memoryUsage / (memoryMax || 1) > 0.6 ? '#f59e0b' : '#8b5cf6'}
            size={120}
          />
          <div className="mt-2 text-center text-xs text-neutral-500">
            <div>RSS: <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatMB(memory?.RSS)}</span></div>
            <div>Cache: <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatMB(memory?.Cache)}</span></div>
          </div>
        </div>
      </div>

      {stats.Tasks && Object.keys(stats.Tasks).length > 0 && (
        <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Per-Task Usage</h4>
          <div className="space-y-3">
            {Object.entries(stats.Tasks).map(([taskName, taskStats]) => (
              <div key={taskName} className="flex items-center justify-between text-sm">
                <span className="font-medium">{taskName}</span>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>CPU: {taskStats.Cpu?.Percent?.toFixed(1) ?? 0}%</span>
                  <span>Mem: {formatMB(taskStats.Memory?.RSS)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatMB(bytes: number | undefined): string {
  if (!bytes) return '0 MB'
  return `${Math.round(bytes / (1024 * 1024))} MB`
}
