import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import type { ACLPolicy } from '@/api/types/acl'

type Resource =
  | 'job'
  | 'node'
  | 'allocation'
  | 'variable'
  | 'namespace'
  | 'policy'
  | 'token'
  | 'role'
  | 'volume'
  | 'plugin'

type Action =
  | 'read'
  | 'list'
  | 'create'
  | 'update'
  | 'delete'
  | 'run'
  | 'scale'
  | 'dispatch'
  | 'stop'
  | 'purge'
  | 'execute'

interface AbilityCheck {
  resource: Resource
  action: Action
  namespace?: string
}

const RESOURCE_CAPABILITY_MAP: Record<Resource, string> = {
  job: 'jobs',
  node: 'nodes',
  allocation: 'allocations',
  variable: 'variables',
  namespace: 'namespaces',
  policy: 'policies',
  token: 'tokens',
  role: 'roles',
  volume: 'volumes',
  plugin: 'plugins',
}

const ACTION_CAPABILITY_MAP: Record<Action, string> = {
  read: 'read',
  list: 'list',
  create: 'create',
  update: 'update',
  delete: 'delete',
  run: 'run',
  scale: 'scale',
  dispatch: 'dispatch',
  stop: 'stop',
  purge: 'purge',
  execute: 'execute',
}

function parsePolicyRules(rules: string): Record<string, Record<string, string[]>> {
  const result: Record<string, Record<string, string[]>> = {}
  try {
    const namespaceBlocks = rules.split('namespace').filter(Boolean)
    for (const block of namespaceBlocks) {
      const nameMatch = block.match(/^\s*"([^"]*)"/)
      const nsName = nameMatch ? nameMatch[1] : 'default'
      const capabilities: string[] = []
      const capRegex = /capability\s*=\s*\[([^\]]*)\]/g
      let match: RegExpExecArray | null
      while ((match = capRegex.exec(block)) !== null) {
        const caps = match[1]!.replace(/"/g, '').split(',').map((s) => s.trim()).filter(Boolean)
        capabilities.push(...caps)
      }
      result[nsName!] = { capabilities }
    }
  } catch {
    return result
  }
  return result
}

function checkPolicyPermission(policy: ACLPolicy, resource: Resource, action: Action, namespace?: string): boolean {
  const resourceCap = RESOURCE_CAPABILITY_MAP[resource]
  const actionCap = ACTION_CAPABILITY_MAP[action]
  if (!policy.Rules) return false

  const parsed = parsePolicyRules(policy.Rules)
  const targetNs = namespace || 'default'

  for (const [nsName, nsData] of Object.entries(parsed)) {
    const nsMatches = nsName === targetNs || nsName === '*' || (nsName === 'default' && !namespace)
    if (nsMatches && nsData.capabilities) {
      const hasCapability = nsData.capabilities.includes(`${resourceCap}:${actionCap}`) ||
        nsData.capabilities.includes(`${resourceCap}:*`) ||
        nsData.capabilities.includes('*')
      if (hasCapability) return true
    }
  }

  return false
}

export function useCan() {
  const selfToken = useAuthStore((s) => s.selfToken)
  const policies = useAuthStore((s) => s.policies)

  return useMemo(() => {
    return (check: AbilityCheck): boolean => {
      if (!selfToken) return false
      if (selfToken.Type === 'management') return true

      for (const policy of policies) {
        if (checkPolicyPermission(policy, check.resource, check.action, check.namespace)) {
          return true
        }
      }

      return false
    }
  }, [selfToken, policies])
}

export type { Resource, Action, AbilityCheck }
