import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobList } from '@/api/hooks';
import { useJobFilters } from '../hooks/use-job-filters';
import { useSystemStore } from '@/stores/system-store';
import { useSettingsStore } from '@/stores/settings-store';
import { JobFilterBar } from '../components/job-filter-bar';
import { JobTable } from '../components/job-table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/form';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function JobListPage() {
  const navigate = useNavigate();
  const namespaces = useSystemStore((s) => s.namespaces);
  const liveUpdate = useSettingsStore((s) => s.liveUpdateJobsIndex);
  const setLiveUpdate = useSettingsStore((s) => s.setLiveUpdateJobsIndex);

  const {
    filters,
    setSearch,
    toggleStatus,
    toggleType,
    setNamespace,
    setNodePool,
    clearAll,
    apiParams,
    hasActiveFilters,
  } = useJobFilters();

  const { data: jobs, isLoading, error } = useJobList(
    liveUpdate ? apiParams : { ...apiParams, wait: undefined }
  );

  const nodePools = useMemo(() => {
    if (!jobs) return [];
    const pools = new Set(jobs.map((j) => j.NodePool || 'default'));
    return Array.from(pools).sort();
  }, [jobs]);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">
          Failed to load jobs: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Jobs</h1>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            Manage and monitor Nomad jobs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            label="Live update"
            checked={liveUpdate}
            onChange={setLiveUpdate}
          />
          <Button variant="primary" onClick={() => navigate('/jobs/run')}>
            Run Job
          </Button>
        </div>
      </div>

      <JobFilterBar
        filters={filters}
        onSearchChange={setSearch}
        onToggleStatus={toggleStatus}
        onToggleType={toggleType}
        onNamespaceChange={setNamespace}
        onNodePoolChange={setNodePool}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        namespaces={namespaces}
        nodePools={nodePools}
      />

      {isLoading && !jobs ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : jobs && jobs.length === 0 && !hasActiveFilters ? (
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          title="No jobs found"
          description="Get started by running your first job"
          action={{ label: 'Run Job', onClick: () => navigate('/jobs/run') }}
        />
      ) : (
        <JobTable jobs={jobs ?? []} loading={isLoading} />
      )}
    </div>
  );
}
