import type { UpdateStrategy } from '@/api/types/job'
import { formatDuration } from '@/lib/utils'

interface UpdateParamsProps {
  update: UpdateStrategy
}

export function UpdateParams({ update }: UpdateParamsProps) {
  if (!update) return null

  const rows: { label: string; value: string }[] = []

  if (update.Stagger) {
    rows.push({ label: 'Stagger', value: formatDuration(update.Stagger / 1_000_000) })
  }
  if (update.MaxParallel) {
    rows.push({ label: 'Max Parallel', value: String(update.MaxParallel) })
  }
  if (update.HealthCheck) {
    rows.push({ label: 'Health Check', value: update.HealthCheck })
  }
  if (update.MinHealthyTime) {
    rows.push({ label: 'Min Healthy Time', value: formatDuration(update.MinHealthyTime / 1_000_000) })
  }
  if (update.HealthyDeadline) {
    rows.push({ label: 'Healthy Deadline', value: formatDuration(update.HealthyDeadline / 1_000_000) })
  }
  if (update.ProgressDeadline) {
    rows.push({ label: 'Progress Deadline', value: formatDuration(update.ProgressDeadline / 1_000_000) })
  }
  if (update.AutoRevert) {
    rows.push({ label: 'Auto Revert', value: 'true' })
  }
  if (update.AutoPromote) {
    rows.push({ label: 'Auto Promote', value: 'true' })
  }
  if (update.Canary) {
    rows.push({ label: 'Canary', value: String(update.Canary) })
  }

  if (rows.length === 0) return null

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Update Strategy</h4>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-0.5">
            <dt className="text-gray-500">{label}</dt>
            <dd className="font-mono text-xs">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
