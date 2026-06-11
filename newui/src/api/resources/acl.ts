import { getNomadClient } from '../client';
import type { ACLToken, ACLTokenListStub, ACLPolicy, ACLRole, ACLAuthMethod, ACLLoginRequest, OIDCAuthURLRequest, OIDCAuthURLResponse, OIDCCompleteAuthRequest, OIDCCompleteAuthResponse, OneTimeToken } from '../types/acl';
import type { QueryParams } from '../types/common';

export function getPolicies(params?: QueryParams) {
  return getNomadClient().get<ACLPolicy[]>('/v1/acl/policies', params as Record<string, string>);
}

export function getPolicy(name: string, params?: QueryParams) {
  return getNomadClient().get<ACLPolicy>(`/v1/acl/policy/${name}`, params as Record<string, string>);
}

export function createPolicy(name: string, policy: ACLPolicy, params?: QueryParams) {
  return getNomadClient().put<unknown>(`/v1/acl/policy/${name}`, policy, params as Record<string, string>);
}

export function updatePolicy(name: string, policy: ACLPolicy, params?: QueryParams) {
  return getNomadClient().put<unknown>(`/v1/acl/policy/${name}`, policy, params as Record<string, string>);
}

export function deletePolicy(name: string, params?: QueryParams) {
  return getNomadClient().delete<unknown>(`/v1/acl/policy/${name}`, params as Record<string, string>);
}

export function getTokens(params?: QueryParams) {
  return getNomadClient().get<ACLTokenListStub[]>('/v1/acl/tokens', params as Record<string, string>);
}

export function getToken(id: string, params?: QueryParams) {
  return getNomadClient().get<ACLToken>(`/v1/acl/token/${id}`, params as Record<string, string>);
}

export function createToken(token: Partial<ACLToken>, params?: QueryParams) {
  return getNomadClient().post<ACLToken>('/v1/acl/tokens', token, params as Record<string, string>);
}

export function updateToken(id: string, token: Partial<ACLToken>, params?: QueryParams) {
  return getNomadClient().post<ACLToken>(`/v1/acl/token/${id}`, token, params as Record<string, string>);
}

export function deleteToken(id: string, params?: QueryParams) {
  return getNomadClient().delete<unknown>(`/v1/acl/token/${id}`, params as Record<string, string>);
}

export function bootstrapACL(params?: QueryParams) {
  return getNomadClient().post<ACLToken>('/v1/acl/bootstrap', undefined, params as Record<string, string>);
}

export function getSelfToken(params?: QueryParams) {
  return getNomadClient().get<ACLToken>('/v1/acl/token/self', params as Record<string, string>);
}

export function getRoles(params?: QueryParams) {
  return getNomadClient().get<ACLRole[]>('/v1/acl/roles', params as Record<string, string>);
}

export function getRole(id: string, params?: QueryParams) {
  return getNomadClient().get<ACLRole>(`/v1/acl/role/${id}`, params as Record<string, string>);
}

export function createRole(role: Partial<ACLRole>, params?: QueryParams) {
  return getNomadClient().post<ACLRole>('/v1/acl/roles', role, params as Record<string, string>);
}

export function updateRole(id: string, role: Partial<ACLRole>, params?: QueryParams) {
  return getNomadClient().post<ACLRole>(`/v1/acl/role/${id}`, role, params as Record<string, string>);
}

export function deleteRole(id: string, params?: QueryParams) {
  return getNomadClient().delete<unknown>(`/v1/acl/role/${id}`, params as Record<string, string>);
}

export function getAuthMethods(params?: QueryParams) {
  return getNomadClient().get<ACLAuthMethod[]>('/v1/acl/auth-methods', params as Record<string, string>);
}

export function getAuthMethod(name: string, params?: QueryParams) {
  return getNomadClient().get<ACLAuthMethod>(`/v1/acl/auth-method/${name}`, params as Record<string, string>);
}

export function getOIDCAuthURL(request: OIDCAuthURLRequest, params?: QueryParams) {
  return getNomadClient().post<OIDCAuthURLResponse>(`/v1/acl/auth-method/${request.AuthMethodName}/oidc/auth-url`, request, params as Record<string, string>);
}

export function completeOIDCAuth(request: OIDCCompleteAuthRequest, params?: QueryParams) {
  return getNomadClient().post<OIDCCompleteAuthResponse>(`/v1/acl/auth-method/${request.AuthMethodName}/oidc/complete-auth`, request, params as Record<string, string>);
}

export function login(request: ACLLoginRequest, params?: QueryParams) {
  return getNomadClient().post<ACLToken>(`/v1/acl/login`, request, params as Record<string, string>);
}

export function createOneTimeToken(params?: QueryParams) {
  return getNomadClient().post<OneTimeToken>('/v1/acl/one-time-token', undefined, params as Record<string, string>);
}

export function exchangeOneTimeToken(token: string, params?: QueryParams) {
  return getNomadClient().post<ACLToken>('/v1/acl/token/onetime-exchange', { OneTimeSecretID: token }, params as Record<string, string>);
}
