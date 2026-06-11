import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVolumes,
  getVolume,
  getPlugins,
  getPlugin,
  getExternalVolumes,
  getSnapshots,
  createVolume,
  deleteVolume,
} from '@/api/resources/csi';
import type { QueryParams } from '@/api/types/common';
import type { CSIVolume } from '@/api/types/csi';

export function useVolumes(params?: QueryParams) {
  return useQuery({
    queryKey: ['csi', 'volumes', params],
    queryFn: () => getVolumes(params),
  });
}

export function useVolume(id: string) {
  return useQuery({
    queryKey: ['csi', 'volumes', 'detail', id],
    queryFn: () => getVolume(id),
  });
}

export function usePlugins(params?: QueryParams) {
  return useQuery({
    queryKey: ['csi', 'plugins', params],
    queryFn: () => getPlugins(params),
  });
}

export function usePlugin(id: string) {
  return useQuery({
    queryKey: ['csi', 'plugins', 'detail', id],
    queryFn: () => getPlugin(id),
  });
}

export function useExternalVolumes(params?: QueryParams) {
  return useQuery({
    queryKey: ['csi', 'external-volumes', params],
    queryFn: () => getExternalVolumes(params),
  });
}

export function useSnapshots(params?: QueryParams) {
  return useQuery({
    queryKey: ['csi', 'snapshots', params],
    queryFn: () => getSnapshots(params),
  });
}

export function useCreateVolume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (volume: Partial<CSIVolume>) => createVolume(volume),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csi', 'volumes'] });
    },
  });
}

export function useDeleteVolume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVolume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csi', 'volumes'] });
    },
  });
}
