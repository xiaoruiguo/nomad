import { getNomadClient } from '../client';
import type { AgentSelf, AgentMember, AgentServer, AgentHealth } from '../types/agent';
import type { QueryParams } from '../types/common';

export function getAgentSelf(params?: QueryParams) {
  return getNomadClient().get<AgentSelf>('/v1/agent/self', params as Record<string, string>);
}

export function getAgentMembers(params?: QueryParams) {
  return getNomadClient().get<AgentMember[]>('/v1/agent/members', params as Record<string, string>);
}

export function getAgentServers(params?: QueryParams) {
  return getNomadClient().get<AgentServer[]>('/v1/agent/servers', params as Record<string, string>);
}

export function getAgentHealth(params?: QueryParams) {
  return getNomadClient().get<AgentHealth>('/v1/agent/health', params as Record<string, string>);
}

export function monitorAgent(params?: QueryParams & { log_level?: string }) {
  return getNomadClient().stream('/v1/agent/monitor', params as Record<string, string>);
}
