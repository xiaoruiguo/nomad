import type { ACLToken, ACLTokenListStub } from '@/api/types/acl'

let counter = 0

export function createToken(overrides?: Partial<ACLToken>): ACLToken {
  counter++
  return {
    ID: overrides?.ID ?? '',
    AccessorID: overrides?.AccessorID ?? `accessor-${counter}`,
    Name: overrides?.Name ?? `Token ${counter}`,
    Type: overrides?.Type ?? 'client',
    Policies: overrides?.Policies ?? [],
    Roles: overrides?.Roles ?? [],
    SecretID: overrides?.SecretID ?? `secret-${counter}-abcd1234`,
    Global: overrides?.Global ?? false,
    CreateTime: overrides?.CreateTime ?? Date.now() * 1000000,
    ModifyTime: overrides?.ModifyTime ?? Date.now() * 1000000,
    ExpirationTime: overrides?.ExpirationTime ?? '',
    Description: overrides?.Description ?? '',
    Hash: overrides?.Hash ?? '',
    CreateIndex: overrides?.CreateIndex ?? counter,
    ModifyIndex: overrides?.ModifyIndex ?? counter,
  }
}

export function createTokenListStub(overrides?: Partial<ACLTokenListStub>): ACLTokenListStub {
  counter++
  return {
    ID: overrides?.ID ?? '',
    AccessorID: overrides?.AccessorID ?? `accessor-${counter}`,
    Name: overrides?.Name ?? `Token ${counter}`,
    Type: overrides?.Type ?? 'client',
    Policies: overrides?.Policies ?? [],
    Roles: overrides?.Roles ?? [],
    Global: overrides?.Global ?? false,
    CreateTime: overrides?.CreateTime ?? Date.now() * 1000000,
    ExpirationTime: overrides?.ExpirationTime ?? '',
    CreateIndex: overrides?.CreateIndex ?? counter,
    ModifyIndex: overrides?.ModifyIndex ?? counter,
  }
}
