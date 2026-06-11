import { useQuery } from '@tanstack/react-query';
import { getScalingPolicies, getScalingPolicy } from '@/api/resources/scaling';
import type { QueryParams } from '@/api/types/common';

export function useScalingPolicies(params?: QueryParams) {
  return useQuery({
    queryKey: ['scaling', 'policies', params],
    queryFn: () => getScalingPolicies(params),
  });
}

export function useScalingPolicy(id: string) {
  return useQuery({
    queryKey: ['scaling', 'policy', id],
    queryFn: () => getScalingPolicy(id),
  });
}
