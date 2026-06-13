import { useQuery } from '@tanstack/react-query';
import { getNodePools } from '@/api/resources/node-pools';

export function useNodePools() {
  return useQuery({
    queryKey: ['node-pools'],
    queryFn: () => getNodePools().then((r) => r.data),
    staleTime: 60_000,
  });
}
