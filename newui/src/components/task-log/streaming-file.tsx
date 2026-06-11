import { useEffect, useRef } from 'react'
import Anser from 'anser'
import { cn } from '@/lib/utils'

interface StreamingFileProps {
  output: string
  isStreaming: boolean
  follow: boolean
  ansiEnabled: boolean
  className?: string
}

const MAX_OUTPUT_LENGTH = 50000

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function ansiToHtml(text: string): string {
  const anser = new Anser()
  const escaped = escapeHtml(text)
  return anser.process(escaped)
}

export function StreamingFile({
  output,
  isStreaming: _isStreaming,
  follow,
  ansiEnabled,
  className,
}: StreamingFileProps) {
  const containerRef = useRef<HTMLPreElement>(null)

  const displayOutput = output.length > MAX_OUTPUT_LENGTH
    ? output.slice(-MAX_OUTPUT_LENGTH)
    : output

  useEffect(() => {
    if (!follow || !containerRef.current) return
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [output, follow])

  const html = ansiEnabled ? ansiToHtml(displayOutput) : escapeHtml(displayOutput)

  return (
    <pre
      ref={containerRef}
      className={cn(
        'flex-1 overflow-auto bg-[#1e1e2e] p-3 font-mono text-xs leading-5 text-gray-200',
        className
      )}
    >
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  )
}
