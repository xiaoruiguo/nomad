import { useRef, useState, useCallback, useEffect } from 'react'
import { NomadWebSocket } from '@/lib/websocket-client'

interface UseWebSocketReturn {
  isConnected: boolean
  output: string[]
  error: string | null
  connect: (url: string, authToken: string) => void
  sendStdin: (data: string) => void
  sendTtySize: (w: number, h: number) => void
  disconnect: () => void
}

const MAX_RECONNECT_DELAY = 30000
const BASE_RECONNECT_DELAY = 1000

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<NomadWebSocket | null>(null)
  const reconnectAttemptRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const urlRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const mountedRef = useRef(true)

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  const attemptReconnect = useCallback(() => {
    if (!mountedRef.current || !urlRef.current) return
    const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptRef.current), MAX_RECONNECT_DELAY)
    reconnectAttemptRef.current += 1
    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current && urlRef.current && tokenRef.current) {
        wsRef.current?.disconnect()
        const ws = new NomadWebSocket()
        wsRef.current = ws
        ws.connect(urlRef.current, tokenRef.current)
      }
    }, delay)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearReconnectTimer()
      wsRef.current?.disconnect()
    }
  }, [clearReconnectTimer])

  const connect = useCallback((url: string, authToken: string) => {
    urlRef.current = url
    tokenRef.current = authToken
    reconnectAttemptRef.current = 0
    clearReconnectTimer()

    const ws = new NomadWebSocket()
    wsRef.current = ws

    ws.onOpen = () => {
      if (!mountedRef.current) return
      setIsConnected(true)
      setError(null)
      reconnectAttemptRef.current = 0
    }

    ws.onMessage = (data: string) => {
      if (!mountedRef.current) return
      setOutput((prev) => [...prev, data])
    }

    ws.onError = (err: string) => {
      if (!mountedRef.current) return
      setError(err)
    }

    ws.onClose = () => {
      if (!mountedRef.current) return
      setIsConnected(false)
      attemptReconnect()
    }

    ws.connect(url, authToken)
  }, [clearReconnectTimer, attemptReconnect])

  const sendStdin = useCallback((data: string) => {
    wsRef.current?.sendStdin(data)
  }, [])

  const sendTtySize = useCallback((w: number, h: number) => {
    wsRef.current?.sendTtySize(w, h)
  }, [])

  const disconnect = useCallback(() => {
    urlRef.current = null
    tokenRef.current = null
    clearReconnectTimer()
    wsRef.current?.disconnect()
    wsRef.current = null
    setIsConnected(false)
    setOutput([])
    setError(null)
  }, [clearReconnectTimer])

  return { isConnected, output, error, connect, sendStdin, sendTtySize, disconnect }
}
