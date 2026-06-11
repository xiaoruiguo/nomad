import { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useWebSocket } from '@/hooks/use-websocket'
import { useResizeObserver } from '@/hooks/use-resize-observer'
import { cn } from '@/lib/utils'
import '@xterm/xterm/css/xterm.css'

interface ExecTerminalProps {
  allocationId: string
  task: string
  command?: string
  className?: string
}

export function ExecTerminal({ allocationId, task, command = '/bin/sh', className }: ExecTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const sizeRef = useRef({ width: 0, height: 0 })

  const { isConnected, output, error, connect, sendStdin, sendTtySize, disconnect } = useWebSocket()

  const containerSize = useResizeObserver(terminalRef)

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (isConnected) {
        e.preventDefault()
      }
    },
    [isConnected]
  )

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [handleBeforeUnload])

  useEffect(() => {
    if (!terminalRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e2e',
        foreground: '#cdd6f4',
        cursor: '#f5e0dc',
      },
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.current)

    fitAddon.fit()

    termRef.current = term
    fitAddonRef.current = fitAddon

    term.onData((data) => {
      sendStdin(data)
    })

    term.onResize(({ cols, rows }) => {
      sendTtySize(cols, rows)
    })

    return () => {
      term.dispose()
      termRef.current = null
      fitAddonRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!termRef.current || !isConnected) return
    for (const chunk of output) {
      termRef.current.write(chunk)
    }
  }, [output, isConnected])

  useEffect(() => {
    if (error && termRef.current) {
      termRef.current.write(`\r\n\x1b[31mError: ${error}\x1b[0m\r\n`)
    }
  }, [error])

  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return
    if (
      containerSize.width === sizeRef.current.width &&
      containerSize.height === sizeRef.current.height
    ) {
      return
    }
    sizeRef.current = { width: containerSize.width, height: containerSize.height }
    fitAddonRef.current?.fit()
  }, [containerSize])

  useEffect(() => {
    const token = localStorage.getItem('nomad_token') ?? ''
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.host}/v1/client/exec/${allocationId}?task=${encodeURIComponent(task)}&tty=true&command=${encodeURIComponent(command)}`
    connect(wsUrl, token)

    return () => {
      disconnect()
    }
  }, [allocationId, task, command, connect, disconnect])

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            )}
          />
          <span className="text-xs text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {task}@{allocationId.slice(0, 8)}
        </span>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 bg-[#1e1e2e]"
        style={{ minHeight: 300 }}
      />
    </div>
  )
}
