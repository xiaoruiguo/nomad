import { cn } from '@/lib/utils';
import type { JobDiff, FieldDiff, ObjectDiff, TaskGroupDiff, TaskDiff } from '@/api/types/job';

interface JobVersionDiffProps {
  diff: JobDiff;
  className?: string;
}

function DiffBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Added: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Edited: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    None: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  };
  return (
    <span className={cn('inline-flex rounded px-1.5 py-0.5 text-xs font-medium', styles[type] ?? styles.None)}>
      {type}
    </span>
  );
}

function FieldDiffRow({ field }: { field: FieldDiff }) {
  return (
    <div className="flex items-center gap-2 py-0.5 text-xs">
      <DiffBadge type={field.Type} />
      <span className="font-medium text-neutral-700 dark:text-neutral-300">{field.Name}:</span>
      {field.Old && (
        <span className="bg-red-50 px-1 text-red-700 line-through dark:bg-red-900/20 dark:text-red-400">{field.Old}</span>
      )}
      {field.New && (
        <span className="bg-green-50 px-1 text-green-700 dark:bg-green-900/20 dark:text-green-400">{field.New}</span>
      )}
      {field.Annotations?.map((a, i) => (
        <span key={i} className="text-neutral-400 italic">{a}</span>
      ))}
    </div>
  );
}

function ObjectDiffBlock({ obj, depth = 0 }: { obj: ObjectDiff; depth?: number }) {
  return (
    <div className="space-y-1" style={{ paddingLeft: depth * 16 }}>
      <div className="rounded border border-neutral-100 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2 text-xs">
          <DiffBadge type={obj.Type} />
          <span className="font-medium text-neutral-800 dark:text-neutral-200">{obj.Name}</span>
        </div>
        {obj.Fields?.map((field, i) => <FieldDiffRow key={i} field={field} />)}
        {obj.Objects?.map((child, i) => <ObjectDiffBlock key={i} obj={child} depth={depth + 1} />)}
      </div>
    </div>
  );
}

function TaskDiffBlock({ task }: { task: TaskDiff }) {
  return (
    <div className="ml-4 mt-2 rounded border border-neutral-100 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2 text-xs">
        <DiffBadge type={task.Type} />
        <span className="font-medium text-neutral-700 dark:text-neutral-300">Task: {task.Name}</span>
      </div>
      {task.Fields?.map((field, i) => <FieldDiffRow key={i} field={field} />)}
      {task.Objects?.map((obj, i) => <ObjectDiffBlock key={i} obj={obj} depth={1} />)}
    </div>
  );
}

function TaskGroupDiffBlock({ tg }: { tg: TaskGroupDiff }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2 mb-2">
        <DiffBadge type={tg.Type} />
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{tg.Name}</span>
      </div>
      {tg.Updates && Object.keys(tg.Updates).length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {Object.entries(tg.Updates).map(([action, count]) => (
            <span key={action} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {count} {action}
            </span>
          ))}
        </div>
      )}
      {tg.Fields?.map((field, i) => <FieldDiffRow key={i} field={field} />)}
      {tg.Objects?.map((obj, i) => <ObjectDiffBlock key={i} obj={obj} depth={1} />)}
      {tg.Tasks?.map((task, i) => <TaskDiffBlock key={i} task={task} />)}
    </div>
  );
}

export function JobVersionDiff({ diff, className }: JobVersionDiffProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2 mb-2">
          <DiffBadge type={diff.Type} />
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{diff.ID}</span>
        </div>
        {diff.Fields?.map((field, i) => <FieldDiffRow key={i} field={field} />)}
        {diff.Objects?.map((obj, i) => <ObjectDiffBlock key={i} obj={obj} depth={1} />)}
      </div>
      {diff.TaskGroups?.map((tg, i) => <TaskGroupDiffBlock key={i} tg={tg} />)}
    </div>
  );
}
