import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { TaskState, TaskStateEvent } from '@/api/types/allocation'

interface TaskStatusTableProps {
  taskStates: Record<string, TaskState>
}

const taskStateVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  running: 'success',
  pending: 'warning',
  dead: 'danger',
  failed: 'danger',
  complete: 'info',
  unknown: 'neutral',
}

export function TaskStatusTable({ taskStates }: TaskStatusTableProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  const entries = Object.entries(taskStates)

  return (
    <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Task Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">State</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Started</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Finished</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Events</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Restarts</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, state]) => (
              <TaskRow
                key={name}
                name={name}
                state={state}
                isExpanded={expandedTask === name}
                onToggle={() => setExpandedTask(expandedTask === name ? null : name)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TaskRow({
  name,
  state,
  isExpanded,
  onToggle,
}: {
  name: string
  state: TaskState
  isExpanded: boolean
  onToggle: () => void
}) {
  const recentEvents = (state.Events ?? []).slice(0, 5)

  return (
    <>
      <tr
        className="cursor-pointer border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
        onClick={onToggle}
      >
        <td className="px-4 py-3 font-medium">{name}</td>
        <td className="px-4 py-3">
          <Badge variant={taskStateVariantMap[state.State] ?? 'neutral'} size="sm">
            {state.State}
          </Badge>
        </td>
        <td className="px-4 py-3 text-xs text-neutral-500">
          {state.StartedAt ? new Date(state.StartedAt).toLocaleString() : '—'}
        </td>
        <td className="px-4 py-3 text-xs text-neutral-500">
          {state.FinishedAt ? new Date(state.FinishedAt).toLocaleString() : '—'}
        </td>
        <td className="px-4 py-3 text-xs text-neutral-500">{state.Events?.length ?? 0}</td>
        <td className="px-4 py-3 text-xs text-neutral-500">{state.Restarts ?? 0}</td>
        <td className="px-4 py-3">
          <svg
            className={`h-4 w-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/30">
          <td colSpan={7} className="px-4 py-3">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">Recent Events</div>
              {recentEvents.length === 0 ? (
                <p className="text-xs text-neutral-400">No events</p>
              ) : (
                <div className="space-y-1">
                  {recentEvents.map((event, i) => (
                    <EventRow key={i} event={event} />
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function EventRow({ event }: { event: TaskStateEvent }) {
  return (
    <div className="flex items-start gap-3 text-xs">
      <span className="w-36 shrink-0 text-neutral-400">
        {event.Time ? new Date(event.Time / 1_000_000).toLocaleString() : '—'}
      </span>
      <Badge variant="neutral" size="sm">{event.Type}</Badge>
      <span className="text-neutral-600 dark:text-neutral-300">
        {event.DisplayMessage || event.Message || event.DriverMessage || ''}
      </span>
    </div>
  )
}
