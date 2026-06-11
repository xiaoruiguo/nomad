import { getNomadClient } from '../client';
import type { QueryParams } from '../types/common';

export interface FileInfo {
  Name: string;
  IsDir: boolean;
  Size: number;
  FileMode: string;
  ModTime: string;
}

export interface StatInfo {
  Name: string;
  IsDir: boolean;
  Size: number;
  FileMode: string;
  ModTime: string;
}

export function listDirectory(allocID: string, path?: string, params?: QueryParams) {
  return getNomadClient().get<FileInfo[]>(`/v1/client/fs/ls/${allocID}`, { path: path || '', ...(params as Record<string, string>) });
}

export function statFile(allocID: string, path?: string, params?: QueryParams) {
  return getNomadClient().get<StatInfo>(`/v1/client/fs/stat/${allocID}`, { path: path || '', ...(params as Record<string, string>) });
}

export function readFile(allocID: string, path: string, params?: QueryParams) {
  return getNomadClient().get<string>(`/v1/client/fs/cat/${allocID}`, { path, ...(params as Record<string, string>) });
}

export function streamFile(allocID: string, path: string, params?: QueryParams) {
  return getNomadClient().stream(`/v1/client/fs/stream/${allocID}`, { path, ...(params as Record<string, string>) });
}

export function catFile(allocID: string, path: string, params?: QueryParams) {
  return getNomadClient().get<string>(`/v1/client/fs/cat/${allocID}`, { path, ...(params as Record<string, string>) });
}

export function streamLogs(allocID: string, params?: QueryParams & { task?: string; type?: string; follow?: boolean; origin?: string; offset?: number }) {
  return getNomadClient().stream(`/v1/client/fs/logs/${allocID}`, params as Record<string, string>);
}
