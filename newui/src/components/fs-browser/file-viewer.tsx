import { useState, useEffect } from 'react'
import { catFile } from '@/api/resources/filesystem'
import { cn } from '@/lib/utils'

interface FileViewerProps {
  allocationId: string
  taskName: string
  path: string
  className?: string
}

export function FileViewer({ allocationId, taskName, path, className }: FileViewerProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    catFile(allocationId, path, { task: taskName })
      .then(({ data }) => {
        if (!cancelled) {
          setContent(typeof data === 'string' ? data : JSON.stringify(data, null, 2))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err as Error).message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [allocationId, taskName, path])

  const handleDownload = () => {
    if (!content) return
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = path.split('/').pop() ?? 'file'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
        <span className="truncate text-xs font-mono text-gray-600">{path}</span>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!content}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-400">
            Loading...
          </div>
        ) : content !== null ? (
          <pre className="whitespace-pre-wrap break-words bg-white p-4 font-mono text-xs leading-5 text-gray-800">
            {content}
          </pre>
        ) : (
          <div className="flex items-center justify-center py-8 text-sm text-gray-400">
            No content
          </div>
        )}
      </div>
    </div>
  )
}
