export interface TaskGroupSummary {
  Queued: number;
  Complete: number;
  Failed: number;
  Running: number;
  Starting: number;
  Lost: number;
  Unknown: number;
}

export interface JobSummary {
  JobID: string;
  Namespace: string;
  Summary: Record<string, TaskGroupSummary>;
}

export interface JobListStub {
  ID: string;
  ParentID: string;
  Name: string;
  Namespace: string;
  Datacenters: string[];
  NodePool: string;
  Type: string;
  Priority: number;
  Periodic: boolean;
  ParameterizedJob: boolean;
  Stop: boolean;
  Status: string;
  StatusDescription: string;
  JobSummary: JobSummary;
  CreateIndex: number;
  ModifyIndex: number;
  JobModifyIndex: number;
  SubmitTime: number;
  Meta: Record<string, string>;
}

export interface Constraint {
  LTarget: string;
  RTarget: string;
  Operand: string;
}

export interface Affinity {
  LTarget: string;
  RTarget: string;
  Operand: string;
  Weight: number;
}

export interface Spread {
  Attribute: string;
  Weight: number;
  SpreadTarget: SpreadTarget[];
}

export interface SpreadTarget {
  Value: string;
  Percent: number;
}

export interface RestartPolicy {
  Interval: number;
  Attempts: number;
  Delay: number;
  Mode: string;
}

export interface ReschedulePolicy {
  Interval: number;
  Attempts: number;
  Delay: number;
  DelayFunction: string;
  MaxDelay: number;
  Unlimited: boolean;
}

export interface EphemeralDisk {
  Sticky: boolean;
  SizeMB: number;
  Migrate: boolean;
}

export interface UpdateStrategy {
  Stagger: number;
  MaxParallel: number;
  HealthCheck: string;
  MinHealthyTime: number;
  HealthyDeadline: number;
  ProgressDeadline: number;
  AutoRevert: boolean;
  AutoPromote: boolean;
  Canary: number;
}

export interface MigrateStrategy {
  MaxParallel: number;
  HealthCheck: string;
  MinHealthyTime: number;
  HealthyDeadline: number;
}

export interface Resource {
  CPU: number;
  MemoryMB: number;
  DiskMB: number;
  IOPS: number;
  Networks: NetworkResource[];
  Devices: DeviceResource[];
}

export interface NetworkResource {
  Mode: string;
  Device: string;
  CIDR: string;
  IP: string;
  DNS: DNSConfig[];
  ReservedPorts: Port[];
  DynamicPorts: Port[];
  MBits: number;
}

export interface DNSConfig {
  Name: string;
  IP: string;
}

export interface Port {
  Label: string;
  Value: number;
  To: number;
  HostIP: string;
}

export interface DeviceResource {
  Name: string;
  Type: string;
  Vendor: string;
  Count: number;
  Constraints: Constraint[];
  Affinities: Affinity[];
}

export interface Service {
  Name: string;
  PortLabel: string;
  AddressMode: string;
  Tags: string[];
  CanaryTags: string[];
  EnableTagOverride: boolean;
  Meta: Record<string, string>;
  CanaryMeta: Record<string, string>;
  CheckRestart: CheckRestart;
  Connect: ServiceConnect;
  TaskName: string;
  Checks: ServiceCheck[];
  Provider: string;
  OnUpdate: string;
}

export interface CheckRestart {
  Limit: number;
  Grace: number;
  IgnoreWarnings: boolean;
}

export interface ServiceConnect {
  Native: boolean;
  SidecarService: SidecarService;
  SidecarTask: SidecarTask;
}

export interface SidecarService {
  Tags: string[];
  Port: string;
  Proxy: ProxyConfig;
  Meta: Record<string, string>;
}

export interface ProxyConfig {
  LocalServiceAddress: string;
  LocalServicePort: number;
  Upstreams: Upstream[];
  Expose: ExposeConfig[];
  Config: Record<string, unknown>;
}

export interface Upstream {
  DestinationName: string;
  DestinationNamespace: string;
  LocalBindPort: number;
  LocalBindAddress: string;
  Datacenter: string;
  MeshGateway: MeshGateway;
}

export interface MeshGateway {
  Mode: string;
}

