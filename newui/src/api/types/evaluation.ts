export interface EvalAllocMetric {
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

export interface Evaluation {
  ID: string;
  Namespace: string;
  Priority: number;
  Type: string;
  TriggeredBy: string;
  JobID: string;
  NodeID: string;
  DeploymentID: string;
  Status: string;
  StatusDescription: string;
  WaitUntil: string;
  NextEval: string;
  PreviousEval: string;
  BlockedEval: string;
  RelatedEvals: string[];
  FailedTGAllocs: Record<string, EvalAllocMetric>;
  CreateIndex: number;
  ModifyIndex: number;
  CreateTime: number;
  ModifyTime: number;
  EscapedComputedClass: Record<string, number>;
  AnnotatePlan: boolean;
  QueuedAllocations: Record<string, number>;
  SnapshotIndex: number;
}
