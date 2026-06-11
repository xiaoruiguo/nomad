import { useState } from 'react'
import { useNodes, useAllocations } from '@/api/hooks'
import { PageLayout } from '@/components/layout/page-layout'
import { TopoViz } from '@/components/topo-viz/topo-viz'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusDot } from '@/components/ui/status-dot'
import { CopyButton } from '@/components/ui/copy-button'
import { truncateMiddle } from '@/lib/utils'
import type { Allocation } from '@/api/types/allocation'
import type { NodeListStub } from '@/api/types/node'

const allocStatusMap: Record<string, 'running' | 'pending' | 'failed' | 'lost' | 'complete' | 'unknown'> = {
  running: 'running',
  pending: 'pending',
  failed: 'failed',
  lost: 'lost',
  complete: 'complete',
  unknown: 'unknown',
}

export function TopologyPage() {
  const nodesResult = useNodes()
  const allocsResult = useAllocations()

  const nodes = (nodesResult.data as unknown as NodeListStub[] | undefined) ?? []
  const allocations = (allocsResult.data as unknown as Allocation[] | undefined) ?? []

  const [selectedAllocId] = useState<string | null>(null)
  const selectedAlloc = allocations.find((a) => a.ID === selectedAllocId)

  const isLoading = nodesResult.isLoading || allocsResult.isLoading

  return (
    <PageLayout title="Topology" subtitle="Visual overview of cluster nodes and allocations">
      <div className="flex items-center gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-success-500" />
          Ready
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning-500" />
          Initializing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-danger-500" />
          Down
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-neutral-400" />
          Maintenance
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : nodes.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          }
          title="No topology data"
          description="No nodes are available to display topology."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopoViz nodes={nodes} allocations={allocations} />
          </div>

          <div>
            {selectedAlloc ? (
              <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Allocation Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Name</dt>
                    <dd className="font-medium">{selectedAlloc.Name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Status</dt>
                    <dd>
                      <StatusDot
                        status={allocStatusMap[selectedAlloc.ClientStatus] ?? 'unknown'}
                        label={selectedAlloc.ClientStatus}
                        size="sm"
                      />
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Job</dt>
                    <dd>
                      <a href={`/jobs/${selectedAlloc.JobID}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                        {selectedAlloc.JobID}
                      </a>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Task Group</dt>
                    <dd>{selectedAlloc.TaskGroup}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Node</dt>
                    <dd>{selectedAlloc.NodeName || truncateMiddle(selectedAlloc.NodeID, 10)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">ID</dt>
                    <dd className="inline-flex items-center gap-1.5">
                      <span className="font-mono text-xs">{truncateMiddle(selectedAlloc.ID, 12)}</span>
                      <CopyButton text={selectedAlloc.ID} label="" />
                    </dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <a
                    href={`/allocations/${selectedAlloc.ID}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    View allocation →
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <p className="text-sm text-neutral-500">Click an allocation in the topology to see details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  )
}
