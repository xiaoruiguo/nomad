export interface CSIMountOptions {
  FsType: string;
  MountFlags: string[];
}

export interface CSITopology {
  Segments: Record<string, string>;
}

export interface CSIVolume {
  ID: string;
  Namespace: string;
  Name: string;
  ExternalID: string;
  Capacity: number;
  CapacityMin: number;
  CapacityMax: number;
  AccessMode: string;
  AttachmentMode: string;
  MountOptions: CSIMountOptions;
  Topology: CSITopology[];
  RequestedTopologies: CSITopology[];
  Provider: string;
  ProviderID: string;
  ControllerRequired: boolean;
  ControllersExpected: number;
  ControllersHealthy: number;
  NodeExpandRequired: boolean;
  PluginID: string;
  Allocations: unknown[];
  ReadAllocs: Record<string, unknown>;
  WriteAllocs: Record<string, unknown>;
  ScheduledFlexibly: boolean;
  CreateIndex: number;
  ModifyIndex: number;
  Schedulable: boolean;
  Health: string;
  Status: string;
  nodesHealthy: number;
  nodesExpected: number;
  CurrentWriters: number;
  CurrentReaders: number;
  plainId: string;
}

export interface CSIControllerInfo {
  SupportsReadOnlyAttach: boolean;
  SupportsAttach: boolean;
  SupportsDetach: boolean;
  SupportsMultiNode: boolean;
  SupportsExpand: boolean;
  RequiresExternalAttach: boolean;
}

export interface CSINodeInfo {
  NodeID: string;
  MaxVolumes: number;
  AccessibleTopology: CSITopology;
}

export interface CSIInfo {
  PluginID: string;
  AllocID: string;
  Healthy: boolean;
  HealthDescription: string;
  UpdateTime: string;
  Provider: string;
  ProviderVersion: string;
  RequiresControllerPlugin: boolean;
  RequiresTopologies: boolean;
  ControllerInfo?: CSIControllerInfo;
  NodeInfo?: CSINodeInfo;
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
  DesiredStatus: string;
  ClientStatus: string;
  CreateTime: number;
  ModifyTime: number;
}

export interface CSIPlugin {
  ID: string;
  Provider: string;
  Version: string;
  ControllerRequired: boolean;
  Controllers: Record<string, CSIInfo>;
  Nodes: Record<string, CSIInfo>;
  Allocations: AllocListStub[];
  ControllersHealthy: number;
  ControllersExpected: number;
  NodesHealthy: number;
  NodesExpected: number;
  CreateIndex: number;
  ModifyIndex: number;
  CreateTime: number;
  ModifyTime: number;
}

export interface CSISnapshot {
  ID: string;
  ExternalSourceVolumeID: string;
  Size: number;
  CreationTime: number;
  IsReady: boolean;
  SourceVolumeID: string;
  ProviderID: string;
  PluginID: string;
}

export interface CSIExternalVolume {
  ID: string;
  Name: string;
  Capacity: number;
  AccessMode: string;
  AttachmentMode: string;
  StorageProvider: string;
  ProviderID: string;
  PluginID: string;
}

export interface DynamicHostVolume {
  ID: string;
  Name: string;
  Namespace: string;
  plainId: string;
  idWithNamespace: string;
  node: { ID: string; Name: string };
  pluginID: string;
  state: string;
  modifyTime: number;
}
