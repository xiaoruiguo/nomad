import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/form'
import { Modal } from '@/components/ui/modal'
import { useScaleJob } from '@/api/hooks'
import type { Job } from '@/api/types/job'
import { cn } from '@/lib/utils'

interface JobScaleFormProps {
  job: Job
  onClose: () => void
  className?: string
}

export function JobScaleForm({ job, onClose, className }: JobScaleFormProps) {
  const scaleJob = useScaleJob()
  const [selectedGroup, setSelectedGroup] = useState(job.TaskGroups?.[0]?.Name ?? '')
  const [count, setCount] = useState<string>(String(job.TaskGroups?.[0]?.Count ?? 1))
  const [message, setMessage] = useState('')

  const taskGroupOptions = (job.TaskGroups ?? []).map((tg) => ({
    value: tg.Name,
    label: `${tg.Name} (current: ${tg.Count})`,
  }))

  const selectedTg = job.TaskGroups?.find((tg) => tg.Name === selectedGroup)
  const currentCount = selectedTg?.Count ?? 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup || count === '') return

    scaleJob.mutate(
      {
        id: job.ID,
        request: {
          Count: parseInt(count, 10),
          Message: message,
          Target: { Name: selectedGroup },
        },
      },
      {
        onSuccess: () => onClose(),
      }
    )
  }

  return (
    <Modal
      open={true}
      onOpenChange={(open) => { if (!open) onClose() }}
      title={`Scale ${job.Name}`}
      description="Adjust the count of a task group"
      size="sm"
    >
      <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
        <Select
          label="Task Group"
          options={taskGroupOptions}
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value)
            const tg = job.TaskGroups?.find((g) => g.Name === e.target.value)
            setCount(String(tg?.Count ?? 1))
          }}
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Count
            </label>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Current: {currentCount}
            </span>
          </div>
          <Input
            type="number"
            min="0"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>

        <Input
          label="Message"
          placeholder="Reason for scaling (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {scaleJob.isError && (
          <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">
            {scaleJob.error?.message || 'Failed to scale job'}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={scaleJob.isPending}
            disabled={!selectedGroup || count === '' || parseInt(count, 10) < 0}
          >
            Scale
          </Button>
        </div>
      </form>
    </Modal>
  )
}
