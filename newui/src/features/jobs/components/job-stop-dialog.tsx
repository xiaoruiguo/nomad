import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/form'
import { useStopJob, usePurgeJob } from '@/api/hooks'
import type { Job } from '@/api/types/job'
import { cn } from '@/lib/utils'

interface JobStopDialogProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function JobStopDialog({ job, open, onOpenChange, className }: JobStopDialogProps) {
  const stopJob = useStopJob()
  const purgeJob = usePurgeJob()
  const [purge, setPurge] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const isConfirmed = confirmText === job.Name
  const isStopped = job.Status?.toLowerCase() === 'dead' || job.Stop

  const handleStop = () => {
    if (!isConfirmed) return

    if (purge) {
      purgeJob.mutate(job.ID, {
        onSuccess: () => onOpenChange(false),
      })
    } else {
      stopJob.mutate(job.ID, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  const handleClose = () => {
    setPurge(false)
    setConfirmText('')
    onOpenChange(false)
  }

  const isLoading = stopJob.isPending || purgeJob.isPending
  const error = stopJob.error || purgeJob.error

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title={isStopped ? 'Purge Job' : 'Stop Job'}
      description={isStopped
        ? `Permanently remove "${job.Name}" from the system`
        : `Stop the job "${job.Name}"`
      }
      size="sm"
    >
      <div className={cn('space-y-4', className)}>
        <div className="rounded-md border border-warning-200 bg-warning-50 p-3 dark:border-warning-800 dark:bg-warning-900/20">
          <p className="text-sm text-warning-800 dark:text-warning-300">
            {isStopped
              ? `This will permanently purge "${job.Name}" and all its associated data. This action cannot be undone.`
              : `This will stop "${job.Name}" and terminate all running allocations. The job can be restarted later.`
            }
          </p>
        </div>

        {!isStopped && (
          <Switch
            label="Purge job"
            description="Permanently remove the job from the system"
            checked={purge}
            onChange={setPurge}
          />
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Type <span className="font-mono text-neutral-500">{job.Name}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            placeholder={job.Name}
            autoComplete="off"
          />
        </div>

        {error && (
          <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">
            {error.message || 'Failed to stop job'}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={purge || isStopped ? 'danger' : 'primary'}
            onClick={handleStop}
            loading={isLoading}
            disabled={!isConfirmed}
          >
            {purge || isStopped ? 'Purge' : 'Stop'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
