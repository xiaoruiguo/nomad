import { useCallback } from 'react';
import { useEventStream as useEventStreamBase, type EventTopic, type EventStreamEvent } from '@/hooks/use-event-stream';

export function useEventStream(
  topics?: { topic: EventTopic; key?: string }[],
  onEvent?: (event: EventStreamEvent) => void,
) {
  const defaultTopics = topics ?? [{ topic: '*' as EventTopic }];
  const handleEvent = useCallback(
    (event: EventStreamEvent) => {
      onEvent?.(event);
    },
    [onEvent],
  );

  useEventStreamBase({
    topics: defaultTopics,
    onEvent: handleEvent,
  });
}
