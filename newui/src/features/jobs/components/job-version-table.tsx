import { useState } from 'react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useRevertJob } from '@/api/hooks'
import type { Job } from '@/api/types/job'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface JobVersionTableProps {
  versions: Job[]
  currentVersion: number
  jobId: string
  className?: string
}

export function JobVersionTable({ versions, currentVersion, jobId, className }: JobVersionTableProps) {
  const revertJob = useRevertJob()
  const [diffOpen, setDiffOpen] = useState(false)
  const [diffVersions, setDiffVersions] = useState<[Job, Job] | null>(null)
  const [revertOpen, setRevertOpen] = useState(false)
  const [revertVersion, setRevertVersion] = useState<number | null>(null)

  const sortedVersions = [...versions].sort((a, b) => b.Version - a.Version)

  const handleDiff = (version: Job) => {
    const current = versions.find((v) => v.Version === currentVersion)
    if (current) {
      setDiffVersions([current, version])
      setDiffOpen(true)
    }
  }

  const handleRevert = (version: number) => {
    setRevertVersion(version)
    setRevertOpen(true)
  }

  const confirmRevert = () => {
    if (revertVersion != null) {
      revertJob.mutate(
        { id: jobId, version: revertVersion },
        { onSuccess: () => setRevertOpen(false) }
      )
    }
  }

  const columns: Column<Job>[] = [
    {
      key: 'Version',
      header: 'Version',
      sortable: true,
      width: '100px',
      render: (version) => (
        <span className={cn(
          'text-sm font-medium',
          version.Version === currentVersion
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-neutral-700 dark:text-neutral-300'
        )}>
          {version.Version}
          {version.Version === currentVersion && (
            <span className="ml-2 text-xs font-normal text-primary-500">(current)</span>
          )}
        </span>
      ),
    },
    {
      key: 'Stable',
      header: 'Stable',
      width: '100px',
      render: (version) => (
        <Badge variant={version.Stable ? 'success' : 'neutral'} size="sm">
          {version.Stable ? 'Stable' : 'Unstable'}
        </Badge>
      ),
    },
    {
      key: 'SubmitTime',
      header: 'Submit Time',
      sortable: true,
      width: '160px',
      render: (version) => (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {version.SubmitTime ? formatTime(new Date(version.SubmitTime / 1000000).toISOString()) : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '200px',
      render: (version) => (
        <div className="flex items-center gap-2">
          {version.Version !== currentVersion && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDiff(version)
                }}
              >
                Diff
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRevert(version.Version)
                }}
              >
                Revert
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className={cn(className)}>
      <DataTable
        data={sortedVersions}
        columns={columns}
        emptyMessage="No versions found"
        rowIdKey="Version"
      />

      {diffOpen && diffVersions && (
        <Modal
          open={diffOpen}
          onOpenChange={setDiffOpen}
          title={`Version Diff: ${diffVersions[1].Version} → ${diffVersions[0].Version}`}
          size="xl"
        >
          <div className="max-h-[60vh] overflow-y-auto">
            <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
              Comparing version {diffVersions[1].Version} with version {diffVersions[0].Version}
            </p>
            <div className="space-y-2">
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Version {diffVersions[1].Version}
                </h4>
                <pre className="overflow-auto text-xs text-neutral-700 dark:text-neutral-300">
                  {JSON.stringify(diffVersions[1], null, 2)}
                </pre>
              </div>
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Version {diffVersions[0].Version}
                </h4>
                <pre className="overflow-auto text-xs text-neutral-700 dark:text-neutral-300">
                  {JSON.stringify(diffVersions[0], null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        open={revertOpen}
        onOpenChange={setRevertOpen}
        title="Revert Job Version"
        description={`Revert to version ${revertVersion}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            This will revert the job to version {revertVersion}. The current version ({currentVersion}) will be replaced with the specification from version {revertVersion}.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRevertOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmRevert}
              loading={revertJob.isPending}
            >
              Revert
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
