import { useState } from 'react'
import type { Job, JobSummary, Allocation, Deployment, Evaluation, Node } from '@/api/types'
import type { NodeListStub } from '@/api/types/node'
import { SteadyPanel } from './steady-panel'
import { DeployingPanel } from './deploying-panel'

export type AllocBlockMap = Map<string, Allocation[]>

export function buildAllocationBlocks(
  allocations: Allocation[],
  taskGroup: string
): AllocBlockMap {
  const blocks = new Map<string, Allocation[]>()
  for (const alloc of allocations) {
    if (alloc.TaskGroup !== taskGroup) continue
    const status = alloc.ClientStatus ?? 'unknown'
    const existing = blocks.get(status) ?? []
    existing.push(alloc)
    blocks.set(status, existing)
  }
  return blocks
}

export function buildSteadyBlocks(
  allocations: Allocation[],
  taskGroups: string[]
): Map<string, AllocBlockMap> {
  const result = new Map<string, AllocBlockMap>()
  for (const tg of taskGroups) {
    result.set(tg, buildAllocationBlocks(allocations, tg))
  }
  return result
}

export function buildDeployingBlocks(
  allocations: Allocation[],
  deployment: Deployment,
  taskGroups: string[]
): {
  previous: Map<string, AllocBlockMap>
  newAllocs: Map<string, AllocBlockMap>
} {
  const previous = new Map<string, AllocBlockMap>()
  const newAllocs = new Map<string, AllocBlockMap>()

  const canaryIds = new Set<string>()
  for (const tgState of Object.values(deployment.TaskGroups)) {
    for (const canaryId of tgState.CanaryAllocationIDs ?? []) {
      canaryIds.add(canaryId)
    }
  }

  for (const tg of taskGroups) {
    const prevBlocks = new Map<string, Allocation[]>()
    const newBlocks = new Map<string, Allocation[]>()

    for (const alloc of allocations) {
      if (alloc.TaskGroup !== tg) continue
      const status = alloc.ClientStatus ?? 'unknown'
      const isPrevious = alloc.JobVersion < deployment.JobVersion && !canaryIds.has(alloc.ID)
      const target = isPrevious ? prevBlocks : newBlocks
      const existing = target.get(status) ?? []
      existing.push(alloc)
      target.set(status, existing)
    }

    previous.set(tg, prevBlocks)
    newAllocs.set(tg, newBlocks)
  }

  return { previous, newAllocs }
}

interface JobStatusPanelProps {
  job: Job
  summary: JobSummary
  allocations: Allocation[]
  deployments: Deployment[]
  evaluations: Evaluation[]
  nodes: (Node | NodeListStub)[]
}

export function JobStatusPanel({
  job,
  summary,
  allocations,
  deployments,
  evaluations: _evaluations,
  nodes,
}: JobStatusPanelProps) {
  const [selectedAllocId, setSelectedAllocId] = useState<string | undefined>()

  const latestDeployment = deployments.length > 0
    ? deployments.reduce((a, b) => (a.JobModifyIndex > b.JobModifyIndex ? a : b))
    : null

  const isDeploying = latestDeployment?.Status?.toLowerCase() === 'running'

  const taskGroups = job.TaskGroups?.map((tg) => tg.Name) ?? []

  if (isDeploying && latestDeployment) {
    const { previous, newAllocs } = buildDeployingBlocks(allocations, latestDeployment, taskGroups)
    return (
      <DeployingPanel
        job={job}
        allocBlocks={newAllocs}
        previousBlocks={previous}
        deployment={latestDeployment}
        allocations={allocations}
        selectedAllocId={selectedAllocId}
        onSelectAllocation={(alloc) =>
          setSelectedAllocId((prev) => (prev === alloc.ID ? undefined : alloc.ID))
        }
      />
    )
  }

  const steadyBlocks = buildSteadyBlocks(allocations, taskGroups)

  return (
    <SteadyPanel
      job={job}
      summary={summary}
      allocBlocks={steadyBlocks}
      allocations={allocations}
      deployments={deployments}
      nodes={nodes}
      selectedAllocId={selectedAllocId}
      onSelectAllocation={(alloc) =>
        setSelectedAllocId((prev) => (prev === alloc.ID ? undefined : alloc.ID))
      }
    />
  )
}
