import type { Deployment } from '@/api/types'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'

interface DeploymentHistoryProps {
  deployments: Deployment[]
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  running: 'bg-blue-100 text-blue-800',
  successful: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  paused: 'bg-yellow-100 text-yellow-800',
}

export function DeploymentHistory({ deployments }: DeploymentHistoryProps) {
  if (deployments.length === 0) return null

  const sorted = [...deployments].sort((a, b) => b.CreateTime - a.CreateTime)

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Deployment History</h4>
      <div className="space-y-1">
        {sorted.map((dep) => (
          <div
            key={dep.ID}
            className="flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
          >
            <span className="font-mono text-xs text-gray-500">v{dep.JobVersion}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                STATUS_BADGE_COLORS[dep.Status?.toLowerCase()] ?? 'bg-gray-100 text-gray-800'
              )}
            >
              {dep.Status}
            </span>
            <span className="text-xs text-gray-500 truncate flex-1">
              {dep.StatusDescription}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {dep.CreateTime ? formatTime(new Date(dep.CreateTime / 1_000_000).toISOString()) : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
