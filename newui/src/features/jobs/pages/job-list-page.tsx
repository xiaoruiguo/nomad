import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobList } from '@/api/hooks';
import { useNodePools } from '@/api/hooks';
import { useJobFilters } from '../hooks/use-job-filters';
import { useSystemStore } from '@/stores/system-store';
import { useSettingsStore } from '@/stores/settings-store';
import { JobFilterBar } from '../components/job-filter-bar';
import { JobTable } from '../components/job-table';
import { Button } from '@/components/ui/button';
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

  const { data: nodePoolsRaw } = useNodePools();

  const nodePools = useMemo(() => {
    const apiPools = (nodePoolsRaw || []).map((p) => p.Name);
    if (apiPools.length > 0) return apiPools.sort();
    if (!jobs || jobs.length === 0) return [];
    const derivedPools = new Set(jobs.map((j) => j.NodePool || 'default'));
    return Array.from(derivedPools).sort();
  }, [nodePoolsRaw, jobs]);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">
          Failed to load jobs: {error.message}
        </div>
      </div>
    );
  }

  if (isLoading && !jobs) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
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
          <div className="ml-auto">
            <Button variant="primary" onClick={() => navigate('/jobs/run')}>
              Run Job
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900">
          {hasActiveFilters ? (
            <>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">No Matches</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                No jobs match your current filter selection; (NodePool == &quot;all&quot; or NodePool
                == &quot;default&quot;).
              </p>
              <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Did you know: you can try using filter expressions to search through your
                jobs. Try{' '}
                <button
                  type="button"
                  onClick={() => { setSearch('(dc1 in Datacenters)'); }}
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  (dc1 in Datacenters)
                </button>{' '}
                or{' '}
                <button
                  type="button"
                  onClick={() => { setSearch('(dc2 in Datacenters)'); }}
                  className="inline-flex items-center gap-0.5 font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  (dc2 in Datacenters)
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Reset Filters
                </button>
                <a
                  href="https://developer.hashicorp.com/nomad/api-docs#creating-expressions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Learn more about Filter Expressions
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/jobs/run')}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Run a New Job
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">No Jobs</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                No jobs found.
              </p>
              <button
                type="button"
                onClick={() => navigate('/jobs/run')}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Run a New Job
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-2">
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
        <div className="ml-auto flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <input
              type="checkbox"
              checked={liveUpdate}
              onChange={(e) => setLiveUpdate(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-600"
            />
            Live Update
          </label>
          <Button variant="primary" onClick={() => navigate('/jobs/run')}>
            Run Job
          </Button>
        </div>
      </div>

      <JobTable jobs={jobs} loading={isLoading} />
    </div>
  );
}
