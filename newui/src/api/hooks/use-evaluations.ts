import { useBlockingQuery } from '@/hooks/use-blocking-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEvaluation,
  deleteEvaluation,
} from '@/api/resources/evaluations';
import { toParamsRecord } from '@/api/types/common';
import type { QueryParams } from '@/api/types/common';

export function useEvaluations(params?: QueryParams) {
  return useBlockingQuery(
    ['evaluations', 'list', JSON.stringify(params)],
    '/v1/evaluations',
    { params: toParamsRecord(params) }
  );
}

export function useEvaluation(id: string) {
  return useQuery({
    queryKey: ['evaluations', 'detail', id],
    queryFn: () => getEvaluation(id),
  });
}

export function useDeleteEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvaluation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    },
  });
}
