import { getNomadClient } from '../client';
import type { Evaluation } from '../types/evaluation';
import type { QueryParams } from '../types/common';

export function getEvaluations(params?: QueryParams) {
  return getNomadClient().get<Evaluation[]>('/v1/evaluations', params as Record<string, string>);
}

export function getEvaluation(id: string, params?: QueryParams) {
  return getNomadClient().get<Evaluation>(`/v1/evaluation/${id}`, params as Record<string, string>);
}

export function deleteEvaluation(id: string, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/evaluation/${id}`, undefined, params as Record<string, string>);
}
