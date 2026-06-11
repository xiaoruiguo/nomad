import { useBlockingQuery } from '@/hooks/use-blocking-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  drainNode,
  toggleEligibility,
  purgeNode,
  evaluateNode,
} from '@/api/resources/nodes';
import { toParamsRecord, type QueryParams } from '@/api/types/common';
import type { NodeDrainRequest, NodeEligibilityRequest } from '@/api/types/node';

export function useNodes(params?: QueryParams) {
  return useBlockingQuery(
    ['nodes', 'list', JSON.stringify(params)],
    '/v1/nodes',
    { params: toParamsRecord(params), throttleMs: 5000 }
  );
}

export function useNode(id: string) {
  return useBlockingQuery(
    ['nodes', 'detail', id],
    `/v1/node/${id}`,
  );
}

export function useNodeAllocations(id: string, params?: QueryParams) {
  return useBlockingQuery(
    ['nodes', 'allocations', id, JSON.stringify(params)],
    `/v1/node/${id}/allocations`,
    { params: toParamsRecord(params) }
  );
}

export function useDrainNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: NodeDrainRequest }) => drainNode(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nodes', 'detail', variables.id] });
    },
  });
}

export function useToggleEligibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: NodeEligibilityRequest }) => toggleEligibility(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nodes', 'detail', variables.id] });
    },
  });
}

export function usePurgeNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purgeNode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
    },
  });
}

export function useEvaluateNode() {
  return useMutation({
    mutationFn: (id: string) => evaluateNode(id),
  });
}
