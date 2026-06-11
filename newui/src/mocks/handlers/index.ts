import { http } from 'msw'
import { jobHandlers } from './jobs'
import { allocationHandlers } from './allocations'
import { nodeHandlers } from './nodes'
import { aclHandlers } from './acl'
import { agentHandlers } from './agent'
import { namespaceHandlers } from './namespaces'
import { variableHandlers } from './variables'
import { deploymentHandlers } from './deployments'
import { evaluationHandlers } from './evaluations'
import { csiHandlers } from './csi'
import { searchHandlers } from './search'

export const handlers: ReturnType<typeof http.get>[] = [
  ...jobHandlers,
  ...allocationHandlers,
  ...nodeHandlers,
  ...aclHandlers,
  ...agentHandlers,
  ...namespaceHandlers,
  ...variableHandlers,
  ...deploymentHandlers,
  ...evaluationHandlers,
  ...csiHandlers,
  ...searchHandlers,
]
