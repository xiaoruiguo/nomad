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

export interface CSIPlugin {
  ID: string;
  Provider: string;
  ProviderVersion: string;
  ControllerInfo: CSIControllerInfo;
  NodeInfo: CSINodeInfo[];
  Allocations: unknown[];
  CreateIndex: number;
  ModifyIndex: number;
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
