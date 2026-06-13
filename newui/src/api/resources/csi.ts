import { getNomadClient } from '../client';
import type { CSIVolume, CSIPlugin, CSISnapshot, CSIExternalVolume, DynamicHostVolume } from '../types/csi';
import type { QueryParams } from '../types/common';

export function getVolumes(params?: QueryParams) {
  return getNomadClient().get<CSIVolume[]>('/v1/volumes', params as Record<string, string>);
}

export function getVolume(id: string, params?: QueryParams) {
  return getNomadClient().get<CSIVolume>(`/v1/volume/${id}`, params as Record<string, string>);
}

export function createVolume(volume: Partial<CSIVolume>, params?: QueryParams) {
  return getNomadClient().put<CSIVolume>(`/v1/volume/${volume.ID}`, volume, params as Record<string, string>);
}

export function deleteVolume(id: string, params?: QueryParams) {
  return getNomadClient().delete<unknown>(`/v1/volume/${id}`, params as Record<string, string>);
}

export function getExternalVolumes(params?: QueryParams) {
  return getNomadClient().get<CSIExternalVolume[]>('/v1/volumes/external', params as Record<string, string>);
}

export function getSnapshots(params?: QueryParams) {
  return getNomadClient().get<CSISnapshot[]>('/v1/volumes/snapshots', params as Record<string, string>);
}

export function getPlugins(params?: QueryParams) {
  return getNomadClient().get<CSIPlugin[]>('/v1/plugins', params as Record<string, string>);
}

export function getPlugin(id: string, params?: QueryParams) {
  return getNomadClient().get<CSIPlugin>(`/v1/plugin/${id}`, params as Record<string, string>);
}

export function getDynamicHostVolumes(params?: QueryParams) {
  return getNomadClient().get<DynamicHostVolume[]>('/v1/dynamic-host-volumes', params as Record<string, string>);
}
