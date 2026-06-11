import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SSEClient } from '@/lib/sse-client'
import { getAuthToken } from '@/api/client'

type EventTopic = 'Deployment' | 'Evaluation' | 'Allocation' | 'Job' | 'Node' | 'NodePool' | 'Service' | '*'

interface EventStreamEvent {
  Topic: EventTopic
  Type: string
  Key: string
  FilterKeys: string[]
  Index: number
  Payload: Record<string, unknown>
}

interface UseEventStreamOptions {
  topics: { topic: EventTopic; key?: string }[]
  index?: number
  enabled?: boolean
  onEvent: (event: EventStreamEvent) => void
}

const TOPIC_QUERY_MAP: Record<string, string[]> = {
  Deployment: ['deployments'],
  Evaluation: ['evaluations'],
  Allocation: ['allocations'],
  Job: ['jobs'],
  Node: ['nodes'],
  NodePool: ['node-pools'],
  Service: ['services'],
}

export function useEventStream({ topics, index, enabled = true, onEvent }: UseEventStreamOptions) {
  const queryClient = useQueryClient()
  const clientRef = useRef<SSEClient | null>(null)

  const invalidateCache = useCallback((topic: string) => {
    const queryKeys = TOPIC_QUERY_MAP[topic]
    if (queryKeys) {
      for (const key of queryKeys) {
        queryClient.invalidateQueries({ queryKey: [key] })
      }
    }
  }, [queryClient])

  useEffect(() => {
    const token = getAuthToken()
    if (!enabled || !token) return

    const params = new URLSearchParams()
    for (const t of topics) {
      const value = t.key ? `${t.topic}:${t.key}` : t.topic
      params.append('topic', value)
    }
    if (index !== undefined) {
      params.set('index', String(index))
    }

    const url = `/v1/event_stream?${params.toString()}`
    const client = new SSEClient()
    clientRef.current = client

    void client.connect(
      url,
      { 'X-Nomad-Token': token },
      (event: Record<string, unknown>) => {
        const typedEvent = event as unknown as EventStreamEvent
        onEvent(typedEvent)
        invalidateCache(typedEvent.Topic)
      },
      (err: Error) => {
        console.error('Event stream error:', err)
      }
    )

    return () => {
      client.disconnect()
      clientRef.current = null
    }
  }, [enabled, topics, index, onEvent, invalidateCache])
}

export type { EventTopic, EventStreamEvent, UseEventStreamOptions }
