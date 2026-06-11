import type { Allocation } from '@/api/types'
import { cn } from '@/lib/utils'

interface IndividualAllocationProps {
  allocation: Allocation
  isCanary?: boolean
  isSelected?: boolean
  onClick?: (alloc: Allocation) => void
}

const CLIENT_STATUS_COLORS: Record<string, string> = {
  running: 'bg-green-500',
  complete: 'bg-blue-500',
  pending: 'bg-yellow-500',
  failed: 'bg-red-500',
  lost: 'bg-red-400',
  unknown: 'bg-gray-400',
}

const DEPLOY_HEALTH_COLORS: Record<string, string> = {
  healthy: 'ring-green-400',
  unhealthy: 'ring-red-400',
}

export function IndividualAllocation({
  allocation,
  isCanary = false,
  isSelected = false,
  onClick,
}: IndividualAllocationProps) {
  const statusColor = CLIENT_STATUS_COLORS[allocation.ClientStatus?.toLowerCase()] ?? 'bg-gray-400'
  const healthRing = allocation.DeploymentStatus?.Healthy
    ? DEPLOY_HEALTH_COLORS[allocation.DeploymentStatus.Healthy.toLowerCase() === 'true' ? 'healthy' : 'unhealthy'] ?? ''
    : ''

  return (
    <button
      type="button"
      onClick={() => onClick?.(allocation)}
      className={cn(
        'inline-block h-5 w-5 rounded-sm transition-all hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-400',
        statusColor,
        isCanary && 'ring-2 ring-amber-400',
        healthRing && `ring-2 ${healthRing}`,
        isSelected && 'ring-2 ring-blue-500 ring-offset-1'
      )}
      title={`${allocation.Name} — ${allocation.ClientStatus}${isCanary ? ' (canary)' : ''}`}
    />
  )
}