export interface ExposeConfig {
  Path: ExposePath[];
  Listener: ExposeListener[];
}

export interface ExposePath {
  Path: string;
  Protocol: string;
  ListenPort: number;
  LocalPathPort: number;
}

export interface ExposeListener {
  ListenerPort: number;
  LocalPathPort: number;
  LocalPathAddress: string;
}

export interface SidecarTask {
  Name: string;
  Driver: string;
  Config: Record<string, unknown>;
  Env: Record<string, string>;
  Meta: Record<string, string>;
  Constraints: Constraint[];
  Affinities: Affinity[];
  Resources: Resource;
  KillSignal: string;
  KillTimeout: number;
  LogConfig: LogConfig;
  Services: Service[];
  Vault: VaultConfig;
  Dispatch: boolean;
  ShutdownDelay: number;
}

export interface ServiceCheck {
  Name: string;
  Type: string;
  Command: string;
  Args: string[];
  Path: string;
  Protocol: string;
  PortLabel: string;
  AddressMode: string;
  Interval: number;
  Timeout: number;
  InitialStatus: string;
  TLSSkipVerify: boolean;
  Header: Record<string, string[]>;
  Method: string;
  Body: string;
  CheckRestart: CheckRestart;
  TaskName: string;
  SuccessBeforePassing: number;
  FailuresBeforeCritical: number;
  OnUpdate: string;
  GRPCService: string;
  GRPCUseTLS: boolean;
}

export interface Template {
  SourcePath: string;
  DestPath: string;
  EmbeddedTmpl: string;
  ChangeMode: string;
  ChangeSignal: string;
  ChangeScript: ChangeScript;
  Splay: number;
  Perms: string;
  Uid: number;
  Gid: number;
  LeftDelim: string;
  RightDelim: string;
  Envvars: boolean;
  VaultGrace: number;
  Wait: TemplateWait;
}

export interface ChangeScript {
  Command: string;
  Args: string[];
  Timeout: number;
}

export interface TemplateWait {
  Min: number;
  Max: number;
}

export interface Artifact {
  GetterSource: string;
  GetterOptions: Record<string, string>;
  GetterHeaders: Record<string, string>;
  GetterMode: string;
  RelativeDest: string;
}

export interface VaultConfig {
  Policies: string[];
  Namespace: string;
  Role: string;
  Env: boolean;
  ChangeMode: string;
  ChangeSignal: string;
  DisableFileCerts: boolean;
}

export interface LogConfig {
  MaxFiles: number;
  MaxFileSizeMB: number;
}

export interface DispatchPayloadConfig {
  File: string;
}

export interface TaskLifecycle {
  Hook: string;
  Sidecar: boolean;
}

export interface Task {
  Name: string;
  Driver: string;
  Config: Record<string, unknown>;
  Constraints: Constraint[];
  Affinities: Affinity[];
  Resources: Resource;
  Services: Service[];
  Templates: Template[];
  Artifacts: Artifact[];
  Env: Record<string, string>;
  Vault: VaultConfig;
  Dispatch: boolean;
  Lifecycle: TaskLifecycle;
  KillSignal: string;
  KillTimeout: number;
  LogConfig: LogConfig;
  Meta: Record<string, string>;
  Kind: string;
  ShutdownDelay: number;
  VolumeMounts: VolumeMount[];
  CSIPluginConfig: CSIPluginTaskConfig;
  DispatchPayload: DispatchPayloadConfig;
  Identity: TaskIdentity[];
  User: string;
}

export interface VolumeMount {
  Volume: string;
  Destination: string;
  ReadOnly: boolean;
  PropagationMode: string;
}

export interface CSIPluginTaskConfig {
  ID: string;
  Type: string;
  MountDir: string;
  StagePublishAuth: string;
  HealthTimeout: number;
}

export interface TaskIdentity {
  Name: string;
  Env: boolean;
  File: string;
}

export interface TaskGroup {
  Name: string;
  Count: number;
  Tasks: Task[];
  Constraints: Constraint[];
  Affinities: Affinity[];
  Spreads: Spread[];
  RestartPolicy: RestartPolicy;
  ReschedulePolicy: ReschedulePolicy;
  EphemeralDisk: EphemeralDisk;
  Update: UpdateStrategy;
  Migrate: MigrateStrategy;
  Meta: Record<string, string>;
  Volumes: Record<string, VolumeRequest>;
  Networks: NetworkResource[];
  Services: Service[];
  ShutdownDelay: number;
  StopAfterClientDisconnect: number;
  MaxClientDisconnect: number;
  ConsistentReads: boolean;
}

