import { useEffect, useRef, useState } from 'react'
import { useAgentHealth } from '@/api/hooks'
import { StreamingFile } from '@/components/task-log/streaming-file'
import { Badge } from '@/components/ui/badge'

interface NodeMonitorProps {
  nodeId: string
}

export function NodeMonitor({ nodeId }: NodeMonitorProps) {
  const { data: healthData, isLoading: healthLoading } = useAgentHealth()
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const serverHealth = healthData?.data?.Server
  const serfHealth = healthData?.data?.Serf
  const raftHealth = healthData?.data?.Raft

  useEffect(() => {
    const startStream = async () => {
      setIsStreaming(true)
      setError(null)
      const abort = new AbortController()
      abortRef.current = abort

      try {
        const token = localStorage.getItem('nomad_token') ?? ''
        const headers: Record<string, string> = {}
        if (token) headers['X-Nomad-Token'] = token

        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
        const host = window.location.host
        const url = `${protocol}//${host}/v1/client/fs/logs/${nodeId}?follow=true&task=nomad&type=stdout`

        const response = await fetch(url, { headers, signal: abort.signal })
        if (!response.ok) {
          throw new Error(`Failed to connect: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No readable stream')

        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value, { stream: true })
          setOutput((prev) => prev + text)
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message)
        }
      } finally {
        setIsStreaming(false)
      }
    }

    startStream()

    return () => {
      abortRef.current?.abort()
    }
  }, [nodeId])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-xs text-neutral-500">Server</div>
          <div className="mt-1">
            {healthLoading ? (
              <span className="text-xs text-neutral-400">Loading...</span>
            ) : serverHealth?.ok ? (
              <Badge variant="success" size="sm">Healthy</Badge>
            ) : (
              <Badge variant="danger" size="sm">{serverHealth?.message || 'Unhealthy'}</Badge>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-xs text-neutral-500">Serf</div>
          <div className="mt-1">
            {healthLoading ? (
              <span className="text-xs text-neutral-400">Loading...</span>
            ) : serfHealth?.ok ? (
              <Badge variant="success" size="sm">Healthy</Badge>
            ) : (
              <Badge variant="danger" size="sm">{serfHealth?.message || 'Unhealthy'}</Badge>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-xs text-neutral-500">Raft</div>
          <div className="mt-1">
            {healthLoading ? (
              <span className="text-xs text-neutral-400">Loading...</span>
            ) : raftHealth?.ok ? (
              <Badge variant="success" size="sm">Healthy</Badge>
            ) : (
              <Badge variant="danger" size="sm">{raftHealth?.message || 'Unhealthy'}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Agent Monitor</span>
          <div className="flex items-center gap-2">
            {isStreaming && (
              <span className="flex items-center gap-1 text-xs text-success-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-500" />
                Streaming
              </span>
            )}
          </div>
        </div>
        {error && (
          <div className="border-b border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">
            {error}
          </div>
        )}
        <StreamingFile
          output={output}
          isStreaming={isStreaming}
          follow={true}
          ansiEnabled={true}
        />
      </div>
    </div>
  )
}
