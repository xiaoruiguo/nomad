import { useQuery } from '@tanstack/react-query';
import { getAgentSelf, getAgentMembers, getAgentServers, getAgentHealth } from '@/api/resources/agent';
import { useAuthStore } from '@/stores/auth-store';

export function useAgentSelf() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['agent', 'self'],
    queryFn: () => getAgentSelf(),
    enabled: !!token,
  });
}

export function useAgentMembers() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['agent', 'members'],
    queryFn: () => getAgentMembers(),
    enabled: !!token,
  });
}

export function useAgentServers() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['agent', 'servers'],
    queryFn: () => getAgentServers(),
    enabled: !!token,
  });
}

export function useAgentHealth() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['agent', 'health'],
    queryFn: () => getAgentHealth(),
    refetchInterval: 10000,
    enabled: !!token,
  });
}
