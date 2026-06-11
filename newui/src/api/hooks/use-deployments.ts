import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDeployments,
  getDeployment,
  getDeploymentAllocations,
  failDeployment,
  pauseDeployment,
  promoteDeployment,
  setAllocationHealth,
  unblockDeployment,
} from '@/api/resources/deployments';
import type { QueryParams } from '@/api/types/common';
import type { DeploymentPauseRequest, DeploymentPromoteRequest, DeploymentAllocHealthRequest } from '@/api/types/deployment';

export function useDeployments(params?: QueryParams) {
  return useQuery({
    queryKey: ['deployments', 'list', params],
    queryFn: () => getDeployments(params),
  });
}

export function useDeployment(id: string) {
  return useQuery({
    queryKey: ['deployments', 'detail', id],
    queryFn: () => getDeployment(id),
  });
}

export function useDeploymentAllocations(id: string) {
  return useQuery({
    queryKey: ['deployments', 'allocations', id],
    queryFn: () => getDeploymentAllocations(id),
  });
}

export function useFailDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => failDeployment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
}

export function usePauseDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: DeploymentPauseRequest }) => pauseDeployment(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deployments', 'detail', variables.id] });
    },
  });
}

export function usePromoteDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: DeploymentPromoteRequest }) => promoteDeployment(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deployments', 'detail', variables.id] });
    },
  });
}

export function useSetAllocationHealth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: DeploymentAllocHealthRequest }) => setAllocationHealth(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deployments', 'detail', variables.id] });
    },
  });
}

export function useUnblockDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => unblockDeployment(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deployments', 'detail', variables.id] });
    },
  });
}
