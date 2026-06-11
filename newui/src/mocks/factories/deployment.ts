import type { Deployment, DeploymentState } from '@/api/types/deployment'

let counter = 0

function randomId(): string {
  counter++
  const hex = counter.toString(16).padStart(8, '0')
  const rand = Math.random().toString(16).slice(2, 10)
  return `${hex}-${rand}-${rand.slice(0, 4)}-${rand.slice(0, 4)}`
}

export function createDeploymentState(overrides?: Partial<DeploymentState>): DeploymentState {
  return {
    AutoRevert: false,
    AutoPromote: false,
    CanaryAllocationIDs: [],
    DesiredCanaries: 0,
    DesiredTotal: 1,
    Promoted: false,
    PlacedCanaries: [],
    HealthyAllocs: 1,
    UnhealthyAllocs: 0,
    ...overrides,
  }
}

export function createDeployment(overrides?: Partial<Deployment>): Deployment {
  const id = overrides?.ID ?? randomId()
  return {
    ID: id,
    Namespace: 'default',
    JobID: 'example',
    JobVersion: 1,
    JobModifyIndex: 1,
    JobSpecModifyIndex: 1,
    IsMultiregion: false,
    TaskGroups: {
      web: createDeploymentState(),
    },
    Status: 'running',
    StatusDescription: 'Deployment is running',
    EvalPriority: 50,
    CreateIndex: 1,
    ModifyIndex: 1,
    CreateTime: Date.now() * 1000000,
    ModifyTime: Date.now() * 1000000,
    RequiresExplicitPromotion: false,
    LatestJobVersion: true,
    HasPromotedCanaries: false,
    HasUnhealthyAlloc: false,
    ...overrides,
  }
}
