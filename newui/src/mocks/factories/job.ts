import type {
  JobListStub,
  Job,
  TaskGroup,
  Task,
  JobSummary,
  TaskGroupSummary,
  UpdateStrategy,
  RestartPolicy,
  ReschedulePolicy,
  EphemeralDisk,
  Resource,
  LogConfig,
} from '@/api/types/job'

let counter = 0

function randomId(): string {
  counter++
  const hex = counter.toString(16).padStart(8, '0')
  const rand = Math.random().toString(16).slice(2, 10)
  return `${hex}-${rand}-${rand.slice(0, 4)}-${rand.slice(0, 4)}`
}

function randomName(prefix: string): string {
  const parts = ['web', 'api', 'worker', 'cache', 'db', 'frontend', 'backend', 'proxy', 'monitor', 'scheduler']
  const part = parts[Math.floor(Math.random() * parts.length)]
  const num = Math.floor(Math.random() * 100)
  return `${prefix}-${part}-${num}`
}

export function createTaskGroupSummary(overrides?: Partial<TaskGroupSummary>): TaskGroupSummary {
  return {
    Queued: 0,
    Complete: 0,
    Failed: 0,
    Running: 1,
    Starting: 0,
    Lost: 0,
    Unknown: 0,
    ...overrides,
  }
}

export function createJobSummary(overrides?: Partial<JobSummary>): JobSummary {
  return {
    JobID: 'example',
    Namespace: 'default',
    Summary: {
      web: createTaskGroupSummary(),
    },
    ...overrides,
  }
}

export function createUpdateStrategy(overrides?: Partial<UpdateStrategy>): UpdateStrategy {
  return {
    Stagger: 30000000000,
    MaxParallel: 1,
    HealthCheck: 'checks',
    MinHealthyTime: 10000000000,
    HealthyDeadline: 300000000000,
    ProgressDeadline: 600000000000,
    AutoRevert: false,
    AutoPromote: false,
    Canary: 0,
    ...overrides,
  }
}

export function createRestartPolicy(overrides?: Partial<RestartPolicy>): RestartPolicy {
  return {
    Interval: 300000000000,
    Attempts: 3,
    Delay: 15000000000,
    Mode: 'fail',
    ...overrides,
  }
}

export function createReschedulePolicy(overrides?: Partial<ReschedulePolicy>): ReschedulePolicy {
  return {
    Interval: 300000000000,
    Attempts: 3,
    Delay: 30000000000,
    DelayFunction: 'exponential',
    MaxDelay: 3600000000000,
    Unlimited: false,
    ...overrides,
  }
}

export function createEphemeralDisk(overrides?: Partial<EphemeralDisk>): EphemeralDisk {
  return {
    Sticky: false,
    SizeMB: 300,
    Migrate: false,
    ...overrides,
  }
}

export function createResource(overrides?: Partial<Resource>): Resource {
  return {
    CPU: 500,
    MemoryMB: 256,
    DiskMB: 300,
    IOPS: 0,
    Networks: [],
    Devices: [],
    ...overrides,
  }
}

export function createLogConfig(overrides?: Partial<LogConfig>): LogConfig {
  return {
    MaxFiles: 10,
    MaxFileSizeMB: 10,
    ...overrides,
  }
}

export function createTask(overrides?: Partial<Task>): Task {
  return {
    Name: 'web',
    Driver: 'docker',
    Config: {
      image: 'nginx:latest',
      ports: ['http'],
    },
    Constraints: [],
    Affinities: [],
    Resources: createResource(),
    Services: [],
    Templates: [],
    Artifacts: [],
    Env: {},
    Vault: {
      Policies: [],
      Namespace: '',
      Role: '',
      Env: true,
      ChangeMode: 'restart',
      ChangeSignal: '',
      DisableFileCerts: false,
    },
    Dispatch: false,
    Lifecycle: {
      Hook: '',
      Sidecar: false,
    },
    KillSignal: '',
    KillTimeout: 5000000000,
    LogConfig: createLogConfig(),
    Meta: {},
    Kind: '',
    ShutdownDelay: 0,
    VolumeMounts: [],
    CSIPluginConfig: {
      ID: '',
      Type: '',
      MountDir: '',
      StagePublishAuth: '',
      HealthTimeout: 0,
    },
    DispatchPayload: {
      File: '',
    },
    Identity: [],
    User: '',
    ...overrides,
  }
}

export function createTaskGroup(overrides?: Partial<TaskGroup>): TaskGroup {
  const name = overrides?.Name ?? 'web'
  return {
    Name: name,
    Count: 1,
    Tasks: [createTask({ Name: name })],
    Constraints: [],
    Affinities: [],
    Spreads: [],
    RestartPolicy: createRestartPolicy(),
    ReschedulePolicy: createReschedulePolicy(),
    EphemeralDisk: createEphemeralDisk(),
    Update: createUpdateStrategy(),
    Migrate: {
      MaxParallel: 1,
      HealthCheck: '',
      MinHealthyTime: 0,
      HealthyDeadline: 0,
    },
    Meta: {},
    Volumes: {},
    Networks: [],
    Services: [],
    ShutdownDelay: 0,
    StopAfterClientDisconnect: 0,
    MaxClientDisconnect: 0,
    ConsistentReads: false,
    ...overrides,
  }
}

export function createJob(overrides?: Partial<JobListStub>): JobListStub {
  const id = overrides?.ID ?? randomId()
  const name = overrides?.Name ?? randomName('job')
  return {
    ID: id,
    ParentID: '',
    Name: name,
    Namespace: 'default',
    Datacenters: ['dc1'],
    NodePool: 'default',
    Type: 'service',
    Priority: 50,
    Periodic: false,
    ParameterizedJob: false,
    Stop: false,
    Status: 'running',
    StatusDescription: '',
    JobSummary: createJobSummary({ JobID: id }),
    CreateIndex: 1,
    ModifyIndex: 1,
    JobModifyIndex: 1,
    SubmitTime: Date.now() * 1000000,
    Meta: {},
    ...overrides,
  }
}

export function createFullJob(overrides?: Partial<Job>): Job {
  const id = overrides?.ID ?? randomId()
  const name = overrides?.Name ?? randomName('job')
  return {
    ID: id,
    ParentID: '',
    Name: name,
    Namespace: 'default',
    Datacenters: ['dc1'],
    NodePool: 'default',
    Type: 'service',
    Priority: 50,
    AllAtOnce: false,
    Stop: false,
    Status: 'running',
    StatusDescription: '',
    JobSummary: createJobSummary({ JobID: id }),
    CreateIndex: 1,
    ModifyIndex: 1,
    JobModifyIndex: 1,
    SubmitTime: Date.now() * 1000000,
    TaskGroups: [createTaskGroup()],
    Constraints: [],
    Affinities: [],
    Spreads: [],
    Periodic: {
      Enabled: false,
      Spec: '',
      SpecType: '',
      ProhibitOverlap: false,
      TimeZone: '',
    },
    ParameterizedJob: {
      Payload: '',
      MetaRequired: [],
      MetaOptional: [],
    },
    Meta: {},
    Update: createUpdateStrategy(),
    Migrate: {
      MaxParallel: 1,
      HealthCheck: '',
      MinHealthyTime: 0,
      HealthyDeadline: 0,
    },
    Payload: '',
    ConsulNamespace: 'default',
    VaultNamespace: 'default',
    NomadTokenID: '',
    Stable: true,
    Version: 1,
    ...overrides,
  }
}
