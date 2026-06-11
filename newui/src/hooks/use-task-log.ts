import { useState, useRef, useCallback, useEffect } from 'react'
import { decodeFrames } from '@/lib/stream-frames'
import { getAuthToken } from '@/api/client'

const MAX_OUTPUT_LENGTH = 50000

interface UseTaskLogReturn {
  output: string
  isStreaming: boolean
  error: string | null
  offset: number
  startStream: (opts?: { follow?: boolean; useServer?: boolean }) => void
  stopStream: () => void
}

export function useTaskLog(
  allocationId: string,
  taskName: string,
  type: 'stdout' | 'stderr' = 'stdout'
): UseTaskLogReturn {
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)

  const abortRef = useRef<AbortController | null>(null)
  const bufferRef = useRef('')

  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }, [])

  const doFetch = useCallback(
    async (url: string, signal: AbortSignal, _isFollow: boolean) => {
      const token = getAuthToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers['X-Nomad-Token'] = token
      }

      const res = await fetch(url, { signal, headers })
      if (!res.ok) {
        throw new Error(`Log fetch failed: ${res.status} ${res.statusText}`)
      }

      if (!res.body) {
        throw new Error('Response body is null')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        bufferRef.current += decoder.decode(value, { stream: true })

        const { decoded, remaining } = decodeFrames(bufferRef.current)
        bufferRef.current = remaining

        for (const frame of decoded) {
          setOutput((prev) => {
            const next = prev + frame.Data
            return next.length > MAX_OUTPUT_LENGTH ? next.slice(-MAX_OUTPUT_LENGTH) : next
          })
          setOffset(frame.Offset)
        }
      }
    },
    []
  )

  const startStream = useCallback(
    (opts?: { follow?: boolean; useServer?: boolean }) => {
      stopStream()
      setOutput('')
      setError(null)
      setOffset(0)
      bufferRef.current = ''

      const follow = opts?.follow ?? true
      const useServer = opts?.useServer ?? false
      const abortController = new AbortController()
      abortRef.current = abortController

      setIsStreaming(true)

      const params = new URLSearchParams({
        task: taskName,
        type,
        follow: String(follow),
        plain: 'true',
      })

      const url = `/v1/client/fs/logs/${allocationId}?${params.toString()}`

      doFetch(url, abortController.signal, follow).catch(async (err) => {
        if (abortController.signal.aborted) return

        if (!useServer) {
          try {
            const serverParams = new URLSearchParams({
              task: taskName,
              type,
              follow: String(follow),
              plain: 'true',
            })
            const serverUrl = `/v1/client/fs/logs/${allocationId}?${serverParams.toString()}`
            await doFetch(serverUrl, abortController.signal, follow)
            return
          } catch {
            // Server failover also failed
          }
        }

        setError((err as Error).message)
        setIsStreaming(false)
      })
    },
    [allocationId, taskName, type, doFetch, stopStream]
  )

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  return { output, isStreaming, error, offset, startStream, stopStream }
}
