import type { AllocListStub, Allocation, TaskState, TaskStateEvent, AllocatedResources, AllocCpuResource, AllocMemoryResource, AllocDeployStatus } from '@/api/types/allocation'

let counter = 0

function randomId(): string {
  counter++
  const hex = counter.toString(16).padStart(8, '0')
  const rand = Math.random().toString(16).slice(2, 10)
  return `${hex}-${rand}-${rand.slice(0, 4)}-${rand.slice(0, 4)}`
}

export function createTaskStateEvent(overrides?: Partial<TaskStateEvent>): TaskStateEvent {
  return {
    Type: 'Started',
    Time: Date.now() * 1000000,
    Message: 'Task started by client',
    DisplayMessage: 'Task started by client',
    SetupError: '',
    DriverError: '',
    DownloadError: '',
    ValidationError: '',
    KillError: '',
    ExitCode: 0,
    Signal: 0,
    TaskSignal: '',
    KillTimeout: 0,
    DownloadProgress: 0,
    FailsTask: false,
    RestartReason: '',
    SetupReason: '',
    DriverMessage: '',
    ...overrides,
  }
}

export function createTaskState(overrides?: Partial<TaskState>): TaskState {
  return {
    State: 'running',
    Failed: false,
    StartedAt: new Date().toISOString(),
    FinishedAt: '',
    Events: [createTaskStateEvent()],
    Restarts: 0,
    LastRestart: '',
    Healthy: '',
    ...overrides,
  }
}

export function createAllocCpuResource(overrides?: Partial<AllocCpuResource>): AllocCpuResource {
  return {
    CpuShares: 500,
    CpuCores: 0,
    ...overrides,
  }
}

export function createAllocMemoryResource(overrides?: Partial<AllocMemoryResource>): AllocMemoryResource {
  return {
    MemoryMB: 256,
    MemoryOversubscribedMB: 0,
    ...overrides,
  }
}

export function createAllocatedResources(overrides?: Partial<AllocatedResources>): AllocatedResources {
  return {
    Cpu: createAllocCpuResource(),
    Memory: createAllocMemoryResource(),
    Disk: { DiskMB: 300 },
    Networks: [],
    IOPS: 0,
    Tasks: {},
    ...overrides,
  }
}

export function createAllocDeployStatus(overrides?: Partial<AllocDeployStatus>): AllocDeployStatus {
  return {
    Healthy: '',
    Canary: false,
    Timestamp: new Date().toISOString(),
    ...overrides,
  }
}

export function createAllocation(overrides?: Partial<AllocListStub>): AllocListStub {
  const id = overrides?.ID ?? randomId()
  return {
    ID: id,
    EvalID: randomId(),
    Name: 'example.web[0]',
    Namespace: 'default',
    NodeID: randomId(),
    NodeName: 'nomad-1',
    JobID: 'example',
    JobType: 'service',
    JobVersion: 1,
    TaskGroup: 'web',
    AllocatedResources: createAllocatedResources(),
    DesiredStatus: 'run',
    DesiredDescription: '',
    ClientStatus: 'running',
    ClientDescription: '',
    TaskStates: {
      web: createTaskState(),
    },
    DeploymentStatus: createAllocDeployStatus(),
    FollowupEvalID: '',
    NextAllocation: '',
    RescheduleTracker: { Events: [] },
    PreemptedAllocations: [],
    PreemptedByAllocation: '',
    CreateIndex: 1,
    ModifyIndex: 1,
    CreateTime: Date.now() * 1000000,
    ModifyTime: Date.now() * 1000000,
    ...overrides,
  }
}

export function createFullAllocation(overrides?: Partial<Allocation>): Allocation {
  const id = overrides?.ID ?? randomId()
  return {
    ID: id,
    EvalID: randomId(),
    Name: 'example.web[0]',
    Namespace: 'default',
    NodeID: randomId(),
    NodeName: 'nomad-1',
    JobID: 'example',
    JobType: 'service',
    JobVersion: 1,
    TaskGroup: 'web',
    AllocatedResources: createAllocatedResources(),
    DesiredStatus: 'run',
    DesiredDescription: '',
    ClientStatus: 'running',
    ClientDescription: '',
    TaskStates: {
      web: createTaskState(),
    },
    DeploymentStatus: createAllocDeployStatus(),
    FollowupEvalID: '',
    NextAllocation: '',
    RescheduleTracker: { Events: [] },
    PreemptedAllocations: [],
    PreemptedByAllocation: '',
    CreateIndex: 1,
    ModifyIndex: 1,
    CreateTime: Date.now() * 1000000,
    ModifyTime: Date.now() * 1000000,
    Resources: {
      Cpu: createAllocCpuResource(),
      Memory: createAllocMemoryResource(),
      Disk: { DiskMB: 300 },
      Networks: [],
      IOPS: 0,
    },
    SharedResources: {
      Cpu: createAllocCpuResource(),
      Memory: createAllocMemoryResource(),
      Disk: { DiskMB: 300 },
      Networks: [],
      IOPS: 0,
    },
    TaskResources: {},
    Metrics: null,
    ...overrides,
  }
}
