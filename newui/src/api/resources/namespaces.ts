import { getNomadClient } from '../client';
import type { QueryParams } from '../types/common';

export interface Namespace {
  Name: string;
  Description: string;
  Quotas: string[];
  Capabilities: string[];
  Meta: Record<string, string>;
  CreateIndex: number;
  ModifyIndex: number;
  Hash: string;
}

export function getNamespaces(params?: QueryParams) {
  return getNomadClient().get<Namespace[]>('/v1/namespaces', params as Record<string, string>);
}

export function getNamespace(name: string, params?: QueryParams) {
  return getNomadClient().get<Namespace>(`/v1/namespace/${name}`, params as Record<string, string>);
}

export function createNamespace(ns: Partial<Namespace>, params?: QueryParams) {
  return getNomadClient().post<Namespace>('/v1/namespace', ns, params as Record<string, string>);
}

export function updateNamespace(name: string, ns: Partial<Namespace>, params?: QueryParams) {
  return getNomadClient().post<Namespace>(`/v1/namespace/${name}`, ns, params as Record<string, string>);
}

export function deleteNamespace(name: string, params?: QueryParams) {
  return getNomadClient().delete<unknown>(`/v1/namespace/${name}`, params as Record<string, string>);
}
