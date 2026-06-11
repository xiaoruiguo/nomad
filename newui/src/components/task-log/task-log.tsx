import { useState, useEffect } from 'react'
import { useTaskLog } from '@/hooks/use-task-log'
import { StreamingFile } from './streaming-file'
import { cn } from '@/lib/utils'

interface TaskLogProps {
  allocationId: string
  taskName: string
  type?: 'stdout' | 'stderr'
  className?: string
}

export function TaskLog({
  allocationId,
  taskName,
  type: initialType = 'stdout',
  className,
}: TaskLogProps) {
  const [logType, setLogType] = useState<'stdout' | 'stderr'>(initialType)
  const [follow, setFollow] = useState(true)
  const [streaming, setStreaming] = useState(true)

  const { output, isStreaming, error, startStream, stopStream } = useTaskLog(
    allocationId,
    taskName,
    logType
  )

  useEffect(() => {
    if (streaming) {
      startStream({ follow })
    } else {
      startStream({ follow: false })
    }
    return () => {
      stopStream()
    }
  }, [allocationId, taskName, logType, streaming, follow, startStream, stopStream])

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-gray-200 p-0.5">
            <button
              type="button"
              onClick={() => setLogType('stdout')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                logType === 'stdout' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              stdout
            </button>
            <button
              type="button"
              onClick={() => setLogType('stderr')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                logType === 'stderr' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              stderr
            </button>
          </div>
          <div className="flex items-center rounded-lg border border-gray-200 p-0.5">
            <button
              type="button"
              onClick={() => setStreaming(true)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                streaming ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Streaming
            </button>
            <button
              type="button"
              onClick={() => setStreaming(false)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                !streaming ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Head
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={follow}
              onChange={(e) => setFollow(e.target.checked)}
              className="rounded border-gray-300"
            />
            Follow
          </label>
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Live
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <StreamingFile
        output={output}
        isStreaming={isStreaming}
        follow={follow}
        ansiEnabled={true}
      />
    </div>
  )
}
