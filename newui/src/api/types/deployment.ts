export interface DeploymentState {
  AutoRevert: boolean;
  AutoPromote: boolean;
  CanaryAllocationIDs: string[];
  DesiredCanaries: number;
  DesiredTotal: number;
  Promoted: boolean;
  PlacedCanaries: string[];
  HealthyAllocs: number;
  UnhealthyAllocs: number;
}

export interface Deployment {
  ID: string;
  Namespace: string;
  JobID: string;
  JobVersion: number;
  JobModifyIndex: number;
  JobSpecModifyIndex: number;
  IsMultiregion: boolean;
  TaskGroups: Record<string, DeploymentState>;
  Status: string;
  StatusDescription: string;
  EvalPriority: number;
  CreateIndex: number;
  ModifyIndex: number;
  CreateTime: number;
  ModifyTime: number;
  RequiresExplicitPromotion: boolean;
  LatestJobVersion: boolean;
  HasPromotedCanaries: boolean;
  HasUnhealthyAlloc: boolean;
}

export interface DeploymentPauseRequest {
  DeployID: string;
  Pause: boolean;
}

export interface DeploymentPromoteRequest {
  DeployID: string;
  Groups: string[];
}

export interface DeploymentAllocHealthRequest {
  DeployID: string;
  HealthyAllocationIDs: string[];
  UnhealthyAllocationIDs: string[];
}
