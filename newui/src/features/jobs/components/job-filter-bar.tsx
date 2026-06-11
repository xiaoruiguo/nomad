import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/ui/search-input';
import type { JobFilters as JobFiltersType } from '../hooks/use-job-filters';

const STATUS_OPTIONS = [
  { value: 'running', label: 'Running', variant: 'success' as const },
  { value: 'pending', label: 'Pending', variant: 'warning' as const },
  { value: 'failed', label: 'Failed', variant: 'danger' as const },
  { value: 'dead', label: 'Dead', variant: 'neutral' as const },
];

const TYPE_OPTIONS = [
  { value: 'service', label: 'Service' },
  { value: 'batch', label: 'Batch' },
  { value: 'system', label: 'System' },
  { value: 'sysbatch', label: 'Sysbatch' },
];

interface JobFilterBarProps {
  filters: JobFiltersType;
  onSearchChange: (search: string) => void;
  onToggleStatus: (status: string) => void;
  onToggleType: (type: string) => void;
  onNamespaceChange: (ns: string) => void;
  onNodePoolChange: (pool: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  namespaces: { Name: string }[];
  nodePools: string[];
}

export function JobFilterBar({
  filters,
  onSearchChange,
  onToggleStatus,
  onToggleType,
  onNamespaceChange,
  onNodePoolChange,
  onClearAll,
  hasActiveFilters,
  namespaces,
  nodePools,
}: JobFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="min-w-[280px] flex-1 max-w-md">
          <SearchInput
            value={filters.search}
            onChange={onSearchChange}
            placeholder='Search jobs (e.g. status:running type:service "my-job")'
          />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Status:</span>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = filters.statuses.includes(opt.value as never);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onToggleStatus(opt.value)}
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                  isActive
                    ? opt.variant === 'success'
                      ? 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                      : opt.variant === 'warning'
                        ? 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                        : opt.variant === 'danger'
                          ? 'bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Type:</span>
          {TYPE_OPTIONS.map((opt) => {
            const isActive = filters.types.includes(opt.value as never);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onToggleType(opt.value)}
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {namespaces.length > 1 && (
          <>
            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Namespace:</span>
              <select
                value={filters.namespace}
                onChange={(e) => onNamespaceChange(e.target.value)}
                className="h-7 rounded-md border border-neutral-200 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="">All</option>
                {namespaces.map((ns) => (
                  <option key={ns.Name} value={ns.Name}>
                    {ns.Name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {nodePools.length > 1 && (
          <>
            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Node Pool:</span>
              <select
                value={filters.nodePool}
                onChange={(e) => onNodePoolChange(e.target.value)}
                className="h-7 rounded-md border border-neutral-200 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="">All</option>
                {nodePools.map((pool) => (
                  <option key={pool} value={pool}>
                    {pool}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
