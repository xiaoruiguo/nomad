import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import type { JobListStub } from '@/api/types/job';
import { formatTime } from '@/lib/utils';

const STATUS_VARIANT_MAP: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  running: 'success',
  pending: 'warning',
  failed: 'danger',
  dead: 'neutral',
};

const TYPE_VARIANT_MAP: Record<string, 'default' | 'info' | 'neutral'> = {
  service: 'default',
  batch: 'info',
  system: 'neutral',
  sysbatch: 'neutral',
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
      key: 'Type',
      header: 'Type',
      sortable: true,
      width: '100px',
      render: (job) => (
        <Badge variant={TYPE_VARIANT_MAP[job.Type] ?? 'neutral'} size="sm">
          {job.Type}
        </Badge>
      ),
    },
    {
      key: 'Priority',
      header: 'Priority',
      sortable: true,
      width: '90px',
      render: (job) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{job.Priority}</span>
      ),
    },
    {
      key: 'Status',
      header: 'Status',
      sortable: true,
      width: '110px',
      render: (job) => (
        <Badge variant={STATUS_VARIANT_MAP[job.Status?.toLowerCase()] ?? 'neutral'} size="sm">
          {job.Status}
        </Badge>
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
      key: 'NodePool',
      header: 'Node Pool',
      sortable: true,
      width: '120px',
      render: (job) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{job.NodePool || 'default'}</span>
      ),
    },
    {
      key: 'SubmitTime',
      header: 'Submit Time',
      sortable: true,
      width: '140px',
      render: (job) => (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {job.SubmitTime ? formatTime(new Date(job.SubmitTime / 1000000).toISOString()) : '-'}
        </span>
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
