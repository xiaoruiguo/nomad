import { useBlockingQuery } from '@/hooks/use-blocking-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVariable,
  createVariable,
  updateVariable,
  deleteVariable,
} from '@/api/resources/variables';
import { toParamsRecord, type QueryParams } from '@/api/types/common';
import type { Variable } from '@/api/types/variable';

export function useVariables(params?: QueryParams) {
  return useBlockingQuery(
    ['variables', 'list', JSON.stringify(params)],
    '/v1/vars',
    { params: toParamsRecord(params) }
  );
}

export function useVariable(path: string) {
  return useQuery({
    queryKey: ['variables', 'detail', path],
    queryFn: () => getVariable(path),
  });
}

export function useCreateVariable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ path, variable }: { path: string; variable: Partial<Variable> }) => createVariable(path, variable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables'] });
    },
  });
}

export function useUpdateVariable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ path, variable }: { path: string; variable: Partial<Variable> }) => updateVariable(path, variable),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['variables', 'detail', variables.path] });
    },
  });
}

export function useDeleteVariable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (path: string) => deleteVariable(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables'] });
    },
  });
}
