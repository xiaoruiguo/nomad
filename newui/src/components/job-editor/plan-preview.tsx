import type { JobPlanResponse, FieldDiff, ObjectDiff, TaskGroupDiff } from '@/api/types/job'
import { cn } from '@/lib/utils'

interface PlanPreviewProps {
  plan: JobPlanResponse
  className?: string
}

function DiffTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Added: 'bg-green-100 text-green-800',
    Deleted: 'bg-red-100 text-red-800',
    Edited: 'bg-yellow-100 text-yellow-800',
    None: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', colors[type] ?? 'bg-gray-100 text-gray-600')}>
      {type}
    </span>
  )
}

function renderFieldDiffs(fields: FieldDiff[], depth: number = 0): React.ReactNode {
  if (!fields || fields.length === 0) return null
  return (
    <div className="space-y-0.5" style={{ paddingLeft: depth * 16 }}>
      {fields.map((field, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <DiffTypeBadge type={field.Type} />
          <span className="font-medium text-gray-700">{field.Name}:</span>
          {field.Old && (
            <span className="text-red-600 line-through">{field.Old}</span>
          )}
          {field.New && (
            <span className="text-green-600">{field.New}</span>
          )}
          {field.Annotations?.map((a, j) => (
            <span key={j} className="text-gray-400 italic">{a}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

function renderObjectDiffs(objects: ObjectDiff[], depth: number = 0): React.ReactNode {
  if (!objects || objects.length === 0) return null
  return (
    <div className="space-y-1" style={{ paddingLeft: depth * 16 }}>
      {objects.map((obj, i) => (
        <div key={i} className="rounded border border-gray-100 bg-gray-50 p-2">
          <div className="flex items-center gap-2 text-xs mb-1">
            <DiffTypeBadge type={obj.Type} />
            <span className="font-medium text-gray-800">{obj.Name}</span>
          </div>
          {renderFieldDiffs(obj.Fields, depth + 1)}
          {renderObjectDiffs(obj.Objects, depth + 1)}
        </div>
      ))}
    </div>
  )
}

function renderTaskGroupDiffs(groups: TaskGroupDiff[]): React.ReactNode {
  if (!groups || groups.length === 0) return null
  return (
    <div className="space-y-2">
      {groups.map((tg, i) => (
        <div key={i} className="rounded-md border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-2 mb-2">
            <DiffTypeBadge type={tg.Type} />
            <span className="text-sm font-semibold text-gray-800">{tg.Name}</span>
          </div>
          {tg.Updates && Object.keys(tg.Updates).length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {Object.entries(tg.Updates).map(([action, count]) => (
                <span key={action} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {count} {action}
                </span>
              ))}
            </div>
          )}
          {renderFieldDiffs(tg.Fields, 1)}
          {renderObjectDiffs(tg.Objects, 1)}
          {tg.Tasks?.map((task, j) => (
            <div key={j} className="ml-4 mt-2 rounded border border-gray-100 bg-gray-50 p-2">
              <div className="flex items-center gap-2 text-xs mb-1">
                <DiffTypeBadge type={task.Type} />
                <span className="font-medium text-gray-700">Task: {task.Name}</span>
              </div>
              {renderFieldDiffs(task.Fields, 2)}
              {renderObjectDiffs(task.Objects, 2)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function PlanPreview({ plan, className }: PlanPreviewProps) {
  const diff = plan.JobDiff
  const failedTGAllocs = plan.FailedTGAllocs

  return (
    <div className={cn('space-y-4', className)}>
      {diff && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Job Diff</h3>
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <DiffTypeBadge type={diff.Type} />
              <span className="text-sm font-semibold text-gray-800">{diff.ID}</span>
            </div>
            {renderFieldDiffs(diff.Fields, 1)}
            {renderObjectDiffs(diff.Objects, 1)}
            {renderTaskGroupDiffs(diff.TaskGroups)}
          </div>
        </div>
      )}

      {failedTGAllocs && Object.keys(failedTGAllocs).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-red-700">Failed Allocations</h3>
          <div className="space-y-2">
            {Object.entries(failedTGAllocs).map(([tgName, metrics]) => (
              <div key={tgName} className="rounded-md border border-red-200 bg-red-50 p-3">
                <h4 className="text-xs font-medium text-red-800">{tgName}</h4>
                <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-red-700">
                  <span>Nodes exhausted: {metrics.NodesExhausted}</span>
                  <span>Nodes filtered: {metrics.NodesFiltered}</span>
                  <span>Constraint filtered: {metrics.ConstraintFiltered}</span>
                  <span>Coalesced failures: {metrics.CoalescedFailures}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.Warnings && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          {plan.Warnings}
        </div>
      )}
    </div>
  )
}
