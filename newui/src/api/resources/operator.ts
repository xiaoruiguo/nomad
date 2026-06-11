import { getNomadClient } from '../client';
import type { QueryParams } from '../types/common';

export interface License {
  License: LicenseInfo;
  Signed: string;
}

export interface LicenseInfo {
  LicenseID: string;
  CustomerID: string;
  InstallationID: string;
  IssueTime: string;
  StartTime: string;
  ExpireTime: string;
  TerminationTime: string;
  Product: string;
  Flags: Record<string, string>;
  Modules: string[];
  Features: string[];
}

export interface AutopilotConfig {
  CleanupDeadServers: boolean;
  LastContactThreshold: string;
  MaxTrailingLogs: number;
  ServerStabilizationTime: string;
  EnableRemounting: boolean;
  EnableCustomUpgrades: boolean;
  CreateIncidents: boolean;
  MinQuorum: number;
  MaxFailedServers: number;
  RedundancyZoneTag: string;
  DisableUpgradeMigration: boolean;
  UpgradeVersionTag: string;
  UpgradeVersionPinned: boolean;
  PromotedIndex: number;
}

export interface ServerHealth {
  ID: string;
  Name: string;
  Address: string;
  SerfStatus: string;
  SerfLatency: ServerLatency;
  Vote: boolean;
  LastContact: string;
  LastTerm: number;
  LastIndex: number;
  Healthy: boolean;
  StableSince: string;
  IsLeader: boolean;
  IsVoter: boolean;
}

export interface ServerLatency {
  Min: number;
  Max: number;
  Avg: number;
}

export interface SchedulerConfig {
  SchedulerAlgorithm: string;
  PreemptionConfig: PreemptionConfig;
  MemoryOversubscription: string;
  RejectJobRegistration: boolean;
  PauseEvalBroker: boolean;
}

export interface PreemptionConfig {
  BatchSchedulerEnabled: boolean;
  ServiceSchedulerEnabled: boolean;
  SysBatchSchedulerEnabled: boolean;
  SystemSchedulerEnabled: boolean;
}

export function getLicense(params?: QueryParams) {
  return getNomadClient().get<License>('/v1/operator/license', params as Record<string, string>);
}

export function getAutopilotConfig(params?: QueryParams) {
  return getNomadClient().get<AutopilotConfig>('/v1/operator/autopilot/config', params as Record<string, string>);
}

export function getServerHealth(params?: QueryParams) {
  return getNomadClient().get<ServerHealth[]>('/v1/operator/autopilot/health', params as Record<string, string>);
}

export function getSchedulerConfig(params?: QueryParams) {
  return getNomadClient().get<SchedulerConfig>('/v1/operator/scheduler/config', params as Record<string, string>);
}
