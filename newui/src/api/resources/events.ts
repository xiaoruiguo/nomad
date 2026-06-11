import { getNomadClient } from '../client';
import type { QueryParams } from '../types/common';

export interface Event {
  Topic: string;
  Type: string;
  Key: string;
  Namespace: string;
  FilterKeys: string[];
  Index: number;
  Payload: Record<string, unknown>;
}

export interface EventStreamParams extends QueryParams {
  topics?: string;
  index?: number;
}

export function streamEvents(topics?: Record<string, string[]>, index?: number, params?: QueryParams) {
  const topicStr = topics
    ? Object.entries(topics)
        .map(([topic, keys]) => `${topic}:${keys.join(',')}`)
        .join(',')
    : '*:*';

  const streamParams: Record<string, string> = {
    topics: topicStr,
    ...(index !== undefined ? { index: String(index) } : {}),
    ...(params as Record<string, string>),
  };

  return getNomadClient().stream('/v1/event/stream', streamParams);
}
