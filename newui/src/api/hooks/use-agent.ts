import { useQuery } from '@tanstack/react-query';
import { getAgentSelf, getAgentMembers, getAgentServers, getAgentHealth } from '@/api/resources/agent';

export function useAgentSelf() {
  return useQuery({
    queryKey: ['agent', 'self'],
    queryFn: () => getAgentSelf(),
  });
}

export function useAgentMembers() {
  return useQuery({
    queryKey: ['agent', 'members'],
    queryFn: () => getAgentMembers(),
  });
}

export function useAgentServers() {
  return useQuery({
    queryKey: ['agent', 'servers'],
    queryFn: () => getAgentServers(),
  });
}

export function useAgentHealth() {
  return useQuery({
    queryKey: ['agent', 'health'],
    queryFn: () => getAgentHealth(),
    refetchInterval: 10000,
  });
}
