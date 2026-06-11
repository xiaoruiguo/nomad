import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getTokens,
  getToken,
  getSelfToken,
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getAuthMethods,
  createToken,
  updateToken,
  deleteToken,
  bootstrapACL,
} from '@/api/resources/acl';
import type { QueryParams } from '@/api/types/common';
import type { ACLPolicy, ACLToken, ACLRole } from '@/api/types/acl';

export function usePolicies(params?: QueryParams) {
  return useQuery({
    queryKey: ['acl', 'policies', params],
    queryFn: () => getPolicies(params),
  });
}

export function usePolicy(name: string) {
  return useQuery({
    queryKey: ['acl', 'policies', 'detail', name],
    queryFn: () => getPolicy(name),
  });
}

export function useTokens(params?: QueryParams) {
  return useQuery({
    queryKey: ['acl', 'tokens', params],
    queryFn: () => getTokens(params),
  });
}

export function useToken(id: string) {
  return useQuery({
    queryKey: ['acl', 'tokens', 'detail', id],
    queryFn: () => getToken(id),
  });
}

export function useSelfToken() {
  return useQuery({
    queryKey: ['acl', 'tokens', 'self'],
    queryFn: () => getSelfToken(),
  });
}

export function useRoles(params?: QueryParams) {
  return useQuery({
    queryKey: ['acl', 'roles', params],
    queryFn: () => getRoles(params),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ['acl', 'roles', 'detail', id],
    queryFn: () => getRole(id),
  });
}

export function useAuthMethods(params?: QueryParams) {
  return useQuery({
    queryKey: ['acl', 'auth-methods', params],
    queryFn: () => getAuthMethods(params),
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, policy }: { name: string; policy: ACLPolicy }) => createPolicy(name, policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acl', 'policies'] });
    },
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, policy }: { name: string; policy: ACLPolicy }) => updatePolicy(name, policy),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acl', 'policies', 'detail', variables.name] });
    },
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deletePolicy(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acl', 'policies'] });
    },
  });
}

export function useCreateToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: Partial<ACLToken>) => createToken(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acl', 'tokens'] });
    },
  });
}

export function useUpdateToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }: { id: string; token: Partial<ACLToken> }) => updateToken(id, token),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acl', 'tokens', 'detail', variables.id] });
    },
  });
}

export function useDeleteToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acl', 'tokens'] });
    },
  });
}

export function useBootstrapACL() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bootstrapACL(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acl'] });
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: Partial<ACLRole>) => createRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acl', 'roles'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Partial<ACLRole> }) => updateRole(id, role),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acl', 'roles', 'detail', variables.id] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acl', 'roles'] });
    },
  });
}
