import { getNomadClient } from '../client';
import type { NodeListStub, Node, NodeDrainRequest, NodeEligibilityRequest } from '../types/node';
import type { AllocListStub } from '../types/allocation';
import type { QueryParams } from '../types/common';

export function getNodes(params?: QueryParams) {
  return getNomadClient().get<NodeListStub[]>('/v1/nodes', params as Record<string, string>);
}

export function getNode(id: string, params?: QueryParams) {
  return getNomadClient().get<Node>(`/v1/node/${id}`, params as Record<string, string>);
}

export function getNodeAllocations(id: string, params?: QueryParams) {
  return getNomadClient().get<AllocListStub[]>(`/v1/node/${id}/allocations`, params as Record<string, string>);
}

export function drainNode(id: string, request: NodeDrainRequest, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/node/${id}/drain`, request, params as Record<string, string>);
}

export function toggleEligibility(id: string, request: NodeEligibilityRequest, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/node/${id}/eligibility`, request, params as Record<string, string>);
}

export function purgeNode(id: string, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/node/${id}/purge`, undefined, params as Record<string, string>);
}

export function evaluateNode(id: string, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/node/${id}/evaluate`, undefined, params as Record<string, string>);
}
