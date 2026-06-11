import { getNomadClient } from '../client';
import type { Deployment, DeploymentPauseRequest, DeploymentPromoteRequest, DeploymentAllocHealthRequest } from '../types/deployment';
import type { AllocListStub } from '../types/allocation';
import type { QueryParams } from '../types/common';

export function getDeployments(params?: QueryParams) {
  return getNomadClient().get<Deployment[]>('/v1/deployments', params as Record<string, string>);
}

export function getDeployment(id: string, params?: QueryParams) {
  return getNomadClient().get<Deployment>(`/v1/deployment/${id}`, params as Record<string, string>);
}

export function getDeploymentAllocations(id: string, params?: QueryParams) {
  return getNomadClient().get<AllocListStub[]>(`/v1/deployment/${id}/allocations`, params as Record<string, string>);
}

export function failDeployment(id: string, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/deployment/${id}/fail`, undefined, params as Record<string, string>);
}

export function pauseDeployment(id: string, request: DeploymentPauseRequest, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/deployment/${id}/pause`, request, params as Record<string, string>);
}

export function promoteDeployment(id: string, request: DeploymentPromoteRequest, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/deployment/${id}/promote`, request, params as Record<string, string>);
}

export function setAllocationHealth(id: string, request: DeploymentAllocHealthRequest, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/deployment/${id}/alloc-health`, request, params as Record<string, string>);
}

export function unblockDeployment(id: string, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/deployment/${id}/unblock`, undefined, params as Record<string, string>);
}
