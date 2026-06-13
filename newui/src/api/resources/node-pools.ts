import { getNomadClient } from '../client';
import type { NodePool } from '../types/node';

export function getNodePools() {
  return getNomadClient().get<NodePool[]>('/v1/node/pools');
}
