import { useEffect, useRef, useState } from 'react'
import { StreamingFile } from '@/components/task-log/streaming-file'
import { cn } from '@/lib/utils'

interface AgentMonitorProps {
  agentId: string
}

const LOG_LEVELS = [
  { value: '', label: 'All' },
  { value: 'TRACE', label: 'Trace' },
  { value: 'DEBUG', label: 'Debug' },
  { value: 'INFO', label: 'Info' },
  { value: 'WARN', label: 'Warn' },
  { value: 'ERROR', label: 'Error' },
]

export function AgentMonitor({ agentId }: AgentMonitorProps) {
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logLevel, setLogLevel] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const startStream = async () => {
      setIsStreaming(true)
      setError(null)
      setOutput('')
      const abort = new AbortController()
      abortRef.current = abort

      try {
        const token = localStorage.getItem('nomad_token') ?? ''
        const headers: Record<string, string> = {}
        if (token) headers['X-Nomad-Token'] = token

        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
        const host = window.location.host
        let url = `${protocol}//${host}/v1/agent/monitor?follow=true`
        if (logLevel) url += `&log_level=${logLevel}`

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
  }, [agentId, logLevel])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Log Level</span>
        <div className="flex items-center rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-700">
          {LOG_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setLogLevel(level.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                logLevel === level.value
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
              )}
            >
              {level.label}
            </button>
          ))}
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
