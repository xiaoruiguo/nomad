import type { ACLPolicy } from '@/api/types/acl'

let counter = 0

export function createPolicy(overrides?: Partial<ACLPolicy>): ACLPolicy {
  counter++
  return {
    Name: overrides?.Name ?? `policy-${counter}`,
    Description: overrides?.Description ?? `Policy ${counter}`,
    Rules: overrides?.Rules ?? 'namespace "*" { policy = "read" }',
    CreateIndex: overrides?.CreateIndex ?? counter,
    ModifyIndex: overrides?.ModifyIndex ?? counter,
    Hash: overrides?.Hash ?? '',
  }
}
