import { getNomadClient } from '../client';
import type { AllocListStub, Allocation, AllocStats } from '../types/allocation';
import type { QueryParams } from '../types/common';

export function getAllocations(params?: QueryParams) {
  return getNomadClient().get<AllocListStub[]>('/v1/allocations', params as Record<string, string>);
}

export function getAllocation(id: string, params?: QueryParams) {
  return getNomadClient().get<Allocation>(`/v1/allocation/${id}`, params as Record<string, string>);
}

export function stopAllocation(id: string, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/allocation/${id}/stop`, undefined, params as Record<string, string>);
}

export function restartAllocation(id: string, taskName?: string, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/allocation/${id}/restart`, taskName ? { TaskName: taskName } : undefined, params as Record<string, string>);
}

export function getAllocationStats(id: string, params?: QueryParams) {
  return getNomadClient().get<AllocStats>(`/v1/client/allocation/${id}/stats`, params as Record<string, string>);
}

export function getAllocationChecks(id: string, params?: QueryParams) {
  return getNomadClient().get<Record<string, unknown>>(`/v1/allocation/${id}/checks`, params as Record<string, string>);
}

export function getAllocationServices(id: string, params?: QueryParams) {
  return getNomadClient().get<unknown[]>(`/v1/allocation/${id}/services`, params as Record<string, string>);
}

export function signalAllocation(id: string, signal: string, taskName?: string, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/allocation/${id}/signal`, { Signal: signal, TaskName: taskName }, params as Record<string, string>);
}

export function pauseAllocation(id: string, pause: boolean, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/allocation/${id}`, { Pause: pause }, params as Record<string, string>);
}
