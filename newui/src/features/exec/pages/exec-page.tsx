import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useJob, useJobAllocations } from '@/api/hooks'
import { PageLayout } from '@/components/layout/page-layout'
import { ExecTerminal } from '@/components/exec/exec-terminal'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { AllocListStub } from '@/api/types/allocation'

export function ExecPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const [searchParams] = useSearchParams()
  const preselectedTask = searchParams.get('task') ?? ''

  const jobResult = useJob(jobId ?? '')
  const allocsResult = useJobAllocations(jobId ?? '')

  const job = jobResult.data as unknown as { Name?: string } | undefined
  const allocations = ((allocsResult.data as unknown) ?? []) as AllocListStub[]

  const runningAllocs = allocations.filter((a) => a.ClientStatus === 'running')

  const [selectedAllocId, setSelectedAllocId] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<string>(preselectedTask)
  const [command, setCommand] = useState('/bin/bash')

  useEffect(() => {
    if (runningAllocs.length > 0 && !selectedAllocId) {
      const firstRunning = runningAllocs[0]
      if (firstRunning) {
        setSelectedAllocId(firstRunning.ID)
        if (!selectedTask && firstRunning.TaskStates) {
          const tasks = Object.keys(firstRunning.TaskStates)
          if (tasks.length > 0) setSelectedTask(tasks[0] ?? '')
        }
      }
    }
  }, [runningAllocs, selectedAllocId, selectedTask])

  const selectedAlloc = runningAllocs.find((a) => a.ID === selectedAllocId)
  const taskNames = selectedAlloc?.TaskStates ? Object.keys(selectedAlloc.TaskStates) : []

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      e.preventDefault()
    },
    []
  )

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [handleBeforeUnload])

  if (jobResult.isLoading || allocsResult.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <PageLayout
      title="Exec"
      subtitle={job?.Name ?? jobId ?? ''}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Allocation</label>
            <select
              value={selectedAllocId}
              onChange={(e) => {
                setSelectedAllocId(e.target.value)
                setSelectedTask('')
              }}
              className="mt-1 h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              <option value="">Select allocation</option>
              {runningAllocs.map((a) => (
                <option key={a.ID} value={a.ID}>
                  {a.Name} ({a.ClientStatus})
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Task</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              disabled={!selectedAllocId}
            >
              <option value="">Select task</option>
              {taskNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Command</label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm font-mono dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              placeholder="/bin/bash"
            />
          </div>
        </div>

        {selectedAllocId && selectedTask ? (
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800" style={{ minHeight: 500 }}>
            <ExecTerminal
              allocationId={selectedAllocId}
              task={selectedTask}
              command={command}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-12 dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500">
              {!selectedAllocId
                ? 'Select an allocation to start a terminal session'
                : 'Select a task to start a terminal session'}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
