export interface NodeCpuResource {
  CpuShares: number;
  CpuCores: number;
  ReservableCpuCores: number[];
}

export interface NodeMemoryResource {
  MemoryMB: number;
  MemoryOversubscribedMB: number;
}

export interface NodeDiskResource {
  DiskMB: number;
}

export interface NodeNetworkResource {
  Mode: string;
  Device: string;
  CIDR: string;
  IP: string;
  DNS: NodeDNSConfig[];
  ReservedPorts: NodePort[];
  DynamicPorts: NodePort[];
  MBits: number;
}

export interface NodeDNSConfig {
  Name: string;
  IP: string;
}

export interface NodePort {
  Label: string;
  Value: number;
  To: number;
  HostIP: string;
}

export interface NodeDeviceResource {
  Name: string;
  Type: string;
  Vendor: string;
  Count: number;
  Health: string;
  HealthDescription: string;
}

export interface NodeResources {
  Cpu: NodeCpuResource;
  Memory: NodeMemoryResource;
  Disk: NodeDiskResource;
  Networks: NodeNetworkResource[];
  Devices: NodeDeviceResource[];
  NodeResourcesNetwork: NodeNetworkResource[];
  IOPS: number;
}

export interface ReservedResource {
  Cpu: NodeCpuResource;
  Memory: NodeMemoryResource;
  Disk: NodeDiskResource;
  Networks: NodeNetworkResource[];
  IOPS: number;
}

export interface NodeDriverInfo {
  Name: string;
  Detected: boolean;
  Healthy: boolean;
  HealthDescription: string;
  UpdateTime: number;
  Attributes: Record<string, string>;
}

export interface HostVolume {
  Name: string;
  Path: string;
  ReadOnly: boolean;
}

export interface DrainSpec {
  Deadline: number;
  IgnoreSystemJobs: boolean;
}

export interface LastDrain {
  Config: DrainSpec;
  StartedAt: string;
  UpdatedAt: string;
}

export interface NodeListStub {
  Address: string;
  ID: string;
  Attributes: Record<string, string>;
  Datacenter: string;
  Name: string;
  NodePool: string;
  NodeClass: string;
  Version: string;
  Drain: boolean;
  SchedulingEligibility: string;
  Status: string;
  StatusDescription: string;
  Drivers: Record<string, NodeDriverInfo>;
  HostVolumes: Record<string, HostVolume>;
  NodeResources: NodeResources;
  ReservedResources: ReservedResource;
  LastDrain: LastDrain;
  CreateIndex: number;
  ModifyIndex: number;
}

export interface Node extends NodeListStub {
  Meta: Record<string, string>;
  Links: Record<string, string>;
  CSIControllerPlugins: Record<string, unknown>;
  CSINodePlugins: Record<string, unknown>;
  HostNetworks: Record<string, unknown>;
}

export interface NodeDrainRequest {
  NodeID: string;
  DrainSpec: DrainSpec;
  MarkEligible: boolean;
}

export interface NodeEligibilityRequest {
  NodeID: string;
  Eligibility: string;
}

export interface NodePool {
  Name: string;
  Description: string;
  Meta: Record<string, string>;
}