export interface VolumeRequest {
  Name: string;
  Type: string;
  Source: string;
  ReadOnly: boolean;
  Attach: boolean;
  AccessMode: string;
  AttachmentMode: string;
  MountOptions: VolumeMountOptions;
  PerAlloc: boolean;
}

export interface VolumeMountOptions {
  FsType: string;
  MountFlags: string[];
}

export interface PeriodicConfig {
  Enabled: boolean;
  Spec: string;
  SpecType: string;
  ProhibitOverlap: boolean;
  TimeZone: string;
}

export interface ParameterizedJobConfig {
  Payload: string;
  MetaRequired: string[];
  MetaOptional: string[];
}

export interface Job {
  ID: string;
  ParentID: string;
  Name: string;
  Namespace: string;
  Datacenters: string[];
  NodePool: string;
  Type: string;
  Priority: number;
  AllAtOnce: boolean;
  Stop: boolean;
  Status: string;
  StatusDescription: string;
  JobSummary: JobSummary;
  CreateIndex: number;
  ModifyIndex: number;
  JobModifyIndex: number;
  SubmitTime: number;
  TaskGroups: TaskGroup[];
  Constraints: Constraint[];
  Affinities: Affinity[];
  Spreads: Spread[];
  Periodic: PeriodicConfig;
  ParameterizedJob: ParameterizedJobConfig;
  Meta: Record<string, string>;
  Update: UpdateStrategy;
  Migrate: MigrateStrategy;
  Payload: string;
  ConsulNamespace: string;
  VaultNamespace: string;
  NomadTokenID: string;
  Stable: boolean;
  Version: number;
}

export interface JobSubmission {
  Source: string;
  Format: string;
}

export interface JobAction {
  Name: string;
  Command: string;
  Args: string[];
  TaskName: string;
  TaskGroupName: string;
}

export interface JobScaleRequest {
  Count: number;
  Message: string;
  Target: Record<string, string>;
}

export interface JobPlanRequest {
  Job: Job;
  Diff: boolean;
  Annotations: boolean;
}

export interface JobDiff {
  Type: string;
  ID: string;
  Fields: FieldDiff[];
  Objects: ObjectDiff[];
  TaskGroups: TaskGroupDiff[];
}

export interface FieldDiff {
  Type: string;
  Name: string;
  Old: string;
  New: string;
  Annotations: string[];
}

export interface ObjectDiff {
  Type: string;
  Name: string;
  Fields: FieldDiff[];
  Objects: ObjectDiff[];
}

export interface TaskGroupDiff {
  Type: string;
  Name: string;
  Fields: FieldDiff[];
  Objects: ObjectDiff[];
  Tasks: TaskDiff[];
  Updates: Record<string, number>;
}

export interface TaskDiff {
  Type: string;
  Name: string;
  Fields: FieldDiff[];
  Objects: ObjectDiff[];
}

export interface AllocationMetric {
  NodesAvailable: Record<string, number>;
  NodesExhausted: number;
  ClassExhausted: Record<string, number>;
  ConstraintFiltered: number;
  NodesFiltered: number;
  ClassFiltered: Record<string, number>;
  ScoreMetric: Record<string, Record<string, number>>;
  AllocationTime: number;
  CoalescedFailures: number;
}

export interface JobPlanResponse {
  Annotations: string[];
  FailedTGAllocs: Record<string, AllocationMetric>;
  JobDiff: JobDiff;
  NextPeriodicLaunch: number;
  CreatedEvals: unknown[];
  Diff: string;
  Warnings: string;
}

export interface JobDispatchRequest {
  Payload: string;
  Meta: Record<string, string>;
}

export interface ParseRequest {
  JobHCL: string;
  Variables: Record<string, string>;
  Canonicalize: boolean;
  SkipValidation: boolean;
}

export interface ParseResponse {
  Job: Job;
  Error: string;
  Warnings: string;
}
