import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import type { JobListStub } from '@/api/types/job';

const STATUS_VARIANT_MAP: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  running: 'success',
  pending: 'warning',
  failed: 'danger',
  dead: 'neutral',
  deploying: 'info',
  stopped: 'neutral',
  complete: 'success',
};

interface JobTableProps {
  jobs: JobListStub[];
  loading?: boolean;
  onRowClick?: (job: JobListStub) => void;
}

export function JobTable({ jobs, loading = false, onRowClick }: JobTableProps) {
  const navigate = useNavigate();

  const columns: Column<JobListStub>[] = [
    {
      key: 'Name',
      header: 'Name',
      sortable: true,
      render: (job) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/jobs/${job.ID}`);
          }}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {job.Name || job.ID}
        </button>
      ),
    },
    {
      key: 'Namespace',
      header: 'Namespace',
      sortable: true,
      width: '120px',
      render: (job) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{job.Namespace}</span>
      ),
    },
    {
      key: 'Status',
      header: 'Status',
      sortable: true,
      width: '120px',
      render: (job) => {
        const status = job.Status?.toLowerCase() || '';
        return (
          <Badge variant={STATUS_VARIANT_MAP[status] ?? 'neutral'} size="sm">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'Type',
      header: 'Type',
      sortable: true,
      width: '100px',
      render: (job) => (
        <span className="text-sm text-neutral-700 dark:text-neutral-300">{job.Type}</span>
      ),
    },
    {
      key: 'NodePool',
      header: 'Node Pool',
      sortable: true,
      width: '120px',
      render: (job) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{job.NodePool || '-'}</span>
      ),
    },
  ];

  const handleRowClick = onRowClick ?? ((job: JobListStub) => navigate(`/jobs/${job.ID}`));

  return (
    <DataTable
      data={jobs}
      columns={columns}
      onRowClick={handleRowClick}
      loading={loading}
      emptyMessage="No jobs found"
      rowIdKey="ID"
    />
  );
}
