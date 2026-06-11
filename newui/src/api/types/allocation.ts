import type { DNSConfig, Port } from './job'

export interface TaskStateEvent {
  Type: string;
  Time: number;
  Message: string;
  DisplayMessage: string;
  SetupError: string;
  DriverError: string;
  DownloadError: string;
  ValidationError: string;
  KillError: string;
  ExitCode: number;
  Signal: number;
  TaskSignal: string;
  KillTimeout: number;
  DownloadProgress: number;
  FailsTask: boolean;
  RestartReason: string;
  SetupReason: string;
  DriverMessage: string;
}

export interface TaskState {
  State: string;
  Failed: boolean;
  StartedAt: string;
  FinishedAt: string;
  Events: TaskStateEvent[];
  Restarts: number;
  LastRestart: string;
  Healthy: string;
}

export { DNSConfig, Port }

export interface AllocNetworkResource {
  Mode: string;
  Device: string;
  IP: string;
  DNS: DNSConfig[];
  ReservedPorts: Port[];
  DynamicPorts: Port[];
}

export interface AllocCpuResource {
  CpuShares: number;
  CpuCores: number;
}

export interface AllocMemoryResource {
  MemoryMB: number;
  MemoryOversubscribedMB: number;
}

export interface AllocDiskResource {
  DiskMB: number;
}

export interface AllocTaskResource {
  Cpu: AllocCpuResource;
  Memory: AllocMemoryResource;
  Disk: AllocDiskResource;
  Networks: AllocNetworkResource[];
  IOPS: number;
}

export interface AllocatedTaskResources {
  Cpu: AllocCpuResource;
  Memory: AllocMemoryResource;
  Disk: AllocDiskResource;
  Networks: AllocNetworkResource[];
  IOPS: number;
}

export interface AllocatedResources {
  Cpu: AllocCpuResource;
  Memory: AllocMemoryResource;
  Disk: AllocDiskResource;
  Networks: AllocNetworkResource[];
  IOPS: number;
  Tasks: Record<string, AllocatedTaskResources>;
}

export interface AllocDeployStatus {
  Healthy: string;
  Canary: boolean;
  Timestamp: string;
}

export interface RescheduleEvent {
  PrevAllocID: string;
  PrevNodeID: string;
  RescheduleAttempt: number;
  Delay: number;
  Interval: number;
}

export interface RescheduleTracker {
  Events: RescheduleEvent[];
}

export interface AllocListStub {
  ID: string;
  EvalID: string;
  Name: string;
  Namespace: string;
  NodeID: string;
  NodeName: string;
  JobID: string;
  JobType: string;
  JobVersion: number;
  TaskGroup: string;
  AllocatedResources: AllocatedResources;
  DesiredStatus: string;
  DesiredDescription: string;
  ClientStatus: string;
  ClientDescription: string;
  TaskStates: Record<string, TaskState>;
  DeploymentStatus: AllocDeployStatus;
  FollowupEvalID: string;
  NextAllocation: string;
  RescheduleTracker: RescheduleTracker;
  PreemptedAllocations: string[];
  PreemptedByAllocation: string;
  CreateIndex: number;
  ModifyIndex: number;
  CreateTime: number;
  ModifyTime: number;
}

export interface Allocation {
  ID: string;
  EvalID: string;
  Name: string;
  Namespace: string;
  NodeID: string;
  NodeName: string;
  JobID: string;
  JobType: string;
  JobVersion: number;
  TaskGroup: string;
  AllocatedResources: AllocatedResources;
  DesiredStatus: string;
  DesiredDescription: string;
  ClientStatus: string;
  ClientDescription: string;
  TaskStates: Record<string, TaskState>;
  DeploymentStatus: AllocDeployStatus;
  FollowupEvalID: string;
  NextAllocation: string;
  RescheduleTracker: RescheduleTracker;
  PreemptedAllocations: string[];
  PreemptedByAllocation: string;
  CreateIndex: number;
  ModifyIndex: number;
  CreateTime: number;
  ModifyTime: number;
  Resources: AllocTaskResource;
  SharedResources: AllocTaskResource;
  TaskResources: Record<string, AllocTaskResource>;
  Metrics: unknown;
}

export interface CpuStats {
  SystemMode: number;
  UserMode: number;
  Percent: number;
  TotalTicks: number;
  MeasuredFields: string[];
}

export interface MemoryStats {
  RSS: number;
  Cache: number;
  Swap: number;
  Usage: number;
  MaxUsage: number;
  MeasuredFields: string[];
}

export interface TaskResourceUsage {
  Cpu: CpuStats;
  Memory: MemoryStats;
}

export interface AllocStats {
  ResourceUsage: TaskResourceUsage;
  Tasks: Record<string, TaskResourceUsage>;
}

export interface AllocExecRequest {
  AllocID: string;
  Task: string;
  Cmd: string;
  Tty: boolean;
}
