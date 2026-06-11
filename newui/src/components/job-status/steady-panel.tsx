import { useState } from 'react'
import type { Job, JobSummary, Allocation, Deployment, Node } from '@/api/types'
import type { NodeListStub } from '@/api/types/node'
import type { AllocBlockMap } from './panel'
import { AllocationStatusRow } from './allocation-status-row'
import { FailedOrLost } from './failed-or-lost'
import { LatestDeployment } from './latest-deployment'
import { DeploymentHistory } from './deployment-history'
import { cn } from '@/lib/utils'

type SteadyStatus =
  | 'Stopped'
  | 'ScaledDown'
  | 'Complete'
  | 'Running'
  | 'Healthy'
  | 'Recovering'
  | 'Failed'
  | 'Degraded'

const STATUS_BADGE: Record<SteadyStatus, string> = {
  Stopped: 'bg-gray-100 text-gray-800',
  ScaledDown: 'bg-yellow-100 text-yellow-800',
  Complete: 'bg-blue-100 text-blue-800',
  Running: 'bg-green-100 text-green-800',
  Healthy: 'bg-green-200 text-green-900',
  Recovering: 'bg-amber-100 text-amber-800',
  Failed: 'bg-red-100 text-red-800',
  Degraded: 'bg-orange-100 text-orange-800',
}

function computeSteadyStatus(
  job: Job,
  summary: JobSummary,
  allocations: Allocation[]
): SteadyStatus {
  if (job.Stop) return 'Stopped'

  const tgSummary = summary?.Summary ?? {}
  const hasRunning = allocations.some((a) => a.ClientStatus?.toLowerCase() === 'running')
  const hasFailed = allocations.some((a) => a.ClientStatus?.toLowerCase() === 'failed')
  const hasPending = allocations.some((a) => a.ClientStatus?.toLowerCase() === 'pending')
  const allComplete = allocations.length > 0 && allocations.every((a) => a.ClientStatus?.toLowerCase() === 'complete')

  if (allComplete) return 'Complete'

  const totalDesired = Object.values(tgSummary).reduce((sum, s) => sum + (s.Running ?? 0) + (s.Queued ?? 0) + (s.Starting ?? 0), 0)

  if (totalDesired === 0 && !hasRunning) return 'ScaledDown'
  if (hasFailed && hasRunning) return 'Degraded'
  if (hasFailed) return 'Failed'
  if (hasPending) return 'Recovering'
  if (hasRunning && !hasFailed && !hasPending) return 'Healthy'
  if (hasRunning) return 'Running'

  return 'Running'
}

interface SteadyPanelProps {
  job: Job
  summary: JobSummary
  allocBlocks: Map<string, AllocBlockMap>
  allocations: Allocation[]
  deployments: Deployment[]
  nodes: (Node | NodeListStub)[]
  selectedAllocId?: string
  onSelectAllocation?: (alloc: Allocation) => void
}

export function SteadyPanel({
  job,
  summary,
  allocBlocks,
  allocations,
  deployments,
  nodes: _nodes,
  selectedAllocId,
  onSelectAllocation,
}: SteadyPanelProps) {
  const [mode, setMode] = useState<'current' | 'historical'>('current')

  const status = computeSteadyStatus(job, summary, allocations)
  const latestDeployment = deployments.length > 0
    ? deployments.reduce((a, b) => (a.JobModifyIndex > b.JobModifyIndex ? a : b))
    : null
  const historicalDeployments = deployments.filter((d) => d.ID !== latestDeployment?.ID)

  const filteredAllocations = mode === 'current'
    ? allocations.filter((a) => a.JobVersion === job.Version)
    : allocations

  const failedAllocs = filteredAllocations.filter(
    (a) => a.ClientStatus?.toLowerCase() === 'failed' || a.ClientStatus?.toLowerCase() === 'lost'
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium',
              STATUS_BADGE[status]
            )}
          >
            {status}
          </span>
          {job.StatusDescription && (
            <span className="text-sm text-gray-500">{job.StatusDescription}</span>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
          <button
            type="button"
            onClick={() => setMode('current')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              mode === 'current' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Current
          </button>
          <button
            type="button"
            onClick={() => setMode('historical')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              mode === 'historical' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Historical
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {Array.from(allocBlocks.entries()).map(([taskGroup, blocks]) => {
          const tgSummary = summary?.Summary?.[taskGroup]
          return (
            <div key={taskGroup} className="rounded-md border border-gray-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-800">{taskGroup}</h4>
                {tgSummary && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {tgSummary.Running > 0 && <span className="text-green-600">{tgSummary.Running} running</span>}
                    {tgSummary.Starting > 0 && <span className="text-yellow-600">{tgSummary.Starting} starting</span>}
                    {tgSummary.Queued > 0 && <span className="text-yellow-500">{tgSummary.Queued} queued</span>}
                    {tgSummary.Complete > 0 && <span className="text-blue-600">{tgSummary.Complete} complete</span>}
                    {tgSummary.Failed > 0 && <span className="text-red-600">{tgSummary.Failed} failed</span>}
                    {tgSummary.Lost > 0 && <span className="text-red-500">{tgSummary.Lost} lost</span>}
                  </div>
                )}
              </div>
              <AllocationStatusRow
                allocBlock={blocks}
                showSummaries={false}
                width={600}
                onSelectAllocation={onSelectAllocation}
                selectedAllocId={selectedAllocId}
              />
            </div>
          )
        })}
      </div>

      <FailedOrLost allocations={failedAllocs} />

      {latestDeployment && <LatestDeployment deployment={latestDeployment} />}

      {historicalDeployments.length > 0 && (
        <DeploymentHistory deployments={historicalDeployments} />
      )}
    </div>
  )
}
