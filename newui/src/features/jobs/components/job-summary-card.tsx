import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import type { JobSummary, TaskGroupSummary } from '@/api/types/job';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-success-500',
  complete: 'bg-blue-500',
  pending: 'bg-warning-500',
  failed: 'bg-danger-500',
  lost: 'bg-danger-400',
  starting: 'bg-blue-400',
  queued: 'bg-warning-400',
  unknown: 'bg-neutral-400',
};

interface JobSummaryCardProps {
  summary: JobSummary | undefined;
  className?: string;
}

export function JobSummaryCard({ summary, className }: JobSummaryCardProps) {
  const totals = useMemo(() => {
    const result = {
      running: 0,
      pending: 0,
      failed: 0,
      complete: 0,
      lost: 0,
      unknown: 0,
    };

    if (!summary?.Summary) return result;

    for (const tgSummary of Object.values(summary.Summary)) {
      const tg = tgSummary as TaskGroupSummary;
      result.running += tg.Running ?? 0;
      result.pending += tg.Queued ?? 0;
      result.failed += tg.Failed ?? 0;
      result.complete += tg.Complete ?? 0;
      result.lost += tg.Lost ?? 0;
      result.unknown += tg.Unknown ?? 0;
    }

    return result;
  }, [summary]);

  const totalAllocs = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <Card title="Allocation Summary" className={className}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Total: {totalAllocs}
          </span>
        </div>

        <div className="flex gap-1 h-6 overflow-hidden rounded">
          {totalAllocs > 0 &&
            Object.entries(totals)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => {
                const pct = (count / totalAllocs) * 100;
                return (
                  <div
                    key={status}
                    className={cn('h-full transition-all', STATUS_COLORS[status] ?? 'bg-neutral-400')}
                    style={{ width: `${pct}%` }}
                    title={`${status}: ${count}`}
                  />
                );
              })}
        </div>

        <div className="flex flex-wrap gap-3">
          {Object.entries(totals)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={cn('h-2.5 w-2.5 rounded-sm', STATUS_COLORS[status] ?? 'bg-neutral-400')} />
                <span className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">{status}</span>
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}
