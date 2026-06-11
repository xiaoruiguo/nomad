import type { NodeListStub, Node, NodeResources, NodeCpuResource, NodeMemoryResource, NodeDiskResource, NodeDriverInfo, DrainSpec, LastDrain } from '@/api/types/node'

let counter = 0

function randomId(): string {
  counter++
  const hex = counter.toString(16).padStart(8, '0')
  const rand = Math.random().toString(16).slice(2, 10)
  return `${hex}-${rand}-${rand.slice(0, 4)}-${rand.slice(0, 4)}`
}

export function createNodeCpuResource(overrides?: Partial<NodeCpuResource>): NodeCpuResource {
  return {
    CpuShares: 4000,
    CpuCores: 4,
    ReservableCpuCores: [],
    ...overrides,
  }
}

export function createNodeMemoryResource(overrides?: Partial<NodeMemoryResource>): NodeMemoryResource {
  return {
    MemoryMB: 8192,
    MemoryOversubscribedMB: 0,
    ...overrides,
  }
}

export function createNodeDiskResource(overrides?: Partial<NodeDiskResource>): NodeDiskResource {
  return {
    DiskMB: 102400,
    ...overrides,
  }
}

export function createNodeResources(overrides?: Partial<NodeResources>): NodeResources {
  return {
    Cpu: createNodeCpuResource(),
    Memory: createNodeMemoryResource(),
    Disk: createNodeDiskResource(),
    Networks: [],
    Devices: [],
    NodeResourcesNetwork: [],
    IOPS: 0,
    ...overrides,
  }
}

export function createNodeDriverInfo(overrides?: Partial<NodeDriverInfo>): NodeDriverInfo {
  return {
    Name: 'docker',
    Detected: true,
    Healthy: true,
    HealthDescription: '',
    UpdateTime: Date.now() * 1000000,
    Attributes: {},
    ...overrides,
  }
}

export function createDrainSpec(overrides?: Partial<DrainSpec>): DrainSpec {
  return {
    Deadline: 0,
    IgnoreSystemJobs: false,
    ...overrides,
  }
}

export function createLastDrain(overrides?: Partial<LastDrain>): LastDrain {
  return {
    Config: createDrainSpec(),
    StartedAt: '',
    UpdatedAt: '',
    ...overrides,
  }
}

export function createNode(overrides?: Partial<NodeListStub>): NodeListStub {
  const id = overrides?.ID ?? randomId()
  const nodeNum = (counter % 5) + 1
  return {
    Address: '10.0.0.' + nodeNum,
    ID: id,
    Attributes: {
      'unique.hostname': 'nomad-' + nodeNum,
      'os.name': 'linux',
      'kernel.name': 'Linux',
      'cpu.arch': 'amd64',
    },
    Datacenter: 'dc1',
    Name: 'nomad-' + nodeNum,
    NodePool: 'default',
    NodeClass: '',
    Version: '1.7.0',
    Drain: false,
    SchedulingEligibility: 'eligible',
    Status: 'ready',
    StatusDescription: '',
    Drivers: {
      docker: createNodeDriverInfo({ Name: 'docker' }),
      exec: createNodeDriverInfo({ Name: 'exec', Detected: true, Healthy: true }),
    },
    HostVolumes: {},
    NodeResources: createNodeResources(),
    ReservedResources: {
      Cpu: createNodeCpuResource({ CpuShares: 100 }),
      Memory: createNodeMemoryResource({ MemoryMB: 256 }),
      Disk: createNodeDiskResource({ DiskMB: 1024 }),
      Networks: [],
      IOPS: 0,
    },
    LastDrain: createLastDrain(),
    CreateIndex: 1,
    ModifyIndex: 1,
    ...overrides,
  }
}

export function createFullNode(overrides?: Partial<Node>): Node {
  const id = overrides?.ID ?? randomId()
  const nodeNum = (counter % 5) + 1
  return {
    Address: '10.0.0.' + nodeNum,
    ID: id,
    Attributes: {
      'unique.hostname': 'nomad-' + nodeNum,
      'os.name': 'linux',
      'kernel.name': 'Linux',
      'cpu.arch': 'amd64',
    },
    Datacenter: 'dc1',
    Name: 'nomad-' + nodeNum,
    NodePool: 'default',
    NodeClass: '',
    Version: '1.7.0',
    Drain: false,
    SchedulingEligibility: 'eligible',
    Status: 'ready',
    StatusDescription: '',
    Drivers: {
      docker: createNodeDriverInfo({ Name: 'docker' }),
      exec: createNodeDriverInfo({ Name: 'exec', Detected: true, Healthy: true }),
    },
    HostVolumes: {},
    NodeResources: createNodeResources(),
    ReservedResources: {
      Cpu: createNodeCpuResource({ CpuShares: 100 }),
      Memory: createNodeMemoryResource({ MemoryMB: 256 }),
      Disk: createNodeDiskResource({ DiskMB: 1024 }),
      Networks: [],
      IOPS: 0,
    },
    LastDrain: createLastDrain(),
    CreateIndex: 1,
    ModifyIndex: 1,
    Meta: {},
    Links: {},
    CSIControllerPlugins: {},
    CSINodePlugins: {},
    HostNetworks: {},
    ...overrides,
  }
}
