import { useBlockingQuery } from '@/hooks/use-blocking-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllocationStats,
  getAllocationChecks,
  getAllocationServices,
  stopAllocation,
  restartAllocation,
  signalAllocation,
  pauseAllocation,
} from '@/api/resources/allocations';
import { toParamsRecord, type QueryParams } from '@/api/types/common';

export function useAllocations(params?: QueryParams) {
  return useBlockingQuery(
    ['allocations', 'list', JSON.stringify(params)],
    '/v1/allocations',
    { params: toParamsRecord(params) }
  );
}

export function useAllocation(id: string) {
  return useBlockingQuery(
    ['allocations', 'detail', id],
    `/v1/allocation/${id}`,
  );
}

export function useAllocationStats(id: string) {
  return useQuery({
    queryKey: ['allocations', 'stats', id],
    queryFn: () => getAllocationStats(id),
    refetchInterval: 2000,
  });
}

export function useAllocationChecks(id: string) {
  return useQuery({
    queryKey: ['allocations', 'checks', id],
    queryFn: () => getAllocationChecks(id),
  });
}

export function useAllocationServices(id: string) {
  return useQuery({
    queryKey: ['allocations', 'services', id],
    queryFn: () => getAllocationServices(id),
  });
}

export function useStopAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stopAllocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
    },
  });
}

export function useRestartAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, taskName }: { id: string; taskName?: string }) => restartAllocation(id, taskName),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allocations', 'detail', variables.id] });
    },
  });
}

export function useSignalAllocation() {
  return useMutation({
    mutationFn: ({ id, signal, taskName }: { id: string; signal: string; taskName?: string }) =>
      signalAllocation(id, signal, taskName),
  });
}

export function usePauseAllocation() {
  return useMutation({
    mutationFn: ({ id, pause }: { id: string; pause: boolean }) => pauseAllocation(id, pause),
  });
}
