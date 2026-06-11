import type { Job, Allocation, Deployment } from '@/api/types'
import type { AllocBlockMap } from './panel'
import { AllocationStatusRow } from './allocation-status-row'
import { FailedOrLost } from './failed-or-lost'
import { DeploymentHistory } from './deployment-history'
import { UpdateParams } from './update-params'

interface DeployingPanelProps {
  job: Job
  allocBlocks: Map<string, AllocBlockMap>
  previousBlocks: Map<string, AllocBlockMap>
  deployment: Deployment
  allocations: Allocation[]
  selectedAllocId?: string
  onSelectAllocation?: (alloc: Allocation) => void
}

export function DeployingPanel({
  job,
  allocBlocks,
  previousBlocks,
  deployment,
  allocations,
  selectedAllocId,
  onSelectAllocation,
}: DeployingPanelProps) {
  const hasCanaries = Object.values(deployment.TaskGroups).some(
    (tg) => (tg.CanaryAllocationIDs?.length ?? 0) > 0
  )
  const requiresPromotion = deployment.RequiresExplicitPromotion

  const historicalDeployments: Deployment[] = []

  const failedAllocs = allocations.filter(
    (a) => a.ClientStatus?.toLowerCase() === 'failed' || a.ClientStatus?.toLowerCase() === 'lost'
  )

  const taskGroupNames = job.TaskGroups?.map((tg) => tg.Name) ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          Deploying
        </span>
        {deployment.StatusDescription && (
          <span className="text-sm text-gray-500">{deployment.StatusDescription}</span>
        )}
      </div>

      {hasCanaries && requiresPromotion && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-amber-800">
              Canary deployment requires explicit promotion
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {taskGroupNames.map((tgName) => {
          const prevBlocks = previousBlocks.get(tgName) ?? new Map()
          const newBlocks = allocBlocks.get(tgName) ?? new Map()
          const tgDeployment = deployment.TaskGroups?.[tgName]

          return (
            <div key={tgName} className="rounded-md border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-800">{tgName}</h4>
                {tgDeployment && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{tgDeployment.HealthyAllocs} healthy</span>
                    <span>{tgDeployment.UnhealthyAllocs} unhealthy</span>
                    {tgDeployment.DesiredCanaries > 0 && (
                      <span>{tgDeployment.DesiredCanaries} canaries</span>
                    )}
                  </div>
                )}
              </div>

              {prevBlocks.size > 0 && (
                <div>
                  <span className="mb-1 block text-xs font-medium text-gray-500">Previous Allocations</span>
                  <AllocationStatusRow
                    allocBlock={prevBlocks}
                    showSummaries={false}
                    width={600}
                    onSelectAllocation={onSelectAllocation}
                    selectedAllocId={selectedAllocId}
                  />
                </div>
              )}

              {newBlocks.size > 0 && (
                <div>
                  <span className="mb-1 block text-xs font-medium text-gray-500">New Allocations</span>
                  <AllocationStatusRow
                    allocBlock={newBlocks}
                    showSummaries={false}
                    width={600}
                    onSelectAllocation={onSelectAllocation}
                    selectedAllocId={selectedAllocId}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-3">
        <h4 className="mb-2 text-sm font-medium text-gray-700">Legend</h4>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Status:</span>
            <span className="inline-block h-3 w-3 rounded-sm bg-green-500" /> Running
            <span className="inline-block h-3 w-3 rounded-sm bg-yellow-500" /> Pending
            <span className="inline-block h-3 w-3 rounded-sm bg-red-500" /> Failed
            <span className="inline-block h-3 w-3 rounded-sm bg-blue-500" /> Complete
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Health:</span>
            <span className="inline-block h-3 w-3 rounded-sm bg-gray-400 ring-2 ring-green-400" /> Healthy
            <span className="inline-block h-3 w-3 rounded-sm bg-gray-400 ring-2 ring-red-400" /> Unhealthy
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Canary:</span>
            <span className="inline-block h-3 w-3 rounded-sm bg-gray-400 ring-2 ring-amber-400" /> Canary
          </div>
        </div>
      </div>

      <FailedOrLost allocations={failedAllocs} />

      {historicalDeployments.length > 0 && (
        <DeploymentHistory deployments={historicalDeployments} />
      )}

      {job.Update && <UpdateParams update={job.Update} />}
    </div>
  )
}
