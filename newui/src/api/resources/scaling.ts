import { getNomadClient } from '../client';
import type { QueryParams } from '../types/common';

export interface ScalingPolicy {
  ID: string;
  Namespace: string;
  Target: Record<string, string>;
  Min: number;
  Max: number;
  Policy: Record<string, unknown>;
  CreateIndex: number;
  ModifyIndex: number;
}

export interface ScalingPolicyListStub {
  ID: string;
  Namespace: string;
  Target: Record<string, string>;
  Min: number;
  Max: number;
  CreateIndex: number;
  ModifyIndex: number;
}

export function getScalingPolicies(params?: QueryParams) {
  return getNomadClient().get<ScalingPolicyListStub[]>('/v1/scaling/policies', params as Record<string, string>);
}

export function getScalingPolicy(id: string, params?: QueryParams) {
  return getNomadClient().get<ScalingPolicy>(`/v1/scaling/policy/${id}`, params as Record<string, string>);
}
