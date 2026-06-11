import { useState, useEffect, useCallback } from 'react'
import { listDirectory, type FileInfo } from '@/api/resources/filesystem'
import { cn } from '@/lib/utils'

interface FsBrowserProps {
  allocationId: string
  taskName: string
  className?: string
  onFileSelect?: (path: string) => void
}

export function FsBrowser({ allocationId, taskName, className, onFileSelect }: FsBrowserProps) {
  const [currentPath, setCurrentPath] = useState('/')
  const [entries, setEntries] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDirectory = useCallback(async (path: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await listDirectory(allocationId, path, { task: taskName })
      const sorted = [...(data ?? [])].sort((a, b) => {
        if (a.IsDir && !b.IsDir) return -1
        if (!a.IsDir && b.IsDir) return 1
        return a.Name.localeCompare(b.Name)
      })
      setEntries(sorted)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [allocationId, taskName])

  useEffect(() => {
    fetchDirectory(currentPath)
  }, [currentPath, fetchDirectory])

  const navigateTo = (entry: FileInfo) => {
    if (entry.IsDir) {
      const newPath = currentPath === '/' ? `/${entry.Name}` : `${currentPath}/${entry.Name}`
      setCurrentPath(newPath)
    } else {
      const filePath = currentPath === '/' ? `/${entry.Name}` : `${currentPath}/${entry.Name}`
      onFileSelect?.(filePath)
    }
  }

  const navigateBreadcrumb = (index: number) => {
    if (index === 0) {
      setCurrentPath('/')
      return
    }
    const parts = currentPath.split('/').filter(Boolean)
    setCurrentPath('/' + parts.slice(0, index).join('/'))
  }

  const pathParts = currentPath.split('/').filter(Boolean)
  const breadcrumbs = ['/', ...pathParts]

  return (
    <div className={cn('flex flex-col', className)}>
      <nav className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs overflow-x-auto">
        {breadcrumbs.map((part, i) => (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-400">/</span>}
            <button
              type="button"
              onClick={() => navigateBreadcrumb(i)}
              className={cn(
                'rounded px-1.5 py-0.5 hover:bg-gray-200',
                i === breadcrumbs.length - 1 ? 'font-medium text-gray-800' : 'text-gray-500'
              )}
            >
              {i === 0 ? 'root' : part}
            </button>
          </div>
        ))}
      </nav>

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
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-400">
            Empty directory
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-gray-500">
                <th className="px-3 py-1.5 font-medium">Name</th>
                <th className="px-3 py-1.5 font-medium">Size</th>
                <th className="px-3 py-1.5 font-medium">Modified</th>
              </tr>
            </thead>
            <tbody>
              {currentPath !== '/' && (
                <tr
                  className="cursor-pointer border-b border-gray-50 hover:bg-gray-50"
                  onClick={() => {
                    const parts = currentPath.split('/').filter(Boolean)
                    parts.pop()
                    setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'))
                  }}
                >
                  <td className="px-3 py-1.5 text-gray-500" colSpan={3}>..</td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr
                  key={entry.Name}
                  className={cn(
                    'cursor-pointer border-b border-gray-50 hover:bg-gray-50',
                    entry.IsDir && 'font-medium'
                  )}
                  onClick={() => navigateTo(entry)}
                >
                  <td className="px-3 py-1.5 flex items-center gap-2">
                    {entry.IsDir ? (
                      <svg className="h-3.5 w-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                    ) : (
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {entry.Name}
                  </td>
                  <td className="px-3 py-1.5 text-gray-500">{entry.IsDir ? '-' : formatFileSize(entry.Size)}</td>
                  <td className="px-3 py-1.5 text-gray-500">{entry.ModTime ? new Date(entry.ModTime).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
