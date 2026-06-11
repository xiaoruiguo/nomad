import { getNomadClient } from '../client';
import type { Variable, VariableListStub } from '../types/variable';
import type { QueryParams } from '../types/common';

export function getVariables(params?: QueryParams) {
  return getNomadClient().get<VariableListStub[]>('/v1/vars', params as Record<string, string>);
}

export function getVariable(path: string, params?: QueryParams) {
  return getNomadClient().get<Variable>(`/v1/var/${path}`, params as Record<string, string>);
}

export function createVariable(path: string, variable: Partial<Variable>, params?: QueryParams) {
  return getNomadClient().put<Variable>(`/v1/var/${path}`, variable, params as Record<string, string>);
}

export function updateVariable(path: string, variable: Partial<Variable>, params?: QueryParams) {
  return getNomadClient().put<Variable>(`/v1/var/${path}`, variable, params as Record<string, string>);
}

export function deleteVariable(path: string, params?: QueryParams) {
  return getNomadClient().delete<unknown>(`/v1/var/${path}`, params as Record<string, string>);
}
