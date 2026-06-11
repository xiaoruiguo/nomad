import type { Namespace } from '@/api/resources/namespaces'

let counter = 0

export function createNamespace(overrides?: Partial<Namespace>): Namespace {
  counter++
  return {
    Name: overrides?.Name ?? `namespace-${counter}`,
    Description: overrides?.Description ?? `Namespace ${counter}`,
    Quotas: overrides?.Quotas ?? [],
    Capabilities: overrides?.Capabilities ?? [],
    Meta: overrides?.Meta ?? {},
    CreateIndex: overrides?.CreateIndex ?? counter,
    ModifyIndex: overrides?.ModifyIndex ?? counter,
    Hash: overrides?.Hash ?? '',
  }
}
