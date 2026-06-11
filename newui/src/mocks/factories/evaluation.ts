import type { Evaluation, EvalAllocMetric } from '@/api/types/evaluation'

let counter = 0

function randomId(): string {
  counter++
  const hex = counter.toString(16).padStart(8, '0')
  const rand = Math.random().toString(16).slice(2, 10)
  return `${hex}-${rand}-${rand.slice(0, 4)}-${rand.slice(0, 4)}`
}

export function createEvalAllocMetric(overrides?: Partial<EvalAllocMetric>): EvalAllocMetric {
  return {
    NodesAvailable: { dc1: 5 },
    NodesExhausted: 0,
    ClassExhausted: {},
    ConstraintFiltered: 0,
    NodesFiltered: 0,
    ClassFiltered: {},
    ScoreMetric: {},
    AllocationTime: 0,
    CoalescedFailures: 0,
    ...overrides,
  }
}

export function createEvaluation(overrides?: Partial<Evaluation>): Evaluation {
  const id = overrides?.ID ?? randomId()
  return {
    ID: id,
    Namespace: 'default',
    Priority: 50,
    Type: 'service',
    TriggeredBy: 'job-register',
    JobID: 'example',
    NodeID: '',
    DeploymentID: '',
    Status: 'complete',
    StatusDescription: '',
    WaitUntil: '',
    NextEval: '',
    PreviousEval: '',
    BlockedEval: '',
    RelatedEvals: [],
    FailedTGAllocs: {},
    CreateIndex: 1,
    ModifyIndex: 1,
    CreateTime: Date.now() * 1000000,
    ModifyTime: Date.now() * 1000000,
    EscapedComputedClass: {},
    AnnotatePlan: false,
    QueuedAllocations: {},
    SnapshotIndex: 0,
    ...overrides,
  }
}
