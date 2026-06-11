import { getNomadClient } from '../client';
import type { QueryParams } from '../types/common';

export interface SearchResult {
  ID: string;
  Scope: string;
  Context: string;
  Matches: SearchMatch[];
}

export interface SearchMatch {
  ID: string;
  Score: number;
  Context: string;
}

export interface SearchResponse {
  Matches: Record<string, SearchResult[]>;
  Truncations: Record<string, boolean>;
}

export function search(prefix: string, context?: string[], params?: QueryParams) {
  const searchParams: Record<string, string> = {
    prefix,
    ...(context ? { context: context.join(',') } : {}),
    ...(params as Record<string, string>),
  };
  return getNomadClient().post<SearchResponse>('/v1/search', { Prefix: prefix, Context: context }, searchParams);
}

export function fuzzySearch(text: string, context?: string[], params?: QueryParams) {
  const searchParams: Record<string, string> = {
    text,
    ...(context ? { context: context.join(',') } : {}),
    ...(params as Record<string, string>),
  };
  return getNomadClient().post<SearchResponse>('/v1/search/fuzzy', { Text: text, Context: context }, searchParams);
}
